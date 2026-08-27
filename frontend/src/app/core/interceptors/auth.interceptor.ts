import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('taqyeemy_token');

  let authReq = req;
  if (token && (req.url.includes(environment.apiUrl) || req.url.includes(':3000') || req.url.includes('vercel.app'))) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/register') && !req.url.includes('/auth/verify-otp')) {
        localStorage.removeItem('taqyeemy_token');
        localStorage.removeItem('taqyeemy_user');
        router.navigate(['/auth/login'], { queryParams: { expired: 'true' } });
      }
      return throwError(() => error);
    }),
  );
};

