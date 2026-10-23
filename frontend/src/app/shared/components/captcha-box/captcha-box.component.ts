import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-captcha-box',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="captcha-container" [class.verified]="isVerified()">
      <div class="captcha-header">
        <span class="captcha-label">
          <mat-icon class="shield-icon">{{ isVerified() ? 'verified_user' : 'security' }}</mat-icon>
          التحقق الأمني (Captcha)
        </span>
        <button
          type="button"
          mat-icon-button
          class="refresh-btn"
          aria-label="تحديث رمز التحقق"
          (click)="generateChallenge()">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      <div class="captcha-body">
        <div class="captcha-visual" aria-hidden="true" dir="ltr">
          <span class="captcha-code">{{ challengeText() }}</span>
        </div>

        <input
          type="text"
          dir="ltr"
          class="captcha-input"
          [ngModel]="userAnswer()"
          (ngModelChange)="onAnswerChange($event)"
          placeholder="اكتب الناتج / الرمز"
          autocomplete="off"
          aria-label="أدخل رمز التحقق الأمني" />
      </div>

      @if (isVerified()) {
        <div class="captcha-status success">
          <mat-icon>check_circle</mat-icon>
          <span>تم التحقق بنجاح</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .captcha-container {
      border: 1px solid #d0d7de;
      border-radius: 10px;
      padding: 12px 14px;
      background: var(--mat-sys-surface-container-low, #f8f9fa);
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: border-color 0.2s ease, background-color 0.2s ease;
    }
    .captcha-container.verified {
      border-color: #2e7d32;
      background: rgba(46, 125, 50, 0.05);
    }
    .captcha-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .captcha-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 700;
      color: var(--mat-sys-on-surface);
    }
    .shield-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--mat-sys-primary);
    }
    .captcha-container.verified .shield-icon {
      color: #2e7d32;
    }
    .refresh-btn {
      width: 30px;
      height: 30px;
      line-height: 30px;
    }
    .captcha-body {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .captcha-visual {
      flex: 1;
      background: repeating-linear-gradient(
        -45deg,
        #ede7f6,
        #ede7f6 8px,
        #e1bee7 8px,
        #e1bee7 16px
      );
      border: 1px dashed #7b1fa2;
      border-radius: 8px;
      padding: 8px 12px;
      text-align: center;
      user-select: none;
    }
    .captcha-code {
      font-family: 'Courier New', monospace;
      font-weight: 800;
      font-size: 18px;
      letter-spacing: 3px;
      color: #311b92;
      text-shadow: 1px 1px 0 #fff;
    }
    .captcha-input {
      flex: 1;
      padding: 9px 12px;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      text-align: center;
      outline: none;
      background: #fff;
      color: #111;
    }
    .captcha-input:focus {
      border-color: var(--mat-sys-primary);
    }
    .captcha-status.success {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #2e7d32;
    }
    .captcha-status.success mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `],
})
export class CaptchaBoxComponent implements OnInit {
  @Output() verifiedChange = new EventEmitter<boolean>();

  challengeText = signal('');
  expectedAnswer = signal('');
  userAnswer = signal('');
  isVerified = signal(false);

  ngOnInit(): void {
    this.generateChallenge();
  }

  generateChallenge(): void {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 1;
    this.challengeText.set(`${a} + ${b} = ?`);
    this.expectedAnswer.set(String(a + b));
    this.userAnswer.set('');
    this.isVerified.set(false);
    this.verifiedChange.emit(false);
  }

  onAnswerChange(val: string): void {
    this.userAnswer.set(val);
    const clean = (val || '').trim();
    const ok = clean.length > 0 && clean === this.expectedAnswer();
    this.isVerified.set(ok);
    this.verifiedChange.emit(ok);
  }
}
