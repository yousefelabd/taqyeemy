import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatDividerModule,
    MatSlideToggleModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatStepperModule,
  ],
  template: `
    <div class="page-container settings-page">
      <h1 class="page-title">
        <mat-icon>settings</mat-icon>
        إعدادات الحساب
      </h1>

      <!-- تغيير الاسم -->
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>person</mat-icon>
          <mat-card-title>تغيير الاسم</mat-card-title>
          <mat-card-subtitle>الاسم الظاهر في حسابك</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>الاسم الكامل</mat-label>
            <input matInput [(ngModel)]="newName" [placeholder]="currentUser()?.fullName || ''" />
            <mat-icon matSuffix>edit</mat-icon>
          </mat-form-field>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary"
            [disabled]="!newName.trim() || nameLoading()"
            (click)="saveName()">
            <mat-spinner *ngIf="nameLoading()" diameter="18" class="btn-spinner"></mat-spinner>
            <span *ngIf="!nameLoading()">حفظ الاسم</span>
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- تغيير كلمة المرور -->
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>lock</mat-icon>
          <mat-card-title>تغيير كلمة المرور</mat-card-title>
          <mat-card-subtitle>سيتم إرسال كود تحقق على بريدك الإلكتروني</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>

          <!-- الخطوة 1: إرسال الكود -->
          <div *ngIf="pwStep === 1" class="step-section">
            <p class="step-hint">اضغط على الزرار وهنبعتلك كود تحقق على إيميلك عشان تقدر تغير كلمة المرور.</p>
            <button mat-raised-button color="primary"
              [disabled]="otpLoading()"
              (click)="sendOtp()">
              <mat-spinner *ngIf="otpLoading()" diameter="18" class="btn-spinner"></mat-spinner>
              <span *ngIf="!otpLoading()">
                <mat-icon>send</mat-icon>
                إرسال كود التحقق
              </span>
            </button>
          </div>

          <!-- الخطوة 2: إدخال الكود وكلمة المرور الجديدة -->
          <div *ngIf="pwStep === 2" class="step-section">
            <p class="step-hint success-hint">✅ تم إرسال الكود على بريدك الإلكتروني — راجع الإيميل.</p>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>كود التحقق (6 أرقام)</mat-label>
              <input matInput [(ngModel)]="otpCode" maxlength="6" inputmode="numeric" placeholder="123456" />
              <mat-icon matSuffix>pin</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>كلمة المرور الجديدة</mat-label>
              <input matInput [type]="showNew ? 'text' : 'password'" [(ngModel)]="newPw" />
              <button matSuffix mat-icon-button (click)="showNew = !showNew">
                <mat-icon>{{ showNew ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-hint>6 أحرف على الأقل</mat-hint>
            </mat-form-field>
            <p *ngIf="pwError" class="field-error">⚠️ {{ pwError }}</p>
          </div>

          <!-- الخطوة 3: تم التغيير -->
          <div *ngIf="pwStep === 3" class="step-section success-section">
            <mat-icon class="success-icon">check_circle</mat-icon>
            <p>تم تغيير كلمة المرور بنجاح! 🎉</p>
          </div>

        </mat-card-content>
        <mat-card-actions *ngIf="pwStep === 2">
          <button mat-button (click)="pwStep = 1; otpCode = ''; newPw = ''; pwError = ''">
            إعادة الإرسال
          </button>
          <button mat-raised-button color="primary"
            [disabled]="otpCode.length !== 6 || newPw.length < 6 || pwLoading()"
            (click)="savePassword()">
            <mat-spinner *ngIf="pwLoading()" diameter="18" class="btn-spinner"></mat-spinner>
            <span *ngIf="!pwLoading()">تغيير كلمة المرور</span>
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- المظهر -->
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>{{ themeService.isDark() ? 'dark_mode' : 'light_mode' }}</mat-icon>
          <mat-card-title>المظهر</mat-card-title>
          <mat-card-subtitle>اختر بين الوضع الفاتح والداكن</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="theme-toggle-row">
            <span class="theme-label">
              <mat-icon>light_mode</mat-icon>
              فاتح
            </span>
            <mat-slide-toggle
              [checked]="themeService.isDark()"
              (change)="themeService.toggle()"
              color="primary">
            </mat-slide-toggle>
            <span class="theme-label">
              <mat-icon>dark_mode</mat-icon>
              داكن
            </span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- حذف الحساب -->
      <mat-card class="settings-card danger-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="danger-icon">delete_forever</mat-icon>
          <mat-card-title class="danger-title">حذف الحساب</mat-card-title>
          <mat-card-subtitle>هذا الإجراء لا يمكن التراجع عنه</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="danger-text">
            سيتم حذف حسابك وجميع نتائج اختباراتك بشكل نهائي ولا يمكن استعادتها.
          </p>
          <div *ngIf="showDeleteConfirm" class="delete-confirm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>اكتب "حذف حسابي" للتأكيد</mat-label>
              <input matInput [(ngModel)]="deleteConfirmText" />
            </mat-form-field>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button *ngIf="!showDeleteConfirm" mat-stroked-button color="warn"
            (click)="showDeleteConfirm = true">
            <mat-icon>delete_forever</mat-icon>
            حذف حسابي
          </button>
          <ng-container *ngIf="showDeleteConfirm">
            <button mat-button (click)="showDeleteConfirm = false; deleteConfirmText = ''">إلغاء</button>
            <button mat-raised-button color="warn"
              [disabled]="deleteConfirmText !== 'حذف حسابي' || deleteLoading()"
              (click)="confirmDelete()">
              <mat-spinner *ngIf="deleteLoading()" diameter="18" class="btn-spinner"></mat-spinner>
              <span *ngIf="!deleteLoading()">تأكيد الحذف النهائي</span>
            </button>
          </ng-container>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-page { max-width: 640px; }
    .page-title { display: flex; align-items: center; gap: 10px; font-family: 'Cairo', sans-serif; margin-bottom: 24px; color: var(--mat-sys-on-surface); }
    .settings-card { margin-bottom: 20px; border-radius: 16px !important; }
    .full-width { width: 100%; margin-top: 12px; }
    mat-card-content { padding-top: 8px !important; }
    mat-card-actions { padding: 8px 16px 16px !important; gap: 8px; }
    .btn-spinner { display: inline-block; margin-left: 4px; }
    .field-error { color: var(--mat-sys-error); font-size: 13px; margin-top: -8px; }
    .theme-toggle-row { display: flex; align-items: center; gap: 16px; padding: 8px 0; }
    .theme-label { display: flex; align-items: center; gap: 4px; font-weight: 600; }
    .step-section { padding: 8px 0; }
    .step-hint { color: var(--mat-sys-on-surface-variant); font-size: 14px; margin-bottom: 16px; }
    .success-hint { color: #2e7d32; font-weight: 600; }
    .success-section { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 0; }
    .success-icon { font-size: 48px; width: 48px; height: 48px; color: #2e7d32; }
    .danger-card { border: 2px solid var(--mat-sys-error-container) !important; }
    .danger-icon { color: var(--mat-sys-error) !important; }
    .danger-title { color: var(--mat-sys-error) !important; }
    .danger-text { color: var(--mat-sys-on-surface-variant); font-size: 14px; line-height: 1.6; }
    .delete-confirm { margin-top: 12px; }
  `],
})
export class SettingsComponent {
  private authService   = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private snackBar      = inject(MatSnackBar);

