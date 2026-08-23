import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ResultsService } from '../../core/services/results.service';
import { ResultSummary } from '../../core/models/result.model';
import { CefrLevel } from '../../core/models/test.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RouterLink, DatePipe, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>سجل الاختبارات</h1>
        <p>جميع اختباراتك السابقة المخزنة في حسابك</p>
      </div>

      @if (isLoading()) {
        <div class="loading-state">
          <mat-spinner diameter="40" />
          <p>جاري تحميل سجل الاختبارات من الخادم...</p>
        </div>
      } @else if (errorMessage()) {
        <div class="error-state">
          <mat-icon color="warn">error</mat-icon>
          <p>{{ errorMessage() }}</p>
        </div>
      } @else {
        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <mat-icon color="primary">quiz</mat-icon>
              <div class="stat-value">{{ history().length }}</div>
              <div class="stat-label">اختبار مكتمل</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card">
            <mat-card-content>
              <mat-icon color="primary">grade</mat-icon>
              <div class="stat-value">{{ bestLevel() }}</div>
              <div class="stat-label">أعلى مستوى محقق</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card">
            <mat-card-content>
              <mat-icon color="primary">trending_up</mat-icon>
              <div class="stat-value">{{ avgScore() }}%</div>
              <div class="stat-label">متوسط الدرجات</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Filter -->
        <div class="filter-row">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>فلترة حسب المستوى</mat-label>
            <mat-select [(ngModel)]="filterLevel" (ngModelChange)="applyFilter()">
              <mat-option [value]="null">جميع المستويات</mat-option>
              @for (level of cefrLevels; track level) {
                <mat-option [value]="level">{{ level }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <!-- History Table -->
        @if (filteredHistory().length > 0) {
          <mat-card>
            <table mat-table [dataSource]="filteredHistory()" class="history-table">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>التاريخ</th>
                <td mat-cell *matCellDef="let row">{{ row.completedAt | date: 'dd/MM/yyyy' }}</td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>نوع الاختبار</th>
                <td mat-cell *matCellDef="let row">
                  {{ row.testType === 'placement' ? 'تحديد المستوى' : 'مستوى محدد' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="level">
                <th mat-header-cell *matHeaderCellDef>المستوى</th>
                <td mat-cell *matCellDef="let row">
                  <span [class]="'level-badge level-' + row.level.toLowerCase()">{{ row.level }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="score">
                <th mat-header-cell *matHeaderCellDef>الدرجة</th>
                <td mat-cell *matCellDef="let row">
                  <div class="score-cell">
                    <span class="score-value" [class.high]="row.score >= 70" [class.low]="row.score < 50">
                      {{ row.score }}%
                    </span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>التفاصيل</th>
                <td mat-cell *matCellDef="let row">
                  <a mat-icon-button [routerLink]="['/result', row.id]" color="primary">
                    <mat-icon>visibility</mat-icon>
                  </a>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="history-row"></tr>
            </table>
          </mat-card>
        } @else {
          <div class="empty-state">
            <mat-icon>history</mat-icon>
            <p>لا توجد اختبارات سابقة مسجلة حتى الآن.</p>
          </div>
        }
      }

      <div class="history-actions">
        <a mat-raised-button color="primary" routerLink="/test-selection">
          <mat-icon>add</mat-icon>
          اختبار جديد
        </a>
      </div>
    </div>
  `,
  styles: [`
    .page-header { text-align: center; margin-bottom: 40px; }
    .page-header h1 { font-size: 2rem; font-weight: 700; color: var(--mat-sys-primary); margin: 0 0 8px; }
    .page-header p { color: var(--mat-sys-on-surface-variant); }
    .loading-state { text-align: center; padding: 48px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .error-state { text-align: center; padding: 48px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: var(--mat-sys-error); }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    @media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr; } }
    .stat-card mat-card-content { text-align: center; padding: 24px 16px; }
    .stat-card mat-icon { font-size: 36px; width: 36px; height: 36px; margin-bottom: 8px; }
    .stat-value { font-size: 2rem; font-weight: 700; color: var(--mat-sys-primary); }
    .stat-label { color: var(--mat-sys-on-surface-variant); font-size: 14px; margin-top: 4px; }
    .filter-row { margin-bottom: 24px; }
    .filter-field { min-width: 220px; }
    .history-table { width: 100%; }
    .history-row:hover { background: var(--mat-sys-surface-container-low); }
    .score-cell { display: flex; align-items: center; gap: 8px; }
    .score-value { font-weight: 700; font-size: 16px; }
    .score-value.high { color: #2e7d32; }
    .score-value.low { color: #c62828; }
    .empty-state { text-align: center; padding: 64px 16px; color: var(--mat-sys-on-surface-variant); }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; display: block; margin: 0 auto 16px; }
    .history-actions { margin-top: 32px; text-align: center; }
  `]
})
export class HistoryComponent implements OnInit {
  private resultsService = inject(ResultsService);

  history = signal<ResultSummary[]>([]);
  filteredHistory = signal<ResultSummary[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  filterLevel: CefrLevel | null = null;
  displayedColumns = ['date', 'type', 'level', 'score', 'actions'];
  cefrLevels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  async ngOnInit(): Promise<void> {
    try {
      const h = await this.resultsService.getHistory();
      this.history.set(h);
      this.filteredHistory.set(h);
    } catch {
      this.errorMessage.set('حدث خطأ أثناء تحميل السجل، يرجى المحاولة مرة أخرى');
    } finally {
      this.isLoading.set(false);
    }
  }

  applyFilter(): void {
    if (this.filterLevel) {
      this.filteredHistory.set(this.history().filter((r) => r.level === this.filterLevel));
    } else {
      this.filteredHistory.set(this.history());
    }
  }

  bestLevel(): string {
    const order: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const levels = this.history().map((r) => r.level);
    if (!levels.length) return 'N/A';
    return levels.reduce((best, cur) => (order.indexOf(cur) > order.indexOf(best) ? cur : best));
  }

  avgScore(): number {
    const h = this.history();
    if (!h.length) return 0;
    return Math.round(h.reduce((sum, r) => sum + r.score, 0) / h.length);
  }
}