import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Question, TestSession, CefrLevel, TestType } from '../models/test.model';
import { TestResult } from '../models/result.model';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/tests`;
const SESSION_STORAGE_KEY = 'taqyeemy_active_session';
const PROGRESS_STORAGE_KEY = 'taqyeemy_test_progress';
const MCQ_RESULTS_STORAGE_KEY = 'taqyeemy_mcq_results';

export interface SavedTestProgress {
  phase: 'mcq' | 'writing' | 'speaking';
  mcqIndex: number;
  stoppedLevel: string;
}

@Injectable({ providedIn: 'root' })
export class TestService {
  private http = inject(HttpClient);

  private _session = signal<TestSession | null>(this.loadSessionFromStorage());
  readonly currentSession = this._session.asReadonly();

  private loadSessionFromStorage(): TestSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as TestSession;
      if (parsed && parsed.status === 'in-progress' && Array.isArray(parsed.questions)) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  private saveSessionToStorage(session: TestSession | null): void {
    try {
      if (!session || session.status !== 'in-progress') {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(PROGRESS_STORAGE_KEY);
        sessionStorage.removeItem(MCQ_RESULTS_STORAGE_KEY);
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      }
    } catch {
      // ignore storage quota errors
    }
  }

  saveProgress(progress: SavedTestProgress): void {
    try {
      sessionStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }

  loadProgress(): SavedTestProgress | null {
    try {
      const raw = sessionStorage.getItem(PROGRESS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedTestProgress) : null;
    } catch {
      return null;
    }
  }

  async startSession(testType: TestType, targetLevel?: CefrLevel): Promise<TestSession> {
    const params: Record<string, string> = { type: testType };
    if (targetLevel) params['level'] = targetLevel;

    const questions = await firstValueFrom(
      this.http.get<Question[]>(`${API_URL}/questions`, { params }),
    );

    const session: TestSession = {
      id: `session-${Date.now()}`,
      userId: 'current-user',
      testType,
      targetLevel,
      questions,
      answers: {},
      startedAt: new Date(),
      status: 'in-progress',
    };

    sessionStorage.removeItem(PROGRESS_STORAGE_KEY);
    sessionStorage.removeItem(MCQ_RESULTS_STORAGE_KEY);
    this._session.set(session);
    this.saveSessionToStorage(session);
    return session;
  }

  submitAnswer(questionId: string, answer: string): void {
    this._session.update((s) => {
      if (!s) return s;
      const updated: TestSession = { ...s, answers: { ...s.answers, [questionId]: answer } };
      this.saveSessionToStorage(updated);
      return updated;
    });
  }

  // نتائج تصحيح أسئلة الاختيار (true = إجابة خاطئة) محفوظة محلياً لحساب الـ 3 أخطاء حتى بعد عمل Refresh
  loadMcqWrongFlags(): Record<string, boolean> {
    try {
      const raw = sessionStorage.getItem(MCQ_RESULTS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  }

  saveMcqWrongFlags(flags: Record<string, boolean>): void {
    try {
      sessionStorage.setItem(MCQ_RESULTS_STORAGE_KEY, JSON.stringify(flags));
    } catch {
      // ignore
    }
  }

  // السيرفر هو اللي بيحدد صح/غلط، المتصفح مش بيعرف الإجابة الصحيحة أبداً
  async checkAnswer(questionId: string, answer: string): Promise<boolean> {
    const res = await firstValueFrom(
      this.http.post<{ correct: boolean }>(`${API_URL}/check-answer`, { questionId, answer }),
    );
    return !!res?.correct;
  }

  async submitAndEvaluate(): Promise<TestResult> {
    const s = this._session();
    if (!s) throw new Error('No active test session');

    const payload = {
      testType: s.testType,
      targetLevel: s.targetLevel,
      answers: s.answers,
    };

    const result = await firstValueFrom(
      this.http.post<TestResult>(`${API_URL}/submit`, payload),
    );

    this._session.update((curr) => (curr ? { ...curr, status: 'completed', completedAt: new Date() } : curr));
    this.saveSessionToStorage(null);
    return result;
  }

  clearSession(): void {
    this._session.set(null);
    this.saveSessionToStorage(null);
  }
}
