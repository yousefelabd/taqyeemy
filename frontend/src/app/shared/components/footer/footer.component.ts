import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <mat-icon>school</mat-icon>
          <span>تقييمي</span>
        </div>
        <p class="footer-tagline">اكتشف مستواك في اللغة الإنجليزية بدقة وسرعة</p>
        <p class="footer-copy">© {{ currentYear }} تقييمي — جميع الحقوق محفوظة</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--mat-sys-surface-container);
      border-top: 1px solid var(--mat-sys-outline-variant);
      padding: 24px 16px;
      text-align: center;
    }
    .footer-content { max-width: 1200px; margin: 0 auto; }
    .footer-brand {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 18px; font-weight: 700;
      color: var(--mat-sys-primary);
      margin-bottom: 8px;
    }
    .footer-tagline { color: var(--mat-sys-on-surface-variant); margin: 4px 0; font-size: 14px; }
    .footer-copy { color: var(--mat-sys-on-surface-variant); margin: 8px 0 0; font-size: 12px; }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
