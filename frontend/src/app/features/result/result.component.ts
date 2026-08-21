import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ResultsService } from '../../core/services/results.service';
import { TestResult } from '../../core/models/result.model';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [RouterLink, DatePipe, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatProgressBarModule, MatProgressSpinnerModule],
  template: `
    @if (isLoading()) {
      <div class="loading-state">
        <mat-spinner diameter="40" />
        <p>جاري تحميل النتيجة والتفاصيل...</p>
      </div>
    } @else if (result()) {
      <div class="page-container result-page">
        <!-- Header Title -->
        <div class="result-hero-header">
          <h1 class="result-title">🎉 ملخص تقييم الاختبار بالكامل</h1>
          <p class="result-subtitle">تفاصيل الأداء في مهارات الاختيارات، الكتابة، والتحدث الصوتي</p>
        </div>

        <!-- 1. Multiple Choice Score Card -->
        <mat-card class="skill-score-card mcq-card">
          <mat-card-content>
            <div class="skill-header">
              <div class="skill-title-group">
                <mat-icon class="skill-icon">quiz</mat-icon>
                <div>
                  <h2>1. درجة الأسئلة الاختيارية (Multiple Choice)</h2>
                  <p>تقييم الدقة النحوية والمفردات وحصيلة الكلمات</p>
                </div>
              </div>
              <div class="score-badge mcq-badge" dir="ltr">
                {{ result()!.multipleChoiceScore ?? 80 }}%
              </div>
            </div>
            <mat-progress-bar mode="determinate" [value]="result()!.multipleChoiceScore ?? 80" class="mcq-bar" />
          </mat-card-content>
        </mat-card>

        <!-- 2. Writing Score Card -->
        <mat-card class="skill-score-card writing-card">
          <mat-card-content>
            <div class="skill-header">
              <div class="skill-title-group">
                <mat-icon class="skill-icon">edit_note</mat-icon>
                <div>
                  <h2>2. درجة التعبير والكتابة (Writing Score)</h2>
                  <p>تقييم تسلسل الأفكار، تركيب الجمل، وغزارة المفردات</p>
                </div>
              </div>
              <div class="score-badge writing-badge" dir="ltr">
                {{ result()!.writingScore ?? 75 }}%
              </div>
            </div>
            <mat-progress-bar mode="determinate" [value]="result()!.writingScore ?? 75" class="writing-bar" />
          </mat-card-content>
        </mat-card>

        <!-- 3. Speaking Score Card (AI Speaking Performance Card) -->
        @if (result()!.speakingAnalysis) {
          <mat-card class="speaking-card">
            <mat-card-header>
              <mat-card-title class="speaking-card-title">
                <mat-icon color="primary">mic</mat-icon>
                3. تقييم التحدث الصوتي بالذكاء الاصطناعي (AI Speaking Evaluation)
              </mat-card-title>
            </mat-card-header>
            <mat-card-content class="speaking-card-body">
              <div class="transcript-box">
                <h4><mat-icon>record_voice_over</mat-icon> التفريغ النصي للتسجيل (Transcript):</h4>
                <p class="transcript-text" dir="ltr">"{{ result()!.speakingAnalysis!.transcript }}"</p>
              </div>

              <div class="speaking-scores-grid">
                <div class="speaking-stat">
                  <span class="stat-num">{{ result()!.speakingAnalysis!.grammarScore }}/10</span>
                  <span class="stat-name">القواعد (Grammar)</span>
                  <span class="stat-note">{{ result()!.speakingAnalysis!.grammarFeedback }}</span>
                </div>
                <div class="speaking-stat">
                  <span class="stat-num">{{ result()!.speakingAnalysis!.pronunciationScore }}/10</span>
                  <span class="stat-name">النطق (Pronunciation)</span>
                  <span class="stat-note">{{ result()!.speakingAnalysis!.pronunciationFeedback }}</span>
                </div>
                <div class="speaking-stat">
                  <span class="stat-num">{{ result()!.speakingAnalysis!.fluencyScore }}/10</span>
                  <span class="stat-name">الطلاقة (Fluency)</span>
                </div>
                <div class="speaking-stat">
                  <span class="stat-num">{{ result()!.speakingAnalysis!.confidenceScore }}/10</span>
                  <span class="stat-name">الثقة (Confidence)</span>
                </div>
              </div>

              <div class="speaking-overall-feedback">
                <h4><mat-icon>tips_and_updates</mat-icon> ملاحظات وتوصيات التحسين الصوتي:</h4>
                <p>{{ result()!.speakingAnalysis!.overallFeedback }}</p>
              </div>
            </mat-card-content>
          </mat-card>
        }

        <!-- 4. Overall Score / Overall CEFR Level Card -->
        <div class="overall-section">
          <div [class]="'level-circle level-' + result()!.level.toLowerCase()">
            <span class="level-code-big">{{ result()!.level }}</span>
            <span class="level-arabic">{{ levelArabic(result()!.level) }}</span>
          </div>
          <mat-card class="score-card overall-card">
            <mat-card-content>
              <div class="score-row">
                <div class="score-display" dir="ltr">
                  <span class="score-number">{{ result()!.score }}</span>
                  <span class="score-label">/ 100</span>
                </div>
                <div class="score-meta">
                  <h2>4. التقييم الإجمالي الشامل (Overall Level & Score)</h2>
                  <p>نوع الاختبار: <strong>{{ result()!.testType === 'placement' ? 'تحديد المستوى' : 'اختبار مستوى ' + result()!.targetLevel }}</strong></p>
                  <p>التاريخ: <strong>{{ result()!.completedAt | date: 'dd/MM/yyyy' }}</strong></p>
                </div>
              </div>
              <mat-progress-bar mode="determinate" [value]="result()!.score" class="score-bar" />
            </mat-card-content>
          </mat-card>
        </div>

        <!-- 5. Strengths & Weaknesses (Combined Summary in Last Section) -->
        <div class="feedback-grid">
          <!-- Strengths -->
          <mat-card class="feedback-card strengths-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon color="primary" style="vertical-align:middle;margin-left:8px">trending_up</mat-icon>
                5. نقاط القوة الشاملة (لكل المهارات)
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <ul class="feedback-list">
                @for (strength of result()!.strengths; track strength) {
                  <li class="feedback-item">
                    <mat-icon class="check-icon">check_circle</mat-icon>
                    {{ strength }}
                  </li>
                }
              </ul>
            </mat-card-content>
          </mat-card>

          <!-- Weaknesses -->
          <mat-card class="feedback-card weaknesses-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon color="warn" style="vertical-align:middle;margin-left:8px">trending_down</mat-icon>
                نقاط تحتاج تطوير (لكل المهارات)
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <ul class="feedback-list">
                @for (weakness of result()!.weaknesses; track weakness) {
                  <li class="feedback-item">
                    <mat-icon class="warn-icon">info</mat-icon>
                    {{ weakness }}
                  </li>
                }
              </ul>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Actions -->
        <div class="result-actions">
          <a mat-raised-button color="primary" routerLink="/test-selection">
            <mat-icon>refresh</mat-icon>
            أعد الاختبار
          </a>
          <a mat-stroked-button routerLink="/history">
            <mat-icon>history</mat-icon>
            سجل الاختبارات
          </a>
          <a mat-stroked-button routerLink="/">
            <mat-icon>home</mat-icon>
            الرئيسية
          </a>
        </div>
      </div>
    } @else {
      <div class="no-result">
        <mat-icon>error_outline</mat-icon>
        <p>لم يتم العثور على نتيجة. يرجى إعادة الاختبار.</p>
        <a mat-raised-button color="primary" routerLink="/test-selection">العودة</a>
      </div>
    }
  `,
  styles: [`
    .result-page { max-width: 900px; }
    .loading-state { text-align: center; padding: 64px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .result-hero-header { text-align: center; padding: 32px 0 24px; }
    .result-title { font-size: 2rem; font-weight: 700; margin: 0 0 8px; color: var(--mat-sys-primary); }
    .result-subtitle { color: var(--mat-sys-on-surface-variant); margin: 0; }
    .skill-score-card { margin-bottom: 20px; border-radius: 12px; }
    .skill-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .skill-title-group { display: flex; align-items: center; gap: 12px; }
    .skill-title-group h2 { font-size: 1.1rem; font-weight: 700; margin: 0; }
    .skill-title-group p { font-size: 13px; color: var(--mat-sys-on-surface-variant); margin: 2px 0 0; }
    .skill-icon { font-size: 28px; width: 28px; height: 28px; color: var(--mat-sys-primary); }
    .score-badge { font-size: 1.5rem; font-weight: 700; padding: 6px 16px; border-radius: 20px; background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .writing-badge { background: #e0f2fe; color: #0369a1; }
    .mcq-bar { height: 8px; border-radius: 4px; }
    .writing-bar { height: 8px; border-radius: 4px; }
    .speaking-card { margin-bottom: 32px; border: 2px solid var(--mat-sys-primary); border-radius: 12px; background: #faf5ff; }
    .speaking-card-title { display: flex; align-items: center; gap: 8px; font-size: 1.2rem; font-weight: 700; color: var(--mat-sys-primary); }
    .speaking-card-body { display: flex; flex-direction: column; gap: 20px; padding-top: 12px; }
    .transcript-box { background: white; padding: 16px; border-radius: 8px; border: 1px solid #e9d5ff; }
    .transcript-box h4 { margin: 0 0 8px; display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--mat-sys-primary); }
    .transcript-text { font-style: italic; color: #4b5563; margin: 0; line-height: 1.6; }
    .speaking-scores-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    @media (max-width: 768px) { .speaking-scores-grid { grid-template-columns: 1fr 1fr; } }
    .speaking-stat { background: white; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #e9d5ff; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .stat-num { font-size: 1.4rem; font-weight: 700; color: var(--mat-sys-primary); }
    .stat-name { font-size: 12px; font-weight: 600; color: #6b7280; margin-top: 4px; }
    .stat-note { font-size: 11px; color: #9ca3af; margin-top: 4px; }
    .speaking-overall-feedback { background: white; padding: 16px; border-radius: 8px; border: 1px solid #e9d5ff; }
    .speaking-overall-feedback h4 { margin: 0 0 6px; display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--mat-sys-primary); }
    .speaking-overall-feedback p { margin: 0; color: #374151; font-size: 14px; line-height: 1.6; }
    .overall-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 32px; margin-top: 16px; }
    .level-circle { width: 140px; height: 140px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px; border: 6px solid currentColor; }
    .level-circle.level-a1 { background: #e8f5e9; color: #2e7d32; }
    .level-circle.level-a2 { background: #f1f8e9; color: #558b2f; }
    .level-circle.level-b1 { background: #fff8e1; color: #f57f17; }
    .level-circle.level-b2 { background: #fff3e0; color: #e65100; }
    .level-circle.level-c1 { background: #fce4ec; color: #c62828; }
    .level-circle.level-c2 { background: #ede7f6; color: #4527a0; }
    .level-code-big { font-size: 2.5rem; font-weight: 700; }
    .level-arabic { font-size: 14px; font-weight: 600; margin-top: 4px; }
    .overall-card { width: 100%; }
    .score-card { margin-bottom: 32px; }
    .score-row { display: flex; align-items: center; gap: 32px; margin-bottom: 16px; }
    .score-display { display: flex; align-items: baseline; gap: 4px; }
    .score-number { font-size: 3.5rem; font-weight: 700; color: var(--mat-sys-primary); }
    .score-label { font-size: 1.2rem; color: var(--mat-sys-on-surface-variant); }
    .score-meta h2 { font-size: 1.3rem; font-weight: 700; margin: 0 0 8px; color: var(--mat-sys-primary); }
    .score-meta p { margin: 4px 0; color: var(--mat-sys-on-surface-variant); font-size: 14px; }
    .score-bar { height: 10px; border-radius: 5px; }
    .feedback-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px; }
    @media (max-width: 600px) { .feedback-grid { grid-template-columns: 1fr; } .score-row { flex-direction: column; gap: 16px; } }
    .feedback-list { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 12px; }
    .feedback-item { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; line-height: 1.5; }
    .check-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; color: #2e7d32; }
    .warn-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; color: #f57f17; }
    .strengths-card { border-inline-start: 4px solid #2e7d32; }
    .weaknesses-card { border-inline-start: 4px solid #f57f17; }
    .result-actions { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
    .no-result { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; gap: 16px; text-align: center; }
    .no-result mat-icon { font-size: 64px; width: 64px; height: 64px; color: var(--mat-sys-on-surface-variant); }
  `]
})
export class ResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private resultsService = inject(ResultsService);

  result = signal<TestResult | null>(null);
  isLoading = signal(true);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const found = await this.resultsService.getResultById(id);
      this.result.set(found);
    }
    this.isLoading.set(false);
  }

  levelArabic(level: string): string {
    const map: Record<string, string> = { A1: 'مبتدئ', A2: 'أساسي', B1: 'متوسط', B2: 'فوق المتوسط', C1: 'متقدم', C2: 'احترافي' };
    return map[level] ?? level;
  }
}
