import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User, AuthState } from '../models/user.model';

const API_URL = 'http://127.0.0.1:3000/auth';
const TOKEN_KEY = 'taqyeemy_token';
const USER_KEY = 'taqyeemy_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _authState = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  readonly authState = this._authState.asReadonly();
  readonly currentUser = computed(() => this._authState().user);
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userRaw = localStorage.getItem(USER_KEY);

      if (token && userRaw) {
        const user: User = JSON.parse(userRaw);
        this._authState.set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch {
      this.logout();
    }
  }

  async login(email: string, password: string): Promise<void> {
    this._authState.update((s) => ({ ...s, isLoading: true }));
    try {
      const res = await firstValueFrom(
        this.http.post<{ message: string; token: string; user: any }>(`${API_URL}/login`, {
          email,
          password,
        }),
      );

      const user: User = {
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.fullName,
        createdAt: new Date(),
      };

      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      this._authState.set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      this.router.navigate(['/']);
    } catch (err) {
      this._authState.update((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  }

  async register(email: string, password: string, fullName: string): Promise<void> {
    this._authState.update((s) => ({ ...s, isLoading: true }));
    try {
      const res = await firstValueFrom(
        this.http.post<{ message: string; token: string | null; user: any }>(`${API_URL}/register`, {
          fullName,
          email,
          password,
        }),
      );

      if (res.token) {
        const user: User = {
          id: res.user.id,
          email: res.user.email,
          fullName: res.user.fullName,
          createdAt: new Date(),
        };

        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        this._authState.set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        this.router.navigate(['/']);
      } else {
        this.router.navigate(['/auth/login']);
      }
    } catch (err) {
      this._authState.update((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._authState.set({ user: null, isAuthenticated: false, isLoading: false });
    this.router.navigate(['/auth/login']);
  }
}
