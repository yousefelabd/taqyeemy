import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User, AuthState } from '../models/user.model';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/auth`;
const TOKEN_KEY = 'taqyeemy_token';
const USER_KEY  = 'taqyeemy_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private _authState = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  readonly authState       = this._authState.asReadonly();
  readonly currentUser     = computed(() => this._authState().user);
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);

  constructor() { this.restoreSession(); }

  private restoreSession(): void {
    try {
      const token   = localStorage.getItem(TOKEN_KEY);
      const userRaw = localStorage.getItem(USER_KEY);
      if (token && userRaw) {
        const user: User = JSON.parse(userRaw);
        this._authState.set({ user, isAuthenticated: true, isLoading: false });
      }
    } catch { this.logout(); }
  }

  async login(email: string, password: string): Promise<void> {
    this._authState.update(s => ({ ...s, isLoading: true }));
    try {
      const res = await firstValueFrom(
        this.http.post<{ message: string; token: string; user: any }>(`${API_URL}/login`, { email, password }),
      );
      const user: User = { id: res.user.id, email: res.user.email, fullName: res.user.fullName, createdAt: new Date() };
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      this._authState.set({ user, isAuthenticated: true, isLoading: false });
      this.router.navigate(['/']);
    } catch (err) {
      this._authState.update(s => ({ ...s, isLoading: false }));
      throw err;
    }
  }

  async register(email: string, password: string, fullName: string): Promise<{ requiresOtp: boolean; email: string }> {
    this._authState.update(s => ({ ...s, isLoading: true }));
    try {
      const res = await firstValueFrom(
        this.http.post<{ message: string; requiresOtp: boolean; email: string }>(`${API_URL}/register`, { fullName, email, password }),
      );
      this._authState.update(s => ({ ...s, isLoading: false }));
      return { requiresOtp: true, email: res.email || email };
    } catch (err) {
      this._authState.update(s => ({ ...s, isLoading: false }));
      throw err;
    }
  }

  async verifyOtp(email: string, token: string, type: 'signup' | 'recovery'): Promise<void> {
    this._authState.update(s => ({ ...s, isLoading: true }));
    try {
      const res = await firstValueFrom(
        this.http.post<{ message: string; token: string; user: any }>(`${API_URL}/verify-otp`, { email, token, type }),
      );
      const user: User = { id: res.user.id, email: res.user.email, fullName: res.user.fullName, createdAt: new Date() };
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      this._authState.set({ user, isAuthenticated: true, isLoading: false });
      this.router.navigate(['/']);
    } catch (err) {
      this._authState.update(s => ({ ...s, isLoading: false }));
      throw err;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    this._authState.update(s => ({ ...s, isLoading: true }));
    try {
      await firstValueFrom(this.http.post<{ message: string; email: string }>(`${API_URL}/forgot-password`, { email }));
      this._authState.update(s => ({ ...s, isLoading: false }));
    } catch (err) {
      this._authState.update(s => ({ ...s, isLoading: false }));
      throw err;
    }
  }

  async resendSignupOtp(email: string): Promise<void> {
    this._authState.update(s => ({ ...s, isLoading: true }));
    try {
      await firstValueFrom(this.http.post<{ message: string }>(`${API_URL}/resend-otp`, { email }));
      this._authState.update(s => ({ ...s, isLoading: false }));
    } catch (err) {
      this._authState.update(s => ({ ...s, isLoading: false }));
      throw err;
    }
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    this._authState.update(s => ({ ...s, isLoading: true }));
    try {
      await firstValueFrom(this.http.post<{ message: string }>(`${API_URL}/reset-password`, { email, token, newPassword }));
      this._authState.update(s => ({ ...s, isLoading: false }));
      this.router.navigate(['/auth/login']);
    } catch (err) {
      this._authState.update(s => ({ ...s, isLoading: false }));
      throw err;
    }
  }

  async updateName(fullName: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.patch<{ message: string; fullName: string }>(`${API_URL}/update-name`, { fullName }),
    );
    const current = this._authState().user;
    if (current) {
      const updated: User = { ...current, fullName: res.fullName };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      this._authState.update(s => ({ ...s, user: updated }));
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await firstValueFrom(
      this.http.patch<{ message: string }>(`${API_URL}/update-password`, { currentPassword, newPassword }),
    );
  }

  async deleteAccount(): Promise<void> {
    await firstValueFrom(this.http.delete<{ message: string }>(`${API_URL}/delete-account`));
    this.logout();
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._authState.set({ user: null, isAuthenticated: false, isLoading: false });
    this.router.navigate(['/auth/login']);
  }
}
