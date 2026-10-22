import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef, OnChanges, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatCardModule],
  template: `
    <div class="upload-section">
      <!-- حالة التسجيل المباشر من المايكروفون -->
      @if (!isSubmitted()) {
        <div class="mic-controls">
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

              <!-- مؤشر حي لالتقاط الصوت من المايكروفون -->
              <div class="mic-meter-wrapper">
                <span class="mic-meter-label">مستوى الصوت الملتقط:</span>
                <div class="mic-meter-track">
                  <div class="mic-meter-fill" [style.width.%]="micVolume()"></div>
                </div>
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
            ✅ تم تجهيز التسجيل الصوتي ({{ formatFileSize(selectedFile()!.size) }}) — يمكنك سماعه للتأكد:
          </p>
          @if (safeAudioPreviewUrl()) {
            <audio [src]="safeAudioPreviewUrl()" controls preload="auto" class="audio-player"></audio>
          }
        </div>
      }

      @if (isSubmitted()) {
        <p class="file-success">
          ✅ تم تأكيد وتسجيل الإجابة الصوتية بنجاح! يمكنك الآن الضغط على «إنهاء الاختبار وعرض النتيجة».
        </p>
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
    .record-btn { padding: 10px 24px; border-radius: 28px; font-weight: 700; font-size: 15px; display: inline-flex; align-items: center; gap: 8px; }
    .recording-active { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; max-width: 360px; }
    .recording-badge { display: inline-flex; align-items: center; gap: 10px; background: #ffebee; color: #c62828; padding: 8px 18px; border-radius: 24px; font-weight: 700; font-size: 15px; }
    .pulse-dot { width: 12px; height: 12px; background: #d32f2f; border-radius: 50%; animation: pulse 1s infinite ease-in-out; }
    @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.35); opacity: 0.45; } }
    .mic-meter-wrapper { width: 100%; display: flex; flex-direction: column; gap: 6px; align-items: center; }
    .mic-meter-label { font-size: 12px; color: #555; font-weight: 600; }
    .mic-meter-track { width: 100%; height: 10px; background: #e0e0e0; border-radius: 6px; overflow: hidden; }
    .mic-meter-fill { height: 100%; background: linear-gradient(90deg, #43a047, #1e88e5); transition: width 0.08s ease-out; border-radius: 6px; }
    .stop-btn { border-radius: 24px; font-weight: 700; }
    .backup-upload { margin-top: 4px; }
    .upload-label { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); border-radius: 20px; cursor: pointer; font-weight: 600; font-size: 13px; }
    .preview-box { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; max-width: 400px; background: #fff; padding: 14px; border-radius: 10px; border: 1px solid #e0e0e0; }
    .audio-player { width: 100%; height: 42px; border-radius: 20px; outline: none; }
    .error-message { color: #c62828; font-weight: 600; margin: 4px 0; }
    .file-selected { color: #2e7d32; font-weight: 600; margin: 0; font-size: 14px; }
    .file-success { color: #2e7d32; font-weight: 700; font-size: 15px; margin: 8px 0; }
  `],
})
export class SpeakingUploadComponent implements OnChanges, OnDestroy {
  @Input() questionText = '';
  @Input() alreadySubmitted = false;
  @Output() analyzed = new EventEmitter<SpeakingAnalysisResult>();

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);

  selectedFile = signal<File | null>(null);
  safeAudioPreviewUrl = signal<SafeUrl | null>(null);
  private rawAudioPreviewUrl: string | null = null;

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  isSubmitted = signal(false);

  isRecording = signal(false);
  recordingSeconds = signal(0);
  micVolume = signal(0);

  private mediaStream: MediaStream | null = null;
  private recordingTimer: any = null;
  private audioContext: AudioContext | null = null;
  private mediaSource: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private zeroGain: GainNode | null = null;
  private pcmChunks: Float32Array[] = [];
  private recordedSampleRate = 44100;

  readonly MAX_DURATION_SECONDS = 90;

  ngOnChanges(): void {
    if (this.alreadySubmitted) {
      this.isSubmitted.set(true);
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

  formatFileSize(bytes: number): string {
    const kb = Math.max(1, Math.round(bytes / 1024));
    return `${kb} KB`;
  }

  private setPreviewBlob(blob: Blob): void {
    this.revokePreviewUrl();
    this.rawAudioPreviewUrl = URL.createObjectURL(blob);
    this.safeAudioPreviewUrl.set(this.sanitizer.bypassSecurityTrustUrl(this.rawAudioPreviewUrl));
  }

  private revokePreviewUrl(): void {
    if (this.rawAudioPreviewUrl) {
      URL.revokeObjectURL(this.rawAudioPreviewUrl);
      this.rawAudioPreviewUrl = null;
    }
    this.safeAudioPreviewUrl.set(null);
  }

  private disconnectAudioGraph(): void {
    try {
      this.scriptProcessor?.disconnect();
    } catch {}
    try {
      this.mediaSource?.disconnect();
    } catch {}
    try {
      this.zeroGain?.disconnect();
    } catch {}
    this.scriptProcessor = null;
    this.mediaSource = null;
    this.zeroGain = null;

    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.micVolume.set(0);
  }

  private cleanupRecording(): void {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
    this.disconnectAudioGraph();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.isRecording.set(false);
  }

  async startRecording(): Promise<void> {
    if (this.isRecording() || this.isLoading()) return;
    this.errorMessage.set(null);
    this.selectedFile.set(null);
    this.isSubmitted.set(false);
    this.revokePreviewUrl();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.errorMessage.set('المتصفح الحالي لا يدعم التسجيل المباشر من المايكروفون، يرجى اختيار ملف صوتي من جهازك.');
      return;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.recordedSampleRate = this.audioContext.sampleRate || 44100;
      this.pcmChunks = [];

      this.mediaSource = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.zeroGain = this.audioContext.createGain();
      this.zeroGain.gain.value = 0;

      this.scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
        if (!this.isRecording()) return;
        const input = event.inputBuffer.getChannelData(0);
        this.pcmChunks.push(new Float32Array(input));

        // حساب مؤشر الصوت اللحظي
        let peak = 0;
        for (let i = 0; i < input.length; i++) {
          const abs = Math.abs(input[i]);
          if (abs > peak) peak = abs;
        }
        const percent = Math.min(100, Math.round(peak * 220));
        this.micVolume.set(percent);
      };

      this.mediaSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.zeroGain);
      this.zeroGain.connect(this.audioContext.destination);

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
    if (!this.isRecording()) return;

    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }

    this.isRecording.set(false);
    this.disconnectAudioGraph();

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }

    if (this.pcmChunks.length > 0) {
      const wavBlob = this.encodeWavFromChunks(this.pcmChunks, this.recordedSampleRate, 16000);
      this.pcmChunks = [];
      const wavFile = new File([wavBlob], 'speaking-recording.wav', { type: 'audio/wav' });
      this.selectedFile.set(wavFile);
      this.setPreviewBlob(wavBlob);
    } else {
      this.errorMessage.set('لم يتم التقاط أي صوت، يرجى المحاولة مرة أخرى.');
    }

    this.cdr.detectChanges();
  }

  private encodeWavFromChunks(chunks: Float32Array[], sourceRate: number, targetRate: number): Blob {
    let totalLength = 0;
    for (const c of chunks) {
      totalLength += c.length;
    }
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const c of chunks) {
      merged.set(c, offset);
      offset += c.length;
    }

    // خفض التردد إلى 16kHz Mono ليكون خفيف الحجم وبجودة مثالية لـ Gemini ومتوافقاً مع كل المتصفحات
    const finalRate = sourceRate > targetRate ? targetRate : sourceRate;
    let samples: Float32Array;
    if (finalRate === sourceRate) {
      samples = merged;
    } else {
      const ratio = sourceRate / finalRate;
      const newLength = Math.round(merged.length / ratio);
      samples = new Float32Array(newLength);
      for (let i = 0; i < newLength; i++) {
        const start = Math.floor(i * ratio);
        const end = Math.min(merged.length, Math.floor((i + 1) * ratio));
        let sum = 0;
        let count = 0;
        for (let j = start; j < end; j++) {
          sum += merged[j];
          count++;
        }
        samples[i] = count > 0 ? sum / count : merged[start] || 0;
      }
    }

    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (pos: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(pos + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
    view.setUint16(22, 1, true);  // NumChannels (1 = Mono)
    view.setUint32(24, finalRate, true); // SampleRate
    view.setUint32(28, finalRate * 2, true); // ByteRate
    view.setUint16(32, 2, true);  // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let byteOffset = 44;
    for (let i = 0; i < samples.length; i++) {
      const clamped = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(byteOffset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
      byteOffset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.errorMessage.set(null);
    this.selectedFile.set(null);
    this.isSubmitted.set(false);
    this.revokePreviewUrl();

    try {
      const duration = await this.getAudioDuration(file);
      if (duration > 0 && duration > this.MAX_DURATION_SECONDS) {
        this.errorMessage.set(`مدة التسجيل ${Math.round(duration)} ثانية. يجب أن تكون 90 ثانية كحد أقصى.`);
        input.value = '';
        return;
      }
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