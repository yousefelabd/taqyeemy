import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'test-selection',
    canActivate: [authGuard],
    loadComponent: () => import('./features/test-selection/test-selection.component').then(m => m.TestSelectionComponent),
  },
  {
    path: 'test',
    canActivate: [authGuard],
    loadComponent: () => import('./features/test/test.component').then(m => m.TestComponent),
  },
  {
    path: 'result/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/result/result.component').then(m => m.ResultComponent),
  },
  {
    path: 'history',
    canActivate: [authGuard],
    loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent),
  },
  { path: '**', redirectTo: '' },
];
