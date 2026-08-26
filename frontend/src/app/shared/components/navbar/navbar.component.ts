import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <a routerLink="/" class="brand">
        <mat-icon>school</mat-icon>
        <span class="brand-name">تقييمي</span>
      </a>

      <span class="spacer"></span>

      @if (isAuthenticated()) {
        <nav class="nav-links">
          <a mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}">الرئيسية</a>
          <a mat-button routerLink="/test-selection" routerLinkActive="active-link">اختبار جديد</a>
          <a mat-button routerLink="/history" routerLinkActive="active-link">سجل الاختبارات</a>
        </nav>

        <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-btn">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <div class="user-info-menu">
            <mat-icon>person</mat-icon>
            <span>{{ currentUser()?.fullName }}</span>
          </div>
          <mat-divider />
          <a mat-menu-item routerLink="/settings">
            <mat-icon>settings</mat-icon>
            الإعدادات
          </a>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            تسجيل الخروج
          </button>
        </mat-menu>
      } @else {
        <a mat-button routerLink="/auth/login">تسجيل الدخول</a>
        <a mat-raised-button routerLink="/auth/register" class="register-btn">إنشاء حساب</a>
      }
    </mat-toolbar>
  `,
  styles: [`
    .navbar { position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; color: white; font-size: 20px; font-weight: 700; }
    .brand-name { font-family: 'Cairo', sans-serif; }
    .spacer { flex: 1; }
    .nav-links { display: flex; gap: 4px; }
    .active-link { background: rgba(255,255,255,0.15); border-radius: 4px; }
    .user-btn { margin-right: 8px; }
    .register-btn { margin-right: 8px; }
    .user-info-menu { display: flex; align-items: center; gap: 8px; padding: 12px 16px; color: rgba(0,0,0,0.6); font-family: 'Cairo', sans-serif; }
  `]
})
export class NavbarComponent {
  private authService = inject(AuthService);
  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;

  logout(): void {
    this.authService.logout();
  }
}

