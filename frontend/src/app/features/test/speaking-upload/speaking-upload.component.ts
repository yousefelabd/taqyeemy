import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../../environments/environment';

export interface SpeakingAnalysisResult {
  transcript: string;
  grammarScore: number;
  grammarFeedback: string;
  pronunciationScore: number;
  pronunciationFeedback: string;
  fluencyScore: number;
  confidenceScore: number;
  overallFeedback: string;
}

@Component({
  selector: 'app-speaking-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  template: `
    <div class="upload-section">
      <label for="audioUpload" class="upload-label">
        <mat-icon>attach_file</mat-icon>
        اختر ملف تسجيل صوتي
      </label>
      <input
        id="audioUpload"
        type="file"
        accept="audio/*"
        (change)="onFileSelected($event)"
        style="display: none;" />

      <p *ngIf="errorMessage" class="error-message">⚠️ {{ errorMessage }}</p>
      <p *ngIf="selectedFile && !errorMessage" class="file-selected">
        ✅ تم اختيار: {{ selectedFile.name }}
      </p>

      <button
        *ngIf="selectedFile && !errorMessage"
        mat-raised-button
        color="primary"
        [disabled]="isLoading"
        (click)="submitRecording(questionText)">
        <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
        <span *ngIf="!isLoading">إرسال الإجابة</span>
      </button>
    </div>

    <!-- عرض نتيجة التحليل بعد الرد من الباك إند -->
    <div *ngIf="analysisResult" class="analysis-result">
      <h3>نتيجة التحليل</h3>
      <p><strong>النص:</strong> {{ analysisResult.transcript }}</p>
      <p>
        <strong>القواعد:</strong> {{ analysisResult.grammarScore }}/10 —
        {{ analysisResult.grammarFeedback }}
      </p>
      <p>
        <strong>النطق:</strong> {{ analysisResult.pronunciationScore }}/10 —
        {{ analysisResult.pronunciationFeedback }}
      </p>
      <p><strong>الطلاقة:</strong> {{ analysisResult.fluencyScore }}/10</p>
      <p><strong>الثقة:</strong> {{ analysisResult.confidenceScore }}/10</p>
      <p><strong>ملاحظات عامة:</strong> {{ analysisResult.overallFeedback }}</p>
    </div>
  `,
  styles: [`
    .upload-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 24px;
      border: 2px dashed #ccc;
      border-radius: 12px;
      background: #fafafa;
      margin: 16px 0;
    }
    .upload-label {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      border-radius: 24px;
      cursor: pointer;
      font-weight: 600;
    }
    .error-message {
      color: #c62828;
      font-weight: 600;
    }
    .file-selected {
      color: #2e7d32;
      font-weight: 600;
    }
    .analysis-result {
      background: #f0f4f8;
      border-radius: 12px;
      padding: 20px;
      margin-top: 24px;
      text-align: right;
      line-height: 1.8;
    }
    .analysis-result h3 {
      margin-top: 0;
      color: var(--mat-sys-primary);
    }
  `],
})
export class SpeakingUploadComponent {
  @Input() questionText = '';
  @Output() analyzed = new EventEmitter<SpeakingAnalysisResult>();

  private http = inject(HttpClient);

  selectedFile: File | null = null;
  errorMessage: string | null = null;
  isLoading = false;
  analysisResult: SpeakingAnalysisResult | null = null;
  readonly MAX_DURATION_SECONDS = 90;

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.errorMessage = null;
    this.selectedFile = null;

    try {
      const duration = await this.getAudioDuration(file);

      if (duration > this.MAX_DURATION_SECONDS) {
        this.errorMessage = `مدة التسجيل ${Math.round(duration)} ثانية. يجب أن تكون 90 ثانية كحد أقصى.`;
        input.value = '';
        return;
      }

      this.selectedFile = file;
    } catch {
      this.errorMessage = 'تعذر قراءة الملف الصوتي، يرجى تجربة ملف آخر.';
      input.value = '';
    }
  }

  private getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        resolve(audio.duration);
      };
      audio.onerror = () => reject(new Error('تعذر قراءة الملف الصوتي'));
      audio.src = URL.createObjectURL(file);
    });
  }

  async submitRecording(questionText: string) {
    if (!this.selectedFile || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;

    const formData = new FormData();
    formData.append('audio', this.selectedFile);
    formData.append('questionText', questionText);

    try {
      const res = await this.http
        .post<SpeakingAnalysisResult>(`${environment.apiUrl}/tests/speaking/analyze`, formData)
        .toPromise();

      this.analysisResult = res || null;
      if (this.analysisResult) {
        this.analyzed.emit(this.analysisResult);
      }
    } catch (err: any) {
      this.errorMessage = err?.error?.message || 'حدث خطأ أثناء تحليل التسجيل الصوتي';
    } finally {
      this.isLoading = false;
    }
  }
}
