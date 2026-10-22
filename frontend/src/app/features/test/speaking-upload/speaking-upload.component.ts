import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef, OnInit, OnChanges, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SpeakingAnalysisResult } from '../../../core/models/result.model';

@Component({
  selector: 'app-speaking-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatCardModule],
  template: `
    <div class="upload-section">
      <!-- حالة التسجيل المباشر من المايكروفون -->
      @if (!isSubmitted()) {
        <div class="mic-controls">
          <!-- اختيار المايكروفون (الافتراضي للنظام هو المختار تلقائياً) -->
          @if (!isRecording() && audioInputDevices().length > 0) {
            <div class="mic-select-row">
              <label for="micDeviceSelect" class="mic-select-label">🎙️ المايكروفون المستخدم:</label>
              <select
                id="micDeviceSelect"
                class="mic-select"
                [ngModel]="selectedDeviceId()"
                (ngModelChange)="selectedDeviceId.set($event)">
                <option value="">المايكروفون الافتراضي للنظام (تلقائي)</option>
                @for (dev of audioInputDevices(); track dev.deviceId) {
                  @if (dev.deviceId !== 'default') {
                    <option [value]="dev.deviceId">{{ dev.label || 'مايكروفون ' + ($index + 1) }}</option>
                  }
                }
              </select>
            </div>
          }

          @if (!isRecording()) {
            <button
              type="button"
              mat-raised-button
              color="warn"
              class="record-btn"
              [disabled]="isLoading()"
              (click)="startRecording()">
              <mat-icon>mic</mat-icon>
              <span>{{ selectedFile() ? 'إعادة التسجيل بالمايكروفون' : 'ابدأ التسجيل بالمايكروفون' }}</span>
            </button>
          }

          @if (isRecording()) {
            <div class="recording-active">
              <div class="recording-badge">
                <span class="pulse-dot"></span>
                <span>جاري التسجيل... {{ formatTime(recordingSeconds()) }} / 01:30</span>
              </div>

              @if (activeMicLabel()) {
                <small class="active-mic-hint">🎙️ يسجل الآن من: {{ activeMicLabel() }}</small>
              }

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
          }

          <!-- خيار احتياطي لرفع ملف صوتي من الجهاز -->
          @if (!isRecording()) {
            <div class="backup-upload">
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
          }
        </div>
      }

      @if (errorMessage()) {
        <p class="error-message">⚠️ {{ errorMessage() }}</p>
      }

      <!-- معاينة الصوت المسجل أو المرفوع قبل الإرسال -->
      @if (selectedFile() && !errorMessage() && !isSubmitted() && !isRecording()) {
        <div class="preview-box">
          <p class="file-selected">
            ✅ تم تجهيز التسجيل الصوتي ({{ recordedDurationSec() > 0 ? recordedDurationSec() + ' ثانية — ' : '' }}{{ formatFileSize(selectedFile()!.size) }})
          </p>

          @if (audioPreviewUrl()) {
            <button
              type="button"
              mat-stroked-button
              color="primary"
              class="play-test-btn"
              (click)="toggleCustomPlayback()">
              <mat-icon>{{ isPlayingPreview() ? 'stop' : 'volume_up' }}</mat-icon>
              <span>{{ isPlayingPreview() ? 'إيقاف تشغيل الصوت' : '🔊 اضغط هنا لسماع تسجيلك والتأكد من الصوت' }}</span>
            </button>

            <audio
              [src]="audioPreviewUrl()!"
              controls
              preload="auto"
              class="audio-player">
            </audio>
          }
        </div>
      }

      @if (isSubmitted()) {
        <div class="submitted-box">
          <p class="file-success">
            ✅ تم تأكيد وتحليل الإجابة الصوتية بنجاح! يمكنك الآن الضغط على «إنهاء الاختبار وعرض النتيجة».
          </p>
          <button
            type="button"
            mat-stroked-button
            color="warn"
            (click)="resetSubmittedRecording()">
            <mat-icon>refresh</mat-icon>
            <span>إعادة تسجيل إجابة صوتية جديدة</span>
          </button>
        </div>
      }

      @if (selectedFile() && !errorMessage() && !isSubmitted() && !isRecording()) {
        <button
          type="button"
          mat-raised-button
          color="primary"
          [disabled]="isLoading()"
          (click)="confirmRecording()">
          @if (isLoading()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <span>تأكيد وإرسال الإجابة الصوتية</span>
          }
        </button>
      }
    </div>
  `,
  styles: [`
    .upload-section { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px; border: 2px dashed #ccc; border-radius: 12px; background: #fafafa; margin: 16px 0; text-align: center; }
    .mic-controls { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
    .mic-select-row { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%; max-width: 360px; }
    .mic-select-label { font-size: 13px; font-weight: 600; color: #444; }
    .mic-select { width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #ccc; font-family: inherit; font-size: 13px; background: #fff; }
    .record-btn { padding: 10px 24px; border-radius: 28px; font-weight: 700; font-size: 15px; display: inline-flex; align-items: center; gap: 8px; }
    .recording-active { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; max-width: 360px; }
    .recording-badge { display: inline-flex; align-items: center; gap: 10px; background: #ffebee; color: #c62828; padding: 8px 18px; border-radius: 24px; font-weight: 700; font-size: 15px; }
    .active-mic-hint { font-size: 12px; color: #555; font-weight: 600; }
    .pulse-dot { width: 12px; height: 12px; background: #d32f2f; border-radius: 50%; animation: pulse 1s infinite ease-in-out; }
    @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.35); opacity: 0.45; } }
    .stop-btn { border-radius: 24px; font-weight: 700; }
    .backup-upload { margin-top: 4px; }
    .upload-label { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); border-radius: 20px; cursor: pointer; font-weight: 600; font-size: 13px; }
    .preview-box { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; max-width: 420px; background: #fff; padding: 14px; border-radius: 10px; border: 1px solid #e0e0e0; }
    .play-test-btn { border-radius: 20px; font-weight: 700; width: 100%; }
    .audio-player { width: 100%; height: 42px; border-radius: 20px; outline: none; }
    .error-message { color: #c62828; font-weight: 600; margin: 4px 0; }
    .file-selected { color: #2e7d32; font-weight: 600; margin: 0; font-size: 14px; }
    .submitted-box { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .file-success { color: #2e7d32; font-weight: 700; font-size: 15px; margin: 4px 0; }
  `],
})
export class SpeakingUploadComponent implements OnInit, OnChanges, OnDestroy {
  @Input() questionText = '';
  @Input() alreadySubmitted = false;
  @Output() analyzed = new EventEmitter<SpeakingAnalysisResult>();

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  selectedFile = signal<File | null>(null);
  audioPreviewUrl = signal<string | null>(null);
  recordedDurationSec = signal<number>(0);

