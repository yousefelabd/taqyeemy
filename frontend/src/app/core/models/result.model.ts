import { CefrLevel, TestType } from './test.model';

export interface TestResult {
  id: string;
  userId: string;
  level: CefrLevel;
  score: number;
  strengths: string[];
  weaknesses: string[];
  testType: TestType;
  targetLevel?: CefrLevel;
  completedAt: Date | string;
}

export interface ResultSummary {
  id: string;
  level: CefrLevel;
  score: number;
  testType: TestType;
  completedAt: Date | string;
}
