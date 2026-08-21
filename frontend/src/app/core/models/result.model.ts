import { CefrLevel, TestType } from './test.model';

export interface SpeakingAnalysisResult {
  transcript: string;
  grammarScore: number;
  grammarFeedback: string;
  pronunciationScore: number;
  pronunciationFeedback: string;
  fluencyScore: number;
  confidenceScore: number;
  overallFeedback: string;
}

export interface TestResult {
  id: string;
  userId: string;
  level: CefrLevel;
  score: number;
  multipleChoiceScore?: number;
  writingScore?: number;
  speakingAnalysis?: SpeakingAnalysisResult;
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
