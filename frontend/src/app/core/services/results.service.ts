import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TestResult, ResultSummary } from '../models/result.model';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/results`;

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private http = inject(HttpClient);

  private _latestResult = signal<TestResult | null>(null);
  readonly latestResult = this._latestResult.asReadonly();

  setLatestResult(result: TestResult): void {
    this._latestResult.set(result);
  }

  async getHistory(): Promise<ResultSummary[]> {
    const data = await firstValueFrom(
      this.http.get<TestResult[]>(`${API_URL}/history`),
    );
    return (data || []).map((r) => ({
      id: r.id,
      level: r.level,
      score: r.score,
      testType: r.testType,
      completedAt: new Date(r.completedAt),
    }));
  }

  async getResultById(id: string): Promise<TestResult | null> {
    try {
      const result = await firstValueFrom(
        this.http.get<TestResult>(`${API_URL}/${id}`),
      );
      return {
        ...result,
        completedAt: new Date(result.completedAt),
      };
    } catch {
      return null;
    }
  }
}