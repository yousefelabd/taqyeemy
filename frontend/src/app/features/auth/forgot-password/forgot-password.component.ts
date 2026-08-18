import { Component, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatchValidator(group: AbstractControl) {
  const password = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="auth-header">
            <mat-icon color="primary" class="auth-icon">lock_reset</mat-icon>
            <mat-card-title>استعادة كلمة المرور</mat-card-title>
            <mat-card-subtitle>
              @if (step() === 1) {
                أدخل بريدك الإلكتروني لإرسال رمز التحقق (OTP)
              } @else {
                أدخل كود التحقق من الإيميل وكلمة المرور الجديدة
              }
            </mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content>
          @if (step() === 1) {
            <!-- Step 1: Email Form -->
            <form [formGroup]="requestForm" (ngSubmit)="onRequestOtp()" class="auth-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>البريد الإلكتروني</mat-label>
                <input matInput type="email" formControlName="email" placeholder="example@email.com" />
                <mat-icon matSuffix>email</mat-icon>
                @if (requestForm.get('email')?.invalid && requestForm.get('email')?.touched) {
                  <mat-error>يرجى إدخال بريد إلكتروني صحيح</mat-error>
                }
              </mat-form-field>

              @if (errorMessage()) {
                <div class="error-banner">
                  <mat-icon>error</mat-icon>
                  {{ errorMessage() }}
                </div>
              }

              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="submit-btn"
                [disabled]="requestForm.invalid || isLoading()">
                @if (isLoading()) {
                  <mat-spinner diameter="20" />
                } @else {
                  إرسال رمز التحقق
                }
              </button>
            </form>
          } @else {
            <!-- Step 2: OTP & New Password Form -->
            <form [formGroup]="resetForm" (ngSubmit)="onResetPassword()" class="auth-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>رمز التحقق (6 أرقام)</mat-label>
                <input matInput type="text" formControlName="token" maxlength="6" placeholder="123456" />
                <mat-icon matSuffix>key</mat-icon>
                @if (resetForm.get('token')?.invalid && resetForm.get('token')?.touched) {
                  <mat-error>رمز التحقق يجب أن بيتكون من 6 أرقام</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>كلمة المرور الجديدة</mat-label>
                <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="newPassword" />
                <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword">
                  <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (resetForm.get('newPassword')?.invalid && resetForm.get('newPassword')?.touched) {
                  <mat-error>كلمة المرور يجب أن تكون 8 أحرف على الأقل</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>تأكيد كلمة المرور الجديدة</mat-label>
                <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="confirmPassword" />
                <mat-icon matSuffix>lock</mat-icon>
                @if (resetForm.errors?.['passwordsMismatch'] && resetForm.get('confirmPassword')?.touched) {
                  <mat-error>كلمتا المرور غير متطابقتين</mat-error>
                }
              </mat-form-field>

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
                [disabled]="resetForm.invalid || isLoading()">
                @if (isLoading()) {
                  <mat-spinner diameter="20" />
                } @else {
                  حفظ كلمة المرور الجديدة
                }
              </button>
            </form>
          }
        </mat-card-content>

        <mat-card-actions>
          <p class="auth-switch">
            تذكرت كلمة المرور؟
            <a routerLink="/auth/login" color="primary">تسجيل الدخول</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 120px); padding: 24px 16px; }
    .auth-card { width: 100%; max-width: 440px; padding: 16px; }
    .auth-header { text-align: center; width: 100%; padding: 16px 0; }
    .auth-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
    .auth-form { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
    .full-width { width: 100%; }
    .submit-btn { width: 100%; height: 48px; font-size: 16px; margin-top: 8px; }
    .error-banner { display: flex; align-items: center; gap: 8px; background: #ffebee; color: #c62828; padding: 12px 16px; border-radius: 8px; font-size: 14px; }
    .success-banner { display: flex; align-items: center; gap: 8px; background: #e8f5e9; color: #2e7d32; padding: 12px 16px; border-radius: 8px; font-size: 14px; }
    .auth-switch { text-align: center; color: var(--mat-sys-on-surface-variant); width: 100%; }
    .auth-switch a { color: var(--mat-sys-primary); font-weight: 600; cursor: pointer; }
  `]
})
export class ForgotPasswordComponent {
  step = signal<1 | 2>(1);
  showPassword = false;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  targetEmail = signal('');

  requestForm: FormGroup;
  resetForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetForm = this.fb.group(
      {
        token: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatchValidator }
    );

    this.requestForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) {
        this.errorMessage.set('');
        this.cdr.markForCheck();
      }
    });

    this.resetForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) {
        this.errorMessage.set('');
        this.cdr.markForCheck();
      }
    });
  }

  async onRequestOtp(): Promise<void> {
    if (this.requestForm.invalid || this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.cdr.markForCheck();

    try {
      const email = this.requestForm.value.email;
      await this.authService.forgotPassword(email);
      this.targetEmail.set(email);
      this.step.set(2);
    } catch (err: any) {
      const msg = err?.error?.message || 'حدث خطأ أثناء طلب رمز التحقق';
      this.errorMessage.set(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  async onResetPassword(): Promise<void> {
    if (this.resetForm.invalid || this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.cdr.markForCheck();

    try {
      const { token, newPassword } = this.resetForm.value;
      await this.authService.resetPassword(this.targetEmail(), token, newPassword);
      this.successMessage.set('تم تحديث كلمة المرور بنجاح! جاري تحويلك لصفحة الدخول...');
      setTimeout(() => this.router.navigate(['/auth/login']), 2000);
    } catch (err: any) {
      const msg = err?.error?.message || 'رمز التحقق منتهي الصلاحية أو غير صحيح';
      this.errorMessage.set(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }
}