  audioInputDevices = signal<MediaDeviceInfo[]>([]);
  selectedDeviceId = signal<string>('');
  activeMicLabel = signal<string>('');

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  isSubmitted = signal(false);

  isRecording = signal(false);
  recordingSeconds = signal(0);
  isPlayingPreview = signal(false);

  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private recordingTimer: any = null;
  private previewAudioObj: HTMLAudioElement | null = null;

  readonly MAX_DURATION_SECONDS = 90;

  ngOnInit(): void {
    this.refreshAudioDevices();
  }

  ngOnChanges(): void {
    if (this.alreadySubmitted && !this.selectedFile()) {
      this.isSubmitted.set(true);
    }
  }

  ngOnDestroy(): void {
    this.cleanupRecording();
    this.stopCustomPlayback();
    this.revokePreviewUrl();
  }

  private async refreshAudioDevices(): Promise<void> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((d) => d.kind === 'audioinput' && d.deviceId);
      this.audioInputDevices.set(inputs);
    } catch {
      // ignore
    }
  }

  toggleCustomPlayback(): void {
    if (this.isPlayingPreview()) {
      this.stopCustomPlayback();
      return;
    }
    const url = this.audioPreviewUrl();
    if (!url) return;

    this.stopCustomPlayback();
    const audio = new Audio(url);
    this.previewAudioObj = audio;
    this.isPlayingPreview.set(true);

    audio.onended = () => {
      this.isPlayingPreview.set(false);
      this.cdr.detectChanges();
    };
    audio.onerror = () => {
      this.isPlayingPreview.set(false);
      this.cdr.detectChanges();
    };
    audio.play().catch(() => {
      this.isPlayingPreview.set(false);
      this.cdr.detectChanges();
    });
  }

  private stopCustomPlayback(): void {
    if (this.previewAudioObj) {
      try {
        this.previewAudioObj.pause();
        this.previewAudioObj.currentTime = 0;
      } catch {}
      this.previewAudioObj = null;
    }
    this.isPlayingPreview.set(false);
  }

  resetSubmittedRecording(): void {
    this.stopCustomPlayback();
    this.isSubmitted.set(false);
    this.selectedFile.set(null);
    this.recordedDurationSec.set(0);
    this.errorMessage.set(null);
    this.revokePreviewUrl();
  }

  formatTime(sec: number): string {
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  formatFileSize(bytes: number): string {
    const kb = Math.max(1, Math.round(bytes / 1024));
    return `${kb} KB`;
  }

  private setPreviewBlob(blob: Blob): void {
    this.stopCustomPlayback();
    this.revokePreviewUrl();
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.audioPreviewUrl.set(reader.result);
        this.cdr.detectChanges();
      }
    };
    reader.onerror = () => {
      const url = URL.createObjectURL(blob);
      this.audioPreviewUrl.set(url);
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(blob);
  }

  private revokePreviewUrl(): void {
    const current = this.audioPreviewUrl();
    if (current && current.startsWith('blob:')) {
      URL.revokeObjectURL(current);
    }
    this.audioPreviewUrl.set(null);
  }

  private cleanupRecording(): void {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.isRecording.set(false);
  }

  async startRecording(): Promise<void> {
    if (this.isRecording() || this.isLoading()) return;
    this.stopCustomPlayback();
    this.errorMessage.set(null);
    this.selectedFile.set(null);
    this.recordedDurationSec.set(0);
    this.isSubmitted.set(false);
    this.revokePreviewUrl();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.errorMessage.set('المتصفح الحالي لا يدعم التسجيل المباشر من المايكروفون، يرجى اختيار ملف صوتي من جهازك.');
      return;
    }

    try {
      const devId = this.selectedDeviceId();
      const audioConstraints: MediaTrackConstraints | boolean = devId
        ? { deviceId: { exact: devId } }
        : true;

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
      });

      const audioTrack = this.mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = true;
        this.activeMicLabel.set(audioTrack.label || 'المايكروفون الافتراضي للنظام');
      }

      // تحديث قائمة المايكروفونات المتاحة بعد منح الصلاحية
      this.refreshAudioDevices();

      this.audioChunks = [];

      // استخدام صيغة المتصفح الأصلية (WebM/Opus) مباشرة بدون أي تدخل من AudioContext
      const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
            ? 'audio/ogg;codecs=opus'
            : '';

      const recorder = preferredMime
        ? new MediaRecorder(this.mediaStream, { mimeType: preferredMime })
        : new MediaRecorder(this.mediaStream);
      this.mediaRecorder = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const elapsedSec = Math.max(1, this.recordingSeconds());
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach((t) => t.stop());
          this.mediaStream = null;
        }
        this.isRecording.set(false);

        const rawMime = (recorder.mimeType || preferredMime || 'audio/webm').toLowerCase();
        const cleanMime = rawMime.includes('ogg')
          ? 'audio/ogg'
          : rawMime.includes('mp4')
            ? 'audio/mp4'
            : 'audio/webm';
        const ext = cleanMime === 'audio/ogg' ? 'ogg' : cleanMime === 'audio/mp4' ? 'm4a' : 'webm';

        const recordedBlob = new Blob(this.audioChunks, { type: cleanMime });

        if (recordedBlob.size === 0) {
          this.errorMessage.set('لم يتم التقاط أي صوت، يرجى المحاولة مرة أخرى.');
          this.cdr.detectChanges();
          return;
        }

        const recordedFile = new File([recordedBlob], `speaking-recording.${ext}`, { type: cleanMime });
        this.recordedDurationSec.set(elapsedSec);
        this.selectedFile.set(recordedFile);
        this.setPreviewBlob(recordedBlob);
        this.cdr.detectChanges();
      };

      recorder.start();
      this.isRecording.set(true);
      this.recordingSeconds.set(0);

      this.recordingTimer = setInterval(() => {
        const nextSec = this.recordingSeconds() + 1;
        this.recordingSeconds.set(nextSec);
        if (nextSec >= this.MAX_DURATION_SECONDS) {
          this.stopRecording();
        }
      }, 1000);
    } catch {
      this.errorMessage.set('تعذر الوصول إلى المايكروفون. يرجى السماح بصلاحية المايكروفون في المتصفح أو رفع ملف صوتي.');
      this.cleanupRecording();
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
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.stopCustomPlayback();
    this.errorMessage.set(null);
    this.selectedFile.set(null);
    this.recordedDurationSec.set(0);
    this.isSubmitted.set(false);
    this.revokePreviewUrl();

    try {
      const duration = await this.getAudioDuration(file);
      if (duration > 0 && duration > this.MAX_DURATION_SECONDS) {
        this.errorMessage.set(`مدة التسجيل ${Math.round(duration)} ثانية. يجب أن تكون 90 ثانية كحد أقصى.`);
        input.value = '';
        return;
      }
      this.recordedDurationSec.set(duration > 0 ? Math.round(duration) : 0);
      this.selectedFile.set(file);
      this.setPreviewBlob(file);
    } catch {
      this.selectedFile.set(file);
      this.setPreviewBlob(file);
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
    const file = this.selectedFile();
    if (!file || this.isLoading()) return;
    this.stopCustomPlayback();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('questionText', this.questionText);

    try {
      const res = await firstValueFrom(
        this.http.post<SpeakingAnalysisResult>(`${environment.apiUrl}/tests/speaking/analyze`, formData),
      );

      if (res) {
        this.isSubmitted.set(true);
        this.analyzed.emit(res);
      }
    } catch (err: any) {
      const msg = err?.error?.message || 'حدث خطأ أثناء تحليل الملف الصوتي، يرجى المحاولة مرة أخرى.';
      this.errorMessage.set(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      this.isLoading.set(false);
    }
  }
}