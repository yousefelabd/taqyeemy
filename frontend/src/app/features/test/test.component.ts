import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TestService } from '../../core/services/test.service';
import { ResultsService } from '../../core/services/results.service';
import { Question } from '../../core/models/test.model';
import { SpeakingUploadComponent } from './speaking-upload/speaking-upload.component';
import { SpeakingAnalysisResult } from '../../core/models/result.model';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    SpeakingUploadComponent,
  ],
  template: `
    @if (session()) {
      <div class="page-container test-page">
        <!-- Progress Header -->
        <div class="test-header">
          <div class="test-meta">
            <span class="test-type-label">
              {{ session()!.testType === 'placement' ? 'تحديد المستوى' : 'اختبار مستوى ' + session()!.targetLevel }}
            </span>
            <span class="question-counter">
              @if (phase() === 'mcq') {
                سؤال الاختياري رقم {{ mcqIndex() + 1 }}
              } @else if (phase() === 'writing') {
                مرحلة الكتابة (البراجراف)
              } @else {
                مرحلة التحدث الصوتي (السؤال الأخير)
              }
            </span>
          </div>
          <mat-progress-bar mode="determinate" [value]="progressPercent()" class="progress-bar" />
        </div>

        <!-- Question Card -->
        @if (currentQuestion()) {
          <mat-card class="question-card">
            <mat-card-content>
              <div class="skill-badge">
                <mat-icon>{{ skillIcon(currentQuestion()!.skill) }}</mat-icon>
                {{ skillLabel(currentQuestion()!.skill) }}
              </div>

              <p class="question-text" dir="ltr">{{ currentQuestion()!.text }}</p>

              <!-- Multiple Choice -->
              @if (currentQuestion()!.type === 'multiple-choice') {
                <div class="options-list">
                  @for (option of currentQuestion()!.options; track option.id) {
                    <div
                      class="option-item"
                      [class.selected]="currentAnswer() === option.id"
                      (click)="selectAnswer(option.id)">
                      <mat-icon class="radio-icon">
                        {{ currentAnswer() === option.id ? 'radio_button_checked' : 'radio_button_unchecked' }}
                      </mat-icon>
                      <span dir="ltr">{{ option.text }}</span>
                    </div>
                  }
                </div>
              }

              <!-- Open Text -->
              @if (currentQuestion()!.type === 'open-text') {
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>اكتب إجابتك هنا بالإنجليزية</mat-label>
                  <textarea
                    matInput
                    rows="5"
                    dir="ltr"
                    [(ngModel)]="openTextAnswer"
                    placeholder="Write your answer in English..."
                    (ngModelChange)="selectAnswer($event)">
                  </textarea>
                  <mat-hint>اكتب بالإنجليزية — الواجهة عربية فقط</mat-hint>
                </mat-form-field>
              }

              <!-- Speaking Upload -->
              @if (currentQuestion()!.type === 'speaking') {
                <app-speaking-upload
                  [questionText]="currentQuestion()!.text"
                  (analyzed)="onSpeakingAnalyzed($event)" />
              }
            </mat-card-content>

            <mat-card-actions class="card-actions">
              <button mat-stroked-button (click)="previousQuestion()" [disabled]="!canGoPrevious() || isSubmitting">
                <mat-icon>arrow_forward</mat-icon>
                السابق
              </button>

              @if (isLastQuestion()) {
                <button
                  mat-raised-button
                  color="primary"
                  [disabled]="!currentAnswer() || isSubmitting"
                  (click)="submitTest()">
                  @if (isSubmitting) {
                    <mat-spinner diameter="20" />
                  } @else {
                    <mat-icon>check_circle</mat-icon>
                    إنهاء الاختبار وعرض النتيجة
                  }
                </button>
              } @else {
                <button mat-raised-button color="primary" [disabled]="!currentAnswer() || isSubmitting" (click)="nextQuestion()">
                  التالي
                  <mat-icon>arrow_back</mat-icon>
                </button>
              }
            </mat-card-actions>
          </mat-card>
        }
      </div>
    } @else {
      <div class="no-session">
        <mat-icon>warning</mat-icon>
        <p>لا يوجد اختبار نشط. يرجى العودة واختيار نوع الاختبار.</p>
        <button mat-raised-button color="primary" (click)="router.navigate(['/test-selection'])">
          اختيار الاختبار
        </button>
      </div>
    }
  `,
  styles: [`
    .test-page { max-width: 800px; }
    .test-header { margin-bottom: 32px; }
    .test-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .test-type-label { font-weight: 700; color: var(--mat-sys-primary); font-size: 16px; }
    .question-counter { color: var(--mat-sys-on-surface-variant); font-size: 14px; }
    .progress-bar { height: 8px; border-radius: 4px; }
    .question-card { padding: 8px; }
    .skill-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
    .skill-badge mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .question-text { font-size: 1.2rem; font-weight: 500; line-height: 1.7; margin: 0 0 28px; }
    .options-list { display: flex; flex-direction: column; gap: 12px; }
    .option-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 2px solid var(--mat-sys-outline-variant); border-radius: 10px; cursor: pointer; transition: all 0.15s; font-size: 15px; }
    .option-item:hover { border-color: var(--mat-sys-primary); background: var(--mat-sys-primary-container); }
    .option-item.selected { border-color: var(--mat-sys-primary); background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .radio-icon { color: var(--mat-sys-primary); }
    .full-width { width: 100%; margin-top: 8px; }
    .card-actions { display: flex; justify-content: space-between; padding: 8px 16px 16px; }
    .no-session { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; gap: 16px; text-align: center; }
    .no-session mat-icon { font-size: 64px; width: 64px; height: 64px; color: var(--mat-sys-on-surface-variant); }
  `]
})
export class TestComponent implements OnInit {
  private testService = inject(TestService);
  private resultsService = inject(ResultsService);
  public router = inject(Router);

