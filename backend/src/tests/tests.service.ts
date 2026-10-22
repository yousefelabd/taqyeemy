import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { parseBuffer } from 'music-metadata';
import { SubmitTestDto } from './dto/submit-test.dto';
import { ResultsService } from '../results/results.service';
import { AiService } from '../common/ai/ai.service';
import { TestResultResponse, CefrLevel, TestType } from '../common/interfaces/test-result.interface';

import {
  QUESTION_BANK,
  MCQ_1000_BANK,
  WRITING_QUESTION_BANK,
  SPEAKING_QUESTION_BANK,
  QuestionBankItem,
} from './question-bank.data';

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION SELECTION LOGIC
// ─────────────────────────────────────────────────────────────────────────────
function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function selectPlacementQuestions(): QuestionBankItem[] {
  const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const mcqs: QuestionBankItem[] = [];
  for (const lvl of levels) {
    const levelPool = MCQ_1000_BANK.filter((q) => q.targetLevel === lvl);
    const randomTen = shuffleArray(levelPool).slice(0, 10);
    mcqs.push(...randomTen);
  }
  // نرفق أسئلة الكتابة لكل المستويات ليختار الفرونت إند سؤال الكتابة المطابق للمستوى الذي توقف عنده الطالب
  return [...mcqs, ...WRITING_QUESTION_BANK];
}

function selectLevelQuestions(level: CefrLevel): QuestionBankItem[] {
  const levelPool = MCQ_1000_BANK.filter((q) => q.targetLevel === level);
  const randomTen = shuffleArray(levelPool).slice(0, 10);
  const writing = WRITING_QUESTION_BANK.filter((q) => q.targetLevel === level).slice(0, 1);
  return [...randomTen, ...writing];
}

function selectSpeakingQuestion(targetLevel?: CefrLevel, userHistoryCount: number = 0): QuestionBankItem {
  let candidatePool = SPEAKING_QUESTION_BANK;
  if (targetLevel) {
    const levelMatches = SPEAKING_QUESTION_BANK.filter((q) => q.targetLevel === targetLevel);
    if (levelMatches.length > 0) {
      candidatePool = levelMatches;
    }
  }
  const index = userHistoryCount % candidatePool.length;
  return candidatePool[index];
}

@Injectable()
export class TestsService {
  constructor(
    private readonly resultsService: ResultsService,
    private readonly aiService: AiService,
  ) {}

  async getQuestions(testType: string, level?: CefrLevel, userId: string = 'user', token?: string) {
    let historyCount = 0;
    if (token) {
      try {
        const history = await this.resultsService.getHistory(userId, token);
        historyCount = history.length;
      } catch {
        historyCount = 0;
      }
    }

    const questions = testType === 'specific' && level
      ? selectLevelQuestions(level)
      : selectPlacementQuestions();

    const speakingQuestions = testType === 'specific' && level
      ? [selectSpeakingQuestion(level, historyCount)]
      : SPEAKING_QUESTION_BANK;

    const finalQuestions = [...questions, ...speakingQuestions];

    // إخفاء الإجابة الصحيحة الصريحة وإرسال مفتاح مشفر بسيط (checkKey) لحساب الـ 3 أخطاء في الفرونت إند لحظياً بدون إظهار الإجابة
    return finalQuestions.map(({ correctAnswer, ...rest }: any) => ({
      ...rest,
      ...(correctAnswer
        ? { checkKey: Buffer.from(`${rest.id}:${correctAnswer}`).toString('base64') }
        : {}),
    }));
  }

  // التحليل الصوتي بقى بيحصل هنا بس، مرة واحدة، وقت إنهاء الاختبار
  async submitAndEvaluate(userId: string, token: string, dto: SubmitTestDto): Promise<TestResultResponse> {
    const targetLevel = dto.targetLevel as CefrLevel | undefined;
    const testType = dto.testType as TestType;

    let historyCount = 0;
    if (token) {
      try {
        const history = await this.resultsService.getHistory(userId, token);
        historyCount = history.length;
      } catch {
        historyCount = 0;
      }
    }

    // استرجاع الأسئلة الفعلية التي أجاب عليها الطالب من بنك الـ 1000 سؤال عبر الـ ID
    const answeredKeys = Object.keys(dto.answers || {});
    const matchedQuestions = QUESTION_BANK.filter((q) => answeredKeys.includes(q.id));

    const questions = matchedQuestions.length > 0
      ? matchedQuestions
      : (testType === 'specific' && targetLevel
          ? selectLevelQuestions(targetLevel)
          : selectPlacementQuestions());

    // نجيب السؤال الصوتي من إجابات الفرونت إند نفسها لو موجود، بدل ما نعيد اختياره عشوائي تاني وممكن يختلف
    const speakingAnswer = answeredKeys.find((key) =>
      SPEAKING_QUESTION_BANK.some((q) => q.id === key),
    );

    const speakingQ = SPEAKING_QUESTION_BANK.find((q) => q.id === speakingAnswer)
      ?? selectSpeakingQuestion(targetLevel, historyCount);
    const finalQuestions = [...questions, speakingQ];

    // البحث عن نتيجة التحليل الصوتي في إجابات الأسئلة
    let speakingAnalysis: any = undefined;
    for (const [_, ans] of Object.entries(dto.answers || {})) {
      if (typeof ans === 'string' && (ans.startsWith('{') || ans.includes('transcript') || ans.includes('grammarScore') || ans.includes('audioBase64'))) {
        try {
          const parsed = JSON.parse(ans);
          if (parsed && (parsed.grammarScore !== undefined || parsed.transcript !== undefined)) {
            speakingAnalysis = parsed;
            break;
          } else if (parsed && parsed.audioBase64) {
            const audioBuffer = Buffer.from(parsed.audioBase64, 'base64');
            speakingAnalysis = await this.aiService.analyzeSpeakingAudio(
              audioBuffer,
              parsed.mimeType || 'audio/m4a',
              speakingQ.text,
            );
            break;
          }
        } catch {
          // ignore JSON parse error
        }
      }
    }

    // Call Gemini AI to evaluate student answers (with precomputed speaking analysis)
    const aiEvaluation = await this.aiService.evaluateTest(
      finalQuestions,
      dto.answers || {},
      testType,
      targetLevel,
      speakingAnalysis,
    );

    const evaluatedResult: TestResultResponse = {
      id: `result-${Date.now()}`,
      userId,
      level: aiEvaluation.level,
      score: aiEvaluation.score,
      multipleChoiceScore: aiEvaluation.multipleChoiceScore,
      writingScore: aiEvaluation.writingScore,
      speakingAnalysis: aiEvaluation.speakingAnalysis,
      strengths: aiEvaluation.strengths,
      weaknesses: aiEvaluation.weaknesses,
      testType,
      targetLevel,
      completedAt: new Date().toISOString(),
    };

    return this.resultsService.saveResult(evaluatedResult, token);
  }

  async analyzeSpeakingAnswer(file: Express.Multer.File, questionText: string, clientTranscript?: string) {
    if (!file || !file.buffer) {
      throw new BadRequestException('الملف الصوتي غير صالح');
    }
    return this.aiService.analyzeSpeakingAudio(
      file.buffer,
      file.mimetype || 'audio/wav',
      questionText,
      clientTranscript,
    );
  }
}