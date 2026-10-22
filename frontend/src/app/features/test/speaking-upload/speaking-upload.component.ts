import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef, OnChanges, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
            ✅ تم تجهيز التسجيل الصوتي ({{ recordedDurationSec() > 0 ? recordedDurationSec() + ' ثانية — ' : '' }}{{ formatFileSize(selectedFile()!.size) }}) — يمكنك سماعه للتأكد:
          </p>
          @if (audioPreviewUrl()) {
            <audio [src]="audioPreviewUrl()!" controls preload="auto" class="audio-player"></audio>
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
    .submitted-box { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .file-success { color: #2e7d32; font-weight: 700; font-size: 15px; margin: 4px 0; }
  `],
})
export class SpeakingUploadComponent implements OnChanges, OnDestroy {
  @Input() questionText = '';
  @Input() alreadySubmitted = false;
  @Output() analyzed = new EventEmitter<SpeakingAnalysisResult>();

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  selectedFile = signal<File | null>(null);
  audioPreviewUrl = signal<string | null>(null);
  recordedDurationSec = signal<number>(0);
  liveTranscript = signal<string>('');

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  isSubmitted = signal(false);

  isRecording = signal(false);
  recordingSeconds = signal(0);
  micVolume = signal(0);

  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private recordingTimer: any = null;
  private audioContext: AudioContext | null = null;
  private volumeInterval: any = null;
  private speechRecognition: any = null;
  private accumulatedTranscript = '';

  readonly MAX_DURATION_SECONDS = 90;

  ngOnChanges(): void {
    if (this.alreadySubmitted && !this.selectedFile()) {
      this.isSubmitted.set(true);
    }
  }

  ngOnDestroy(): void {
    this.cleanupRecording();
    this.revokePreviewUrl();
  }

  resetSubmittedRecording(): void {
    this.isSubmitted.set(false);
    this.selectedFile.set(null);
    this.recordedDurationSec.set(0);
    this.liveTranscript.set('');
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
    this.revokePreviewUrl();
    const url = URL.createObjectURL(blob);
    this.audioPreviewUrl.set(url);
  }

  private revokePreviewUrl(): void {
    const current = this.audioPreviewUrl();
    if (current) {
      URL.revokeObjectURL(current);
      this.audioPreviewUrl.set(null);
    }
  }

  private stopSpeechRecognition(): void {
    if (this.speechRecognition) {
      try {
        this.speechRecognition.onend = null;
        this.speechRecognition.stop();
      } catch {}
      this.speechRecognition = null;
    }
  }

  private startSpeechRecognition(): void {
    try {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRec) return;

      this.accumulatedTranscript = '';
      this.liveTranscript.set('');

      const recognition = new SpeechRec();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let finalPart = '';
        let interimPart = '';
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            finalPart += transcript + ' ';
          } else {
            interimPart += transcript;
          }
        }
        const combined = `${this.accumulatedTranscript} ${finalPart} ${interimPart}`.replace(/\s+/g, ' ').trim();
        if (combined) {
          this.liveTranscript.set(combined);
        }
      };

      recognition.onend = () => {
        if (this.isRecording()) {
          this.accumulatedTranscript = this.liveTranscript();
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      this.speechRecognition = recognition;
    } catch {
      // ignore if browser blocks SpeechRecognition
    }
  }

  private stopAudioMeter(): void {
    if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
      this.volumeInterval = null;
    }
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
    this.stopSpeechRecognition();
    this.stopAudioMeter();
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
    this.errorMessage.set(null);
    this.selectedFile.set(null);
    this.recordedDurationSec.set(0);
    this.liveTranscript.set('');
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
      this.audioChunks = [];

      this.startSpeechRecognition();

      // مؤشر مستوى الصوت المباشر عبر AnalyserNode
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
          }
          const source = this.audioContext.createMediaStreamSource(this.mediaStream);
          const analyser = this.audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          const dataArray = new Uint8Array(analyser.fftSize);

          this.volumeInterval = setInterval(() => {
            analyser.getByteTimeDomainData(dataArray);
            let maxDeviation = 0;
            for (let i = 0; i < dataArray.length; i++) {
              const dev = Math.abs(dataArray[i] - 128);
              if (dev > maxDeviation) maxDeviation = dev;
            }
            const percent = Math.min(100, Math.round((maxDeviation / 45) * 100));
            this.micVolume.set(percent);
          }, 100);
        }
      } catch {
        // ignore audio meter errors
      }

      const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
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

      recorder.onstop = async () => {
        const elapsedSec = Math.max(1, this.recordingSeconds());
        this.stopSpeechRecognition();
        this.stopAudioMeter();
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach((t) => t.stop());
          this.mediaStream = null;
        }
        this.isRecording.set(false);

        const rawMime = (recorder.mimeType || preferredMime || 'audio/webm').toLowerCase();
        const rawBlob = new Blob(this.audioChunks, { type: rawMime });

        if (rawBlob.size === 0) {
          this.errorMessage.set('لم يتم التقاط أي صوت، يرجى المحاولة مرة أخرى.');
          this.cdr.detectChanges();
          return;
        }

        // فك ضغط الصوت وتحويله إلى ملف WAV قياسي (16-bit 16kHz PCM) يحتوي على مدة التسجيل الدقيقة في الـ Header
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const decodeCtx: AudioContext = new AudioCtx();
          const arrayBuf = await rawBlob.arrayBuffer();
          const audioBuffer = await decodeCtx.decodeAudioData(arrayBuf);
          await decodeCtx.close().catch(() => {});

          const channelData = audioBuffer.getChannelData(0);
          const wavBlob = this.encodeWavFromChunks([channelData], audioBuffer.sampleRate, 16000);
          const wavFile = new File([wavBlob], 'speaking-recording.wav', { type: 'audio/wav' });

          this.recordedDurationSec.set(Math.max(1, Math.round(audioBuffer.duration)));
          this.selectedFile.set(wavFile);
          this.setPreviewBlob(wavBlob);
        } catch {
          const cleanMime = rawMime.includes('mp4') ? 'audio/mp4' : 'audio/webm';
          const ext = cleanMime === 'audio/mp4' ? 'm4a' : 'webm';
          const fallbackFile = new File([rawBlob], `speaking-recording.${ext}`, { type: cleanMime });
          this.recordedDurationSec.set(elapsedSec);
          this.selectedFile.set(fallbackFile);
          this.setPreviewBlob(rawBlob);
        }

        this.cdr.detectChanges();
      };

      recorder.start(200);
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
    this.stopSpeechRecognition();
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.requestData();
      } catch {}
      this.mediaRecorder.stop();
    } else {
      this.cleanupRecording();
    }
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
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, finalRate, true);
    view.setUint32(28, finalRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
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
    this.recordedDurationSec.set(0);
    this.liveTranscript.set('');
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
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('questionText', this.questionText);
    if (this.liveTranscript()) {
      formData.append('clientTranscript', this.liveTranscript());
    }

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