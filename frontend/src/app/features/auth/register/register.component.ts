import { Component, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatchValidator(group: AbstractControl) {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="auth-header">
            <mat-icon color="primary" class="auth-icon">person_add</mat-icon>
            <mat-card-title>إنشاء حساب جديد</mat-card-title>
            <mat-card-subtitle>انضم إلى تقييمي مجاناً</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>الاسم الكامل</mat-label>
              <input matInput formControlName="fullName" placeholder="أحمد محمد" />
              <mat-icon matSuffix>person</mat-icon>
              @if (registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched) {
                <mat-error>الاسم مطلوب (3 أحرف على الأقل)</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>البريد الإلكتروني</mat-label>
              <input matInput type="email" formControlName="email" placeholder="example@email.com" />
              <mat-icon matSuffix>email</mat-icon>
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                <mat-error>يرجى إدخال بريد إلكتروني صحيح</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>كلمة المرور</mat-label>
              <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="password" />
              <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <mat-error>كلمة المرور يجب أن تكون 8 أحرف على الأقل</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>تأكيد كلمة المرور</mat-label>
              <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="confirmPassword" />
              <mat-icon matSuffix>lock</mat-icon>
              @if (registerForm.errors?.['passwordsMismatch'] && registerForm.get('confirmPassword')?.touched) {
                <mat-error>كلمتا المرور غير متطابقتين</mat-error>
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
              [disabled]="registerForm.invalid || isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20" />
              } @else {
                إنشاء الحساب
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="auth-switch">
            لديك حساب بالفعل؟
            <a routerLink="/auth/login">تسجيل الدخول</a>
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
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.registerForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatchValidator }
    );

    this.registerForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) {
        this.errorMessage.set('');
        this.cdr.markForCheck();
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid || this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.cdr.markForCheck();

    try {
      const { email, password, fullName } = this.registerForm.value;
      await this.authService.register(email, password, fullName);
    } catch {
      this.errorMessage.set('حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }
}
