import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { TestService } from '../../core/services/test.service';
import { CefrLevel } from '../../core/models/test.model';

@Component({
  selector: 'app-test-selection',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>اختر نوع الاختبار</h1>
        <p>حدد ما يناسبك للحصول على أفضل نتيجة</p>
      </div>

      <div class="selection-grid">
        <!-- Placement Test Card -->
        <mat-card
          class="selection-card"
          [class.selected]="selectedType === 'placement'"
          (click)="selectType('placement')">
          <mat-card-content>
            <div class="card-icon-wrapper placement-bg">
              <mat-icon>psychology</mat-icon>
            </div>
            <h2>تحديد المستوى</h2>
            <p class="card-desc">
              لا تعرف مستواك؟ هذا الاختبار يبدأ من الأساسيات ويتدرج حتى الاحترافي ليحدد مستواك الدقيق من A1 إلى C2.
            </p>
            <div class="card-meta">
              <span><mat-icon class="meta-icon">timer</mat-icon> ~20-25 دقيقة</span>
              <span><mat-icon class="meta-icon">quiz</mat-icon> 18 سؤالاً</span>
            </div>
            <div class="card-badge">الأكثر شيوعاً</div>
          </mat-card-content>
        </mat-card>

        <!-- Specific Level Card -->
        <mat-card
          class="selection-card"
          [class.selected]="selectedType === 'specific'"
          (click)="selectType('specific')">
          <mat-card-content>
            <div class="card-icon-wrapper specific-bg">
              <mat-icon>track_changes</mat-icon>
            </div>
            <h2>اختبار مستوى معين</h2>
            <p class="card-desc">
              تريد التحقق من مستوى بعينه؟ اختر المستوى الذي تريد اختباره وسنوفر لك أسئلة مخصصة له.
            </p>

            @if (selectedType === 'specific') {
              <mat-form-field appearance="outline" class="level-select full-width">
                <mat-label>اختر المستوى</mat-label>
                <mat-select [(ngModel)]="selectedLevel">
                  @for (level of cefrLevels; track level.code) {
                    <mat-option [value]="level.code">
                      {{ level.code }} — {{ level.arabic }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }

            <div class="card-meta">
              <span><mat-icon class="meta-icon">timer</mat-icon> ~10-15 دقيقة</span>
              <span><mat-icon class="meta-icon">quiz</mat-icon> 10 أسئلة</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="action-area">
        <button
          mat-raised-button
          color="primary"
          class="start-btn"
          [disabled]="!canStart() || isLoading"
          (click)="startTest()">
          @if (isLoading) {
            <mat-spinner diameter="20" />
          } @else {
            <mat-icon>play_arrow</mat-icon>
            ابدأ الاختبار
          }
        </button>
        <p class="disclaimer">
          <mat-icon class="disclaimer-icon">info</mat-icon>
          ستُقيَّم إجاباتك بالذكاء الاصطناعي بعد الانتهاء
        </p>
      </div>
    </div>
  `,
  styles: [`
    .page-header { text-align: center; margin-bottom: 48px; }
    .page-header h1 { font-size: 2rem; font-weight: 700; color: var(--mat-sys-primary); margin: 0 0 8px; }
    .page-header p { color: var(--mat-sys-on-surface-variant); font-size: 1.1rem; }
    .selection-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 900px; margin: 0 auto 48px; }
    @media (max-width: 768px) { .selection-grid { grid-template-columns: 1fr; } }
    .selection-card { cursor: pointer; transition: all 0.2s ease; position: relative; border: 2px solid transparent; }
    .selection-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateY(-2px); }
    .selection-card.selected { border-color: var(--mat-sys-primary); box-shadow: 0 0 0 2px var(--mat-sys-primary-container); }
    .card-icon-wrapper { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
    .card-icon-wrapper mat-icon { font-size: 32px; width: 32px; height: 32px; color: white; }
    .placement-bg { background: linear-gradient(135deg, #7c3aed, #6d28d9); }
    .specific-bg { background: linear-gradient(135deg, #0891b2, #0e7490); }
    h2 { font-size: 1.3rem; font-weight: 700; margin: 0 0 12px; }
    .card-desc { color: var(--mat-sys-on-surface-variant); line-height: 1.7; margin: 0 0 16px; }
    .card-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; color: var(--mat-sys-on-surface-variant); margin-bottom: 16px; }
    .card-meta span { display: flex; align-items: center; gap: 4px; }
    .meta-icon { font-size: 16px; width: 16px; height: 16px; }
    .card-badge { display: inline-block; background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .level-select { margin-bottom: 16px; }
    .full-width { width: 100%; }
    .action-area { text-align: center; }
    .start-btn { height: 52px; font-size: 18px; padding: 0 40px; }
    .disclaimer { display: flex; align-items: center; justify-content: center; gap: 6px; color: var(--mat-sys-on-surface-variant); font-size: 13px; margin-top: 16px; }
    .disclaimer-icon { font-size: 16px; width: 16px; height: 16px; }
  `]
})
export class TestSelectionComponent {
  private testService = inject(TestService);
  private router = inject(Router);

  selectedType: 'placement' | 'specific' | null = null;
  selectedLevel: CefrLevel | null = null;
  isLoading = false;

  cefrLevels = [
    { code: 'A1' as CefrLevel, arabic: 'مبتدئ' },
    { code: 'A2' as CefrLevel, arabic: 'أساسي' },
    { code: 'B1' as CefrLevel, arabic: 'متوسط' },
    { code: 'B2' as CefrLevel, arabic: 'فوق المتوسط' },
    { code: 'C1' as CefrLevel, arabic: 'متقدم' },
    { code: 'C2' as CefrLevel, arabic: 'احترافي' },
  ];

  selectType(type: 'placement' | 'specific'): void {
    this.selectedType = type;
    if (type === 'placement') this.selectedLevel = null;
  }

  canStart(): boolean {
    if (!this.selectedType) return false;
    if (this.selectedType === 'specific' && !this.selectedLevel) return false;
    return true;
  }

  async startTest(): Promise<void> {
    if (!this.canStart()) return;
    this.isLoading = true;
    try {
      await this.testService.startSession(this.selectedType!, this.selectedLevel ?? undefined);
      this.router.navigate(['/test']);
    } finally {
      this.isLoading = false;
    }
  }
}
