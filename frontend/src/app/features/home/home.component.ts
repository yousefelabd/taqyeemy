import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page-container">
      <!-- Hero -->
      <section class="hero">
        <div class="hero-text">
          <h1 class="hero-title">اكتشف مستواك في اللغة الإنجليزية</h1>
          <p class="hero-subtitle">
            اختبار دقيق ومتكيف يحدد مستواك وفق معيار CEFR العالمي، من A1 إلى C2،
            مع تقرير مفصّل بنقاط قوتك وما تحتاج إلى تطويره.
          </p>
          <div class="hero-actions">
            @if (isAuthenticated()) {
              <a mat-raised-button color="primary" routerLink="/test-selection" class="cta-btn">
                <mat-icon>play_arrow</mat-icon>
                ابدأ الاختبار الآن
              </a>
            } @else {
              <a mat-raised-button color="primary" routerLink="/auth/register" class="cta-btn">
                <mat-icon>person_add</mat-icon>
                أنشئ حسابك مجانًا
              </a>
              <a mat-stroked-button routerLink="/auth/login" class="cta-btn">
                تسجيل الدخول
              </a>
            }
          </div>
        </div>
        <div class="hero-visual">
          <div class="cefr-visual">
            @for (level of cefrLevels; track level.code) {
              <div class="cefr-bar">
                <span class="level-code">{{ level.code }}</span>
                <div class="level-bar" [style.height.px]="level.barHeight"
                     [class]="'bar-fill level-' + level.code.toLowerCase()"></div>
                <span class="level-label">{{ level.label }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section class="how-it-works">
        <h2 class="section-title">كيف يعمل تقييمي؟</h2>
        <div class="steps-grid">
          @for (step of steps; track step.number) {
            <mat-card class="step-card">
              <mat-card-content>
                <div class="step-number">{{ step.number }}</div>
                <mat-icon class="step-icon" color="primary">{{ step.icon }}</mat-icon>
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </section>

      <!-- CEFR Levels -->
      <section class="levels-section">
        <h2 class="section-title">مستويات CEFR</h2>
        <div class="levels-grid">
          @for (level of cefrLevels; track level.code) {
            <mat-card class="level-card">
              <mat-card-content>
                <span [class]="'level-badge level-' + level.code.toLowerCase()">{{ level.code }}</span>
                <h3 class="level-title">{{ level.arabic }}</h3>
                <p class="level-desc">{{ level.description }}</p>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </section>

      <!-- Features -->
      <section class="features-section">
        <h2 class="section-title">لماذا تقييمي؟</h2>
        <div class="features-grid">
          @for (feature of features; track feature.title) {
            <div class="feature-item">
              <mat-icon color="primary" class="feature-icon">{{ feature.icon }}</mat-icon>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; padding: 64px 0 48px; }
    @media (max-width: 768px) { .hero { grid-template-columns: 1fr; } .hero-visual { display: none; } }
    .hero-title { font-size: 2.5rem; font-weight: 700; line-height: 1.3; margin: 0 0 16px; color: var(--mat-sys-primary); }
    .hero-subtitle { font-size: 1.1rem; color: var(--mat-sys-on-surface-variant); line-height: 1.8; margin: 0 0 32px; }
    .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
    .cta-btn { font-size: 16px; padding: 0 24px; height: 48px; }
    .cefr-visual { display: flex; align-items: flex-end; gap: 12px; height: 220px; padding: 16px; background: var(--mat-sys-surface-container); border-radius: 16px; }
    .cefr-bar { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
    .level-code { font-weight: 700; font-size: 13px; }
    .bar-fill { width: 100%; border-radius: 4px 4px 0 0; }
    .bar-fill.level-a1 { background: #4caf50; }
    .bar-fill.level-a2 { background: #8bc34a; }
    .bar-fill.level-b1 { background: #ffb300; }
    .bar-fill.level-b2 { background: #ff7043; }
    .bar-fill.level-c1 { background: #e53935; }
    .bar-fill.level-c2 { background: #7b1fa2; }
    .level-label { font-size: 9px; color: var(--mat-sys-on-surface-variant); text-align: center; }
    .section-title { font-size: 1.8rem; font-weight: 700; text-align: center; margin: 0 0 32px; }
    .how-it-works { padding: 48px 0; }
    .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
    .step-card { text-align: center; padding: 8px; }
    .step-number { width: 40px; height: 40px; border-radius: 50%; background: var(--mat-sys-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; margin: 0 auto 12px; }
    .step-icon { font-size: 36px; width: 36px; height: 36px; margin-bottom: 12px; }
    .levels-section { padding: 48px 0; }
    .levels-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
    .level-card mat-card-content { text-align: center; padding: 20px 16px; }
    .level-title { margin: 12px 0 8px; font-size: 15px; font-weight: 700; }
    .level-desc { color: var(--mat-sys-on-surface-variant); font-size: 13px; margin: 0; line-height: 1.6; }
    .features-section { padding: 48px 0 24px; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; }
    .feature-item { text-align: center; }
    .feature-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; display: block; }
  `]
})
export class HomeComponent {
  private authService = inject(AuthService);
  isAuthenticated = this.authService.isAuthenticated;

  cefrLevels = [
    { code: 'A1', arabic: 'مبتدئ', description: 'يمكنه فهم وإستخدام التعبيرات اليومية الأساسية.', barHeight: 40, label: 'Beginner' },
    { code: 'A2', arabic: 'أساسي', description: 'يمكنه التواصل في مواقف بسيطة ومعتادة.', barHeight: 65, label: 'Elementary' },
    { code: 'B1', arabic: 'متوسط', description: 'يمكنه التعامل مع معظم المواقف في السفر والعمل.', barHeight: 95, label: 'Intermediate' },
    { code: 'B2', arabic: 'فوق المتوسط', description: 'يمكنه فهم النصوص المعقدة والتعبير بطلاقة.', barHeight: 125, label: 'Upper-Int.' },
    { code: 'C1', arabic: 'متقدم', description: 'يمكنه استخدام اللغة بمرونة في البيئات الأكاديمية.', barHeight: 155, label: 'Advanced' },
    { code: 'C2', arabic: 'احترافي', description: 'يفهم كل شيء بسهولة ويتحدث بطلاقة تامة.', barHeight: 185, label: 'Proficiency' },
  ];

  steps = [
    { number: 1, icon: 'person_add', title: 'أنشئ حسابك', description: 'سجّل بريدك الإلكتروني وكلمة المرور خلال ثوانٍ.' },
    { number: 2, icon: 'tune', title: 'اختر نوع الاختبار', description: 'اختر بين تحديد المستوى أو اختبار مستوى معين.' },
    { number: 3, icon: 'quiz', title: 'أجب على الأسئلة', description: 'أسئلة متعددة الخيارات وكتابية باللغة الإنجليزية.' },
    { number: 4, icon: 'insights', title: 'احصل على تقريرك', description: 'مستواك + درجتك + نقاط القوة والضعف.' },
  ];

  features = [
    { icon: 'psychology', title: 'تحليل ذكي', description: 'يعتمد على الذكاء الاصطناعي لتقييم إجاباتك.' },
    { icon: 'verified', title: 'معيار CEFR', description: 'نتائج متوافقة مع الإطار الأوروبي المرجعي.' },
    { icon: 'history', title: 'تتبع التقدم', description: 'احتفظ بسجل اختباراتك وشاهد تطورك.' },
    { icon: 'language', title: 'واجهة عربية', description: 'واجهة كاملة بالعربية مع محتوى اختبار بالإنجليزية.' },
  ];
}