  currentUser = this.authService.currentUser;

  // Name
  newName     = '';
  nameLoading = signal(false);

  // Password OTP flow
  pwStep    = 1; // 1=send, 2=verify, 3=done
  otpCode   = '';
  newPw     = '';
  pwError   = '';
  otpLoading = signal(false);
  pwLoading  = signal(false);
  showNew    = false;

  // Delete
  showDeleteConfirm = false;
  deleteConfirmText = '';
  deleteLoading     = signal(false);

  async saveName() {
    const name = this.newName.trim();
    if (!name) return;
    this.nameLoading.set(true);
    try {
      await this.authService.updateName(name);
      this.snackBar.open('تم تحديث الاسم بنجاح ✅', 'إغلاق', { duration: 3000 });
      this.newName = '';
    } catch (err: any) {
      const msg = err?.error?.message || 'حدث خطأ أثناء تحديث الاسم';
      this.snackBar.open(Array.isArray(msg) ? msg[0] : msg, 'إغلاق', { duration: 4000 });
    } finally {
      this.nameLoading.set(false);
    }
  }

  async sendOtp() {
    this.otpLoading.set(true);
    try {
      await this.authService.requestPasswordChangeOtp();
      this.pwStep = 2;
    } catch (err: any) {
      const msg = err?.error?.message || 'حدث خطأ أثناء إرسال الكود';
      this.snackBar.open(Array.isArray(msg) ? msg[0] : msg, 'إغلاق', { duration: 4000 });
    } finally {
      this.otpLoading.set(false);
    }
  }

  async savePassword() {
    this.pwError = '';
    if (this.newPw.length < 6) { this.pwError = 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'; return; }
    if (this.otpCode.length !== 6) { this.pwError = 'كود التحقق يجب أن يكون 6 أرقام'; return; }
    this.pwLoading.set(true);
    try {
      await this.authService.updatePassword(this.otpCode, this.newPw);
      this.pwStep = 3;
      this.otpCode = '';
      this.newPw   = '';
    } catch (err: any) {
      const msg = err?.error?.message || 'كود التحقق غير صحيح أو منتهي الصلاحية';
      this.pwError = Array.isArray(msg) ? msg[0] : msg;
    } finally {
      this.pwLoading.set(false);
    }
  }

  async confirmDelete() {
    if (this.deleteConfirmText !== 'حذف حسابي') return;
    this.deleteLoading.set(true);
    try {
      await this.authService.deleteAccount();
    } catch (err: any) {
      const msg = err?.error?.message || 'حدث خطأ أثناء حذف الحساب';
      this.snackBar.open(Array.isArray(msg) ? msg[0] : msg, 'إغلاق', { duration: 4000 });
    } finally {
      this.deleteLoading.set(false);
    }
  }
}
