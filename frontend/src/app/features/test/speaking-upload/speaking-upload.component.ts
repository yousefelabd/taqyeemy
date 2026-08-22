import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

export interface SpeakingRecordingData {
  audioBase64: string;
  mimeType: string;
}

@Component({
  selector: 'app-speaking-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatCardModule],
  template: `
    <div class="upload-section">
      <label for="audioUpload" class="upload-label">
        <mat-icon>attach_file</mat-icon>
        اختر ملف تسجيل صوتي
      </label>
      <input
        id="audioUpload"
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac"
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
        (click)="confirmRecording()">
        <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
        <span *ngIf="!isLoading">تأكيد والانتقال للسؤال التالي</span>
      </button>
    </div>
  `,
  styles: [`
    .upload-section { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px; border: 2px dashed #ccc; border-radius: 12px; background: #fafafa; margin: 16px 0; }
    .upload-label { display: flex; align-items: center; gap: 8px; padding: 12px 24px; background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); border-radius: 24px; cursor: pointer; font-weight: 600; }
    .error-message { color: #c62828; font-weight: 600; }
    .file-selected { color: #2e7d32; font-weight: 600; }
  `],
})
export class SpeakingUploadComponent {
  @Input() questionText = '';
  @Output() analyzed = new EventEmitter<SpeakingRecordingData>();

  private cdr = inject(ChangeDetectorRef);

  selectedFile: File | null = null;
  errorMessage: string | null = null;
  isLoading = false;
  readonly MAX_DURATION_SECONDS = 90;

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.errorMessage = null;
    this.selectedFile = null;
    this.cdr.markForCheck();

    try {
      const duration = await this.getAudioDuration(file);
      if (duration > 0 && duration > this.MAX_DURATION_SECONDS) {
        this.errorMessage = `مدة التسجيل ${Math.round(duration)} ثانية. يجب أن تكون 90 ثانية كحد أقصى.`;
        input.value = '';
        this.cdr.markForCheck();
        return;
      }
      this.selectedFile = file;
    } catch {
      this.selectedFile = file;
    } finally {
      this.cdr.markForCheck();
    }
  }

  private getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        resolve(isNaN(audio.duration) || !isFinite(audio.duration) ? 0 : audio.duration);
      };
      audio.onerror = () => resolve(0);
      audio.src = URL.createObjectURL(file);
    });
  }

  // بيقرأ الملف ويحوله base64 بس — مفيش أي تحليل هنا خالص
  async confirmRecording() {
    if (!this.selectedFile || this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    try {
      const audioBase64 = await this.fileToBase64(this.selectedFile);
      this.analyzed.emit({
        audioBase64,
        mimeType: this.selectedFile.type || 'audio/mp3',
      });
    } catch {
      this.errorMessage = 'حدث خطأ أثناء قراءة الملف الصوتي';
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1] || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}