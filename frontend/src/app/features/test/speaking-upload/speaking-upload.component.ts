import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../../environments/environment';
import { SpeakingAnalysisResult } from '../../../core/models/result.model';

@Component({
  selector: 'app-speaking-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatCardModule],
  template: `
    <div class="upload-section">
      <!-- حالة التسجيل المباشر من المايكروفون -->
      <div *ngIf="!isSubmitted" class="mic-controls">
        <button
          *ngIf="!isRecording"
          type="button"
          mat-raised-button
          color="warn"
          class="record-btn"
          [disabled]="isLoading"
          (click)="startRecording()">
          <mat-icon>mic</mat-icon>
          <span>{{ selectedFile ? 'إعادة التسجيل بالمايكروفون' : 'ابدأ التسجيل بالمايكروفون' }}</span>
        </button>

        <div *ngIf="isRecording" class="recording-active">
          <div class="recording-badge">
            <span class="pulse-dot"></span>
            <span>جاري التسجيل... {{ formatTime(recordingSeconds) }} / 01:30</span>
          </div>
          <button
            type="button"
            mat-raised-button
            color="accent"
            class="stop-btn"
            (click)="stopRecording()">
            <mat-icon>stop_circle</mat-icon>
            <span>إيقاف التسجيل</span>
          </button>
        </div>

        <!-- خيار احتياطي لرفع ملف صوتي من الجهاز -->
        <div *ngIf="!isRecording" class="backup-upload">
          <label for="audioUpload" class="upload-label">
            <mat-icon>attach_file</mat-icon>
            أو اختر ملف تسجيل صوتي من جهازك
          </label>
          <input
            id="audioUpload"
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac"
            (change)="onFileSelected($event)"
            style="display: none;" />
        </div>
      </div>

      <p *ngIf="errorMessage" class="error-message">⚠️ {{ errorMessage }}</p>

      <!-- معاينة الصوت المسجل أو المرفوع قبل الإرسال -->
      <div *ngIf="selectedFile && !errorMessage && !isSubmitted && !isRecording" class="preview-box">
        <p class="file-selected">
          ✅ الجاهز للإرسال: {{ selectedFile.name }}
        </p>
        <audio *ngIf="audioPreviewUrl" [src]="audioPreviewUrl" controls class="audio-player"></audio>
      </div>

      <p *ngIf="isSubmitted" class="file-success">
        ✅ تم تأكيد وتسجيل الإجابة الصوتية بنجاح! يمكنك الآن الضغط على «إنهاء الاختبار وعرض النتيجة».
      </p>

      <button
        *ngIf="selectedFile && !errorMessage && !isSubmitted && !isRecording"
        type="button"
        mat-raised-button
        color="primary"
        [disabled]="isLoading"
        (click)="confirmRecording()">
        <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
        <span *ngIf="!isLoading">تأكيد وإرسال الإجابة الصوتية</span>
      </button>
    </div>
  `,
  styles: [`
    .upload-section { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px; border: 2px dashed #ccc; border-radius: 12px; background: #fafafa; margin: 16px 0; text-align: center; }
    .mic-controls { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
    .record-btn { padding: 10px 24px; border-radius: 28px; font-weight: 700; font-size: 15px; display: inline-flex; align-items: center; gap: 8px; }
    .recording-active { display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .recording-badge { display: inline-flex; align-items: center; gap: 10px; background: #ffebee; color: #c62828; padding: 8px 18px; border-radius: 24px; font-weight: 700; font-size: 15px; }
    .pulse-dot { width: 12px; height: 12px; background: #d32f2f; border-radius: 50%; animation: pulse 1s infinite ease-in-out; }
    @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.35); opacity: 0.45; } }
    .stop-btn { border-radius: 24px; font-weight: 700; }
    .backup-upload { margin-top: 4px; }
    .upload-label { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); border-radius: 20px; cursor: pointer; font-weight: 600; font-size: 13px; }
    .preview-box { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; max-width: 380px; }
    .audio-player { width: 100%; height: 40px; border-radius: 20px; }
    .error-message { color: #c62828; font-weight: 600; margin: 4px 0; }
    .file-selected { color: #2e7d32; font-weight: 600; margin: 0; }
    .file-success { color: #2e7d32; font-weight: 700; font-size: 15px; margin: 8px 0; }
  `],
})
export class SpeakingUploadComponent implements OnChanges, OnDestroy {
  @Input() questionText = '';
  @Input() alreadySubmitted = false;
  @Output() analyzed = new EventEmitter<SpeakingAnalysisResult>();

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  selectedFile: File | null = null;
  audioPreviewUrl: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;
  isSubmitted = false;