  session = this.testService.currentSession;

  // مراحل الاختبار: الاختياري (mcq) -> البراجراف الواحد (writing) -> السؤال الصوتي الواحد (speaking)
  phase = signal<'mcq' | 'writing' | 'speaking'>('mcq');
  mcqIndex = signal(0);
  stoppedLevel = signal<string>('A1');

  openTextAnswer = '';
  isSubmitting = false;

  mcqQuestions = computed(() =>
    (this.session()?.questions ?? []).filter((q) => q.type === 'multiple-choice'),
  );

  writingQuestions = computed(() =>
    (this.session()?.questions ?? []).filter((q) => q.type === 'open-text'),
  );

  speakingQuestions = computed(() =>
    (this.session()?.questions ?? []).filter((q) => q.type === 'speaking'),
  );

  selectedWritingQuestion = computed((): Question | null => {
    const list = this.writingQuestions();
    if (list.length === 0) return null;
    const match = list.find((q) => q.targetLevel === this.stoppedLevel());
    return match ?? list[0];
  });

  selectedSpeakingQuestion = computed((): Question | null => {
    const list = this.speakingQuestions();
    if (list.length === 0) return null;
    const match = list.find((q) => q.targetLevel === this.stoppedLevel());
    return match ?? list[0];
  });

  currentQuestion = computed((): Question | null => {
    const currentPhase = this.phase();
    if (currentPhase === 'mcq') {
      return this.mcqQuestions()[this.mcqIndex()] ?? null;
    }
    if (currentPhase === 'writing') {
      return this.selectedWritingQuestion();
    }
    return this.selectedSpeakingQuestion();
  });

  progressPercent = computed(() => {
    const currentPhase = this.phase();
    if (currentPhase === 'speaking') return 100;
    if (currentPhase === 'writing') return 88;
    const totalMcq = this.mcqQuestions().length || 1;
    return Math.min(80, Math.round(((this.mcqIndex() + 1) / totalMcq) * 80));
  });

  isLastQuestion = computed(() => this.phase() === 'speaking');

  canGoPrevious = computed(() => this.phase() === 'speaking');

  currentAnswer = computed(() => {
    const q = this.currentQuestion();
    return q ? (this.session()?.answers[q.id] ?? '') : '';
  });

  ngOnInit(): void {
    if (!this.session()) {
      this.router.navigate(['/test-selection']);
    }
  }

  selectAnswer(answer: string): void {
    const q = this.currentQuestion();
    if (q) this.testService.submitAnswer(q.id, answer);
  }

  onSpeakingAnalyzed(result: SpeakingAnalysisResult): void {
    const jsonString = JSON.stringify(result);
    this.selectAnswer(jsonString);
  }

  private isMcqWrong(q: Question, selectedOptionId?: string): boolean {
    if (!q.checkKey || !selectedOptionId) return false;
    try {
      const encoded = btoa(`${q.id}:${selectedOptionId}`);
      return encoded !== q.checkKey;
    } catch {
      return false;
    }
  }

  nextQuestion(): void {
    const currentPhase = this.phase();

    if (currentPhase === 'mcq') {
      const mcqs = this.mcqQuestions();
      const idx = this.mcqIndex();
      const currentQ = mcqs[idx];
      const currentLvl = currentQ?.targetLevel || 'A1';
      const answers = this.session()?.answers ?? {};

      // حساب عدد الأخطاء في المستوى الحالي حتى السؤال الحالي
      const mistakesInCurrentLevel = mcqs
        .slice(0, idx + 1)
        .filter((q) => q.targetLevel === currentLvl && this.isMcqWrong(q, answers[q.id]))
        .length;

      // إذا وصل لـ 3 أخطاء في المستوى الحالي أو أنهى آخر سؤال اختياري -> ينتقل فوراً لسؤال البراجراف
      if (mistakesInCurrentLevel >= 3 || idx >= mcqs.length - 1) {
        this.stoppedLevel.set(currentLvl);
        this.phase.set('writing');
        this.openTextAnswer = this.currentAnswer();
        return;
      }

      // غير ذلك يكمل للسؤال التالي
      this.mcqIndex.set(idx + 1);
      return;
    }

    if (currentPhase === 'writing') {
      this.phase.set('speaking');
    }
  }

  previousQuestion(): void {
    if (this.phase() === 'speaking') {
      this.phase.set('writing');
      this.openTextAnswer = this.currentAnswer();
    }
  }

  async submitTest(): Promise<void> {
    this.isSubmitting = true;
    try {
      const result = await this.testService.submitAndEvaluate();
      this.resultsService.setLatestResult(result);
      this.router.navigate(['/result', result.id]);
    } finally {
      this.isSubmitting = false;
    }
  }

  skillIcon(skill: string): string {
    const icons: Record<string, string> = { grammar: 'rule', vocabulary: 'library_books', reading: 'menu_book', writing: 'edit_note', speaking: 'mic' };
    return icons[skill] ?? 'quiz';
  }

  skillLabel(skill: string): string {
    const labels: Record<string, string> = { grammar: 'قواعد', vocabulary: 'مفردات', reading: 'قراءة', writing: 'كتابة', speaking: 'تحدث' };
    return labels[skill] ?? skill;
  }
}
