export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type TestType = 'placement' | 'specific';

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

export interface TestResultResponse {
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
  completedAt: string;
}