  isRecording = false;
  recordingSeconds = 0;
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private recordingTimer: any = null;

  readonly MAX_DURATION_SECONDS = 90;

  ngOnChanges(): void {
    if (this.alreadySubmitted) {
      this.isSubmitted = true;
    }
  }

  ngOnDestroy(): void {
    this.cleanupRecording();
    this.revokePreviewUrl();
  }

  formatTime(sec: number): string {
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  private revokePreviewUrl(): void {
    if (this.audioPreviewUrl) {
      URL.revokeObjectURL(this.audioPreviewUrl);
      this.audioPreviewUrl = null;
    }
  }

  private cleanupRecording(): void {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.isRecording = false;
  }

  async startRecording(): Promise<void> {
    if (this.isRecording || this.isLoading) return;
    this.errorMessage = null;
    this.selectedFile = null;
    this.isSubmitted = false;
    this.revokePreviewUrl();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.errorMessage = 'المتصفح الحالي لا يدعم التسجيل المباشر من المايكروفون، يرجى اختيار ملف صوتي من جهازك.';
      this.cdr.markForCheck();
      return;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : '';

      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.mediaStream, { mimeType })
        : new MediaRecorder(this.mediaStream);

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const actualMime = this.mediaRecorder?.mimeType || 'audio/webm';
        const ext = actualMime.includes('mp4') ? 'm4a' : 'webm';
        const blob = new Blob(this.audioChunks, { type: actualMime });

        if (blob.size > 0) {
          this.selectedFile = new File([blob], `speaking-recording.${ext}`, { type: actualMime });
          this.revokePreviewUrl();
          this.audioPreviewUrl = URL.createObjectURL(blob);
        }

        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach((t) => t.stop());
          this.mediaStream = null;
        }
        this.isRecording = false;
        this.cdr.markForCheck();
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.recordingSeconds = 0;
      this.cdr.markForCheck();

      this.recordingTimer = setInterval(() => {
        this.recordingSeconds++;
        if (this.recordingSeconds >= this.MAX_DURATION_SECONDS) {
          this.stopRecording();
        }
        this.cdr.markForCheck();
      }, 1000);
    } catch {
      this.errorMessage = 'تعذر الوصول إلى المايكروفون. يرجى السماح بصلاحية المايكروفون في المتصفح أو رفع ملف صوتي.';
      this.cleanupRecording();
      this.cdr.markForCheck();
    }
  }

  stopRecording(): void {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    } else {
      this.cleanupRecording();
    }
    this.cdr.markForCheck();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.errorMessage = null;
    this.selectedFile = null;
    this.isSubmitted = false;
    this.revokePreviewUrl();
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
      this.audioPreviewUrl = URL.createObjectURL(file);
    } catch {
      this.selectedFile = file;
      this.audioPreviewUrl = URL.createObjectURL(file);
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

  async confirmRecording() {
    if (!this.selectedFile || this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    const formData = new FormData();
    formData.append('audio', this.selectedFile);
    formData.append('questionText', this.questionText);

    try {
      const res = await this.http
        .post<SpeakingAnalysisResult>(`${environment.apiUrl}/tests/speaking/analyze`, formData)
        .toPromise();

      if (res) {
        this.isSubmitted = true;
        this.analyzed.emit(res);
      }
    } catch (err: any) {
      const msg = err?.error?.message || 'حدث خطأ أثناء تحليل الملف الصوتي، يرجى المحاولة مرة أخرى.';
      this.errorMessage = Array.isArray(msg) ? msg[0] : msg;
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
}