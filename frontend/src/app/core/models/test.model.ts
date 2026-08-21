export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type TestType = 'placement' | 'specific';
export type QuestionType = 'multiple-choice' | 'open-text' | 'speaking';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  targetLevel?: CefrLevel;
  skill: 'grammar' | 'vocabulary' | 'reading' | 'writing' | 'speaking';
}

export interface TestSession {
  id: string;
  userId: string;
  testType: TestType;
  targetLevel?: CefrLevel;
  questions: Question[];
  answers: Record<string, string>;
  startedAt: Date;
  completedAt?: Date;
  status: 'in-progress' | 'completed';
}
