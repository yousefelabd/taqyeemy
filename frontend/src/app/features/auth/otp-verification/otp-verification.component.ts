import { Component, Input, Output, EventEmitter, signal, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="otp-container">
      <mat-card class="otp-card">
        <mat-card-header>
          <div class="otp-header">
            <mat-icon color="primary" class="otp-icon">mark_email_read</mat-icon>
            <mat-card-title>تأكيد البريد الإلكتروني</mat-card-title>
            <mat-card-subtitle>
              تم إرسال رمز التحقق (6 أرقام) إلى:
              <br />
              <strong>{{ email }}</strong>
            </mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="otpForm" (ngSubmit)="onSubmit()" class="otp-form">
            <div class="otp-inputs-row">
              <input
                #digit0
                type="text"
                maxlength="1"
                class="otp-digit"
                formControlName="digit0"
                (input)="onDigitInput($event, 0)"
                (keydown)="onKeyDown($event, 0)" />
              <input
                #digit1
                type="text"
                maxlength="1"
                class="otp-digit"
                formControlName="digit1"
                (input)="onDigitInput($event, 1)"
                (keydown)="onKeyDown($event, 1)" />
              <input
                #digit2
                type="text"
                maxlength="1"
                class="otp-digit"
                formControlName="digit2"
                (input)="onDigitInput($event, 2)"
                (keydown)="onKeyDown($event, 2)" />
              <input
                #digit3
                type="text"
                maxlength="1"
                class="otp-digit"
                formControlName="digit3"
                (input)="onDigitInput($event, 3)"
                (keydown)="onKeyDown($event, 3)" />
              <input
                #digit4
                type="text"
                maxlength="1"
                class="otp-digit"
                formControlName="digit4"
                (input)="onDigitInput($event, 4)"
                (keydown)="onKeyDown($event, 4)" />
              <input
                #digit5
                type="text"
                maxlength="1"
                class="otp-digit"
                formControlName="digit5"
                (input)="onDigitInput($event, 5)"
                (keydown)="onKeyDown($event, 5)" />
            </div>

            @if (errorMessage()) {
              <div class="error-banner">
                <mat-icon>error</mat-icon>
                {{ errorMessage() }}
              </div>
            }

            @if (successMessage()) {
              <div class="success-banner">
                <mat-icon>check_circle</mat-icon>
                {{ successMessage() }}
              </div>
            }

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="submit-btn"
              [disabled]="otpForm.invalid || isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20" />
              } @else {
                تأكيد الكود
              }
            </button>
          </form>

          <div class="resend-section">
            @if (resendTimer() > 0) {
              <p class="timer-text">
                يمكنك طلب إعادة إرسال الكود خلال: {{ resendTimer() }} ثانية
              </p>
            } @else {
              <button
                mat-button
                color="primary"
                [disabled]="isResending()"
                (click)="resendCode()">
                @if (isResending()) {
                  جاري الإرسال...
                } @else {
                  إعادة إرسال رمز التحقق
                }
              </button>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .otp-container { display: flex; justify-content: center; align-items: center; padding: 24px 16px; }
    .otp-card { width: 100%; max-width: 440px; padding: 16px; text-align: center; }
    .otp-header { width: 100%; padding: 16px 0; }
    .otp-icon { font-size: 56px; width: 56px; height: 56px; margin-bottom: 12px; }
    .otp-form { display: flex; flex-direction: column; gap: 20px; margin-top: 16px; }
    .otp-inputs-row { display: flex; justify-content: center; gap: 8px; dir: ltr; }
    .otp-digit { width: 44px; height: 52px; font-size: 22px; font-weight: 700; text-align: center; border: 2px solid #ccc; border-radius: 8px; outline: none; transition: border-color 0.2s; }
    .otp-digit:focus { border-color: var(--mat-sys-primary); box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2); }
    .submit-btn { width: 100%; height: 48px; font-size: 16px; }
    .error-banner { display: flex; align-items: center; gap: 8px; background: #ffebee; color: #c62828; padding: 12px 16px; border-radius: 8px; font-size: 14px; text-align: right; }
    .success-banner { display: flex; align-items: center; gap: 8px; background: #e8f5e9; color: #2e7d32; padding: 12px 16px; border-radius: 8px; font-size: 14px; text-align: right; }
    .resend-section { margin-top: 16px; }
    .timer-text { color: var(--mat-sys-on-surface-variant); font-size: 13px; }
  `]
})
export class OtpVerificationComponent implements OnInit, OnDestroy {
  @Input() email = '';
  @Input() type: 'signup' | 'recovery' = 'signup';
  @Output() verified = new EventEmitter<void>();

  otpForm: FormGroup;
  isLoading = signal(false);
  isResending = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  resendTimer = signal(60);
  private timerInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.otpForm = this.fb.group({
      digit0: ['', Validators.required],
      digit1: ['', Validators.required],
      digit2: ['', Validators.required],
      digit3: ['', Validators.required],
      digit4: ['', Validators.required],
      digit5: ['', Validators.required],
    });

    this.otpForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) {
        this.errorMessage.set('');
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private startTimer(): void {
    this.resendTimer.set(60);
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.resendTimer() > 0) {
        this.resendTimer.update((v) => v - 1);
        this.cdr.markForCheck();
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  onDigitInput(event: any, index: number): void {
    const input = event.target;
    const value = input.value;

    if (value && index < 5) {
      const nextInput = input.parentElement.children[index + 1];
      if (nextInput) nextInput.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otpForm.get(`digit${index}`)?.value && index > 0) {
      const prevInput = (event.target as HTMLElement).parentElement?.children[index - 1] as HTMLElement;
      if (prevInput) prevInput.focus();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.otpForm.invalid || this.isLoading()) return;

    const code = Object.keys(this.otpForm.controls)
      .map((k) => this.otpForm.get(k)?.value)
      .join('');

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.cdr.markForCheck();

    try {
      await this.authService.verifyOtp(this.email, code, this.type);
      this.verified.emit();
    } catch (err: any) {
      const msg = err?.error?.message || 'رمز التحقق غير صحيح أو انتهت صلاحيته';
      this.errorMessage.set(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  async resendCode(): Promise<void> {
    if (this.resendTimer() > 0 || this.isResending()) return;

    this.isResending.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.cdr.markForCheck();

    try {
      await this.authService.forgotPassword(this.email);
      this.successMessage.set('تم إعادة إرسال رمز التحقق بنجاح');
      this.startTimer();
    } catch (err: any) {
      const msg = err?.error?.message || 'حدث خطأ أثناء إعادة إرسال الرمز';
      this.errorMessage.set(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      this.isResending.set(false);
      this.cdr.markForCheck();
    }
  }
}
