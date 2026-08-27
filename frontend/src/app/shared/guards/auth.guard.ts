import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (authService.isAuthenticated()) {
    return true;
  }

  snackBar.open('⚠️ يرجى تسجيل الدخول أولاً للبدء في الاختبار', 'إغلاق', {
    duration: 3500,
  });

  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};

