import { Component, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="auth-header">
            <mat-icon color="primary" class="auth-icon">school</mat-icon>
            <mat-card-title>مرحباً بك في تقييمي</mat-card-title>
            <mat-card-subtitle>سجّل دخولك للمتابعة</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>البريد الإلكتروني</mat-label>
              <input matInput type="email" formControlName="email" placeholder="example@email.com" />
              <mat-icon matSuffix>email</mat-icon>
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <mat-error>يرجى إدخال بريد إلكتروني صحيح</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>كلمة المرور</mat-label>
              <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="password" />
              <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <mat-error>كلمة المرور مطلوبة</mat-error>
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
              [disabled]="loginForm.invalid || isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20" />
              } @else {
                تسجيل الدخول
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="auth-switch">
            ليس لديك حساب؟
            <a routerLink="/auth/register" color="primary">أنشئ حسابًا جديدًا</a>
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
    .auth-switch { text-align: center; color: var(--mat-sys-on-surface-variant); }
    .auth-switch a { color: var(--mat-sys-primary); font-weight: 600; cursor: pointer; }
    mat-card-header { padding-bottom: 0; }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // Clear error message immediately when user starts typing again
    this.loginForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) {
        this.errorMessage.set('');
        this.cdr.markForCheck();
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid || this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.cdr.markForCheck();

    try {
      const { email, password } = this.loginForm.value;
      await this.authService.login(email, password);
    } catch {
      this.errorMessage.set('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }
}
