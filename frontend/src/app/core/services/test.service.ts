import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Question, TestSession, CefrLevel, TestType } from '../models/test.model';
import { TestResult } from '../models/result.model';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/tests`;

@Injectable({ providedIn: 'root' })
export class TestService {
  private http = inject(HttpClient);

  private _session = signal<TestSession | null>(null);
  readonly currentSession = this._session.asReadonly();

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

    this._session.set(session);
    return session;
  }

  submitAnswer(questionId: string, answer: string): void {
    this._session.update((s) => (s ? { ...s, answers: { ...s.answers, [questionId]: answer } } : s));
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
    return result;
  }

  clearSession(): void {
    this._session.set(null);
  }
}
