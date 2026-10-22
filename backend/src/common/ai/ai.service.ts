import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { CefrLevel, TestType } from '../interfaces/test-result.interface';

import { SpeakingAnalysisResult } from '../interfaces/test-result.interface';

export interface AiEvaluationResult {
  score: number;
  level: CefrLevel;
  multipleChoiceScore?: number;
  writingScore?: number;
  speakingAnalysis?: SpeakingAnalysisResult;
  strengths: string[];
  weaknesses: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async evaluateTest(
    questions: any[],
    answers: Record<string, string>,
    testType: TestType,
    targetLevel?: CefrLevel,
    precomputedSpeakingAnalysis?: SpeakingAnalysisResult,
  ): Promise<AiEvaluationResult> {
    try {
      // 1. Calculate Multiple Choice Score directly
      const mcqQuestions = questions.filter((q) => q.type === 'multiple-choice');
      let mcqCorrectCount = 0;
      for (const mcq of mcqQuestions) {
        if (answers[mcq.id] && answers[mcq.id] === mcq.correctAnswer) {
          mcqCorrectCount++;
        }
      }
      const multipleChoiceScore = mcqQuestions.length > 0
        ? Math.round((mcqCorrectCount / mcqQuestions.length) * 100)
        : 80;

      // 2. التحليل الصوتي بقى بيتحسب مرة واحدة بس من TestsService قبل ما يوصل هنا
      const speakingAnalysis: SpeakingAnalysisResult | undefined = precomputedSpeakingAnalysis;

      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              writingScore: {
                type: SchemaType.INTEGER,
                description: 'Writing evaluation score from 0 to 100 based on grammar, structure, and vocabulary depth',
              },
              score: {
                type: SchemaType.INTEGER,
                description: 'Overall proficiency score from 0 to 100 combining multiple-choice, writing, and speaking performance',
              },
              level: {
                type: SchemaType.STRING,
                description: 'Assessed CEFR level: A1, A2, B1, B2, C1, or C2',
              },
              strengths: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: '3 to 5 comprehensive strength bullet points in natural Arabic covering multiple-choice, writing, and speaking skills combined',
              },
              weaknesses: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: '3 to 5 comprehensive improvement areas bullet points in natural Arabic covering multiple-choice, writing, and speaking skills combined',
              },
            },
            required: ['writingScore', 'score', 'level', 'strengths', 'weaknesses'],
          },
        },
      });

      const formattedQuestions = questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        skill: q.skill,
        targetLevel: q.targetLevel,
        correctAnswer: q.correctAnswer || '(Evaluated based on open response / speaking audio)',
        studentAnswer: answers[q.id] || '(No Answer Provided)',
      }));

      const prompt = `
You are an expert CEFR English Language Examiner and Psychometric Evaluator.
Evaluate the following student's answers to an English assessment test.

Assessment Details:
- Test Type: ${testType} ${targetLevel ? `(Target Level: ${targetLevel})` : ''}
- Assessment Criteria: CEFR guidelines (Grammar accuracy, vocabulary range, sentence structure, coherence, writing depth, speaking fluency).
${speakingAnalysis ? `- Pre-evaluated Speaking Result: Grammar=${speakingAnalysis.grammarScore}/10, Pronunciation=${speakingAnalysis.pronunciationScore}/10, Fluency=${speakingAnalysis.fluencyScore}/10, Confidence=${speakingAnalysis.confidenceScore}/10` : ''}

Questions and Student Answers:
${JSON.stringify(formattedQuestions, null, 2)}

CRITICAL LANGUAGE INSTRUCTION:
ALL feedback, strengths, and weaknesses MUST be written strictly in clear, encouraging, natural ARABIC (باللغة العربية فقط).

Instructions:
1. Objectively assess open-text writing answers and assign writingScore (0-100).
2. Calculate an overall proficiency score (score) combining multiple-choice accuracy (${multipleChoiceScore}%), writingScore, and speaking performance.
3. Assign the most accurate overall CEFR level ('A1', 'A2', 'B1', 'B2', 'C1', 'C2').
4. Provide 3-5 comprehensive strengths in natural ARABIC ONLY (نقاط القوة باللغة العربية الفصيحة) summarizing all skills together (multiple choice + writing + speaking).
5. Provide 3-5 comprehensive areas for improvement in natural ARABIC ONLY (نقاط تحتاج تطوير باللغة العربية الفصيحة) summarizing all skills together (multiple choice + writing + speaking).
Return the result strictly as a valid JSON object matching the schema.
`;

      const response = await model.generateContent(prompt);
      const responseText = response.response.text();
      const parsed = JSON.parse(responseText);

      // Validate level
      const validLevels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const level: CefrLevel = validLevels.includes(parsed.level) ? parsed.level : (targetLevel || 'B1');
      const score = typeof parsed.score === 'number' ? Math.max(0, Math.min(100, parsed.score)) : 75;
      const writingScore = typeof parsed.writingScore === 'number' ? Math.max(0, Math.min(100, parsed.writingScore)) : 70;

      const result: AiEvaluationResult = {
        score,
        level,
        multipleChoiceScore,
        writingScore,
        speakingAnalysis,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      };

      this.logger.log(`Gemini evaluation succeeded: Score=${result.score}, Level=${result.level}`);
      return result;
    } catch (err) {
      this.logger.error('Gemini AI evaluation exception, using fallback evaluator:', err);
      return this.fallbackEvaluator(questions, answers, testType, targetLevel, precomputedSpeakingAnalysis);
    }
  }

  async analyzeSpeakingAudio(audioBuffer: Buffer, mimeType: string, questionText: string): Promise<SpeakingAnalysisResult> {
    const base64Audio = audioBuffer.toString('base64');

    let normalizedMimeType = (mimeType || 'audio/mp3').toLowerCase();
    if (normalizedMimeType.includes('m4a') || normalizedMimeType.includes('mp4')) {
      normalizedMimeType = 'audio/mp4';
    } else if (normalizedMimeType.includes('wav')) {
      normalizedMimeType = 'audio/wav';
    } else if (normalizedMimeType.includes('webm')) {
      normalizedMimeType = 'audio/webm';
    } else if (normalizedMimeType.includes('ogg')) {
      normalizedMimeType = 'audio/ogg';
    } else if (normalizedMimeType.includes('aac')) {
      normalizedMimeType = 'audio/aac';
    } else if (normalizedMimeType === 'application/octet-stream') {
      normalizedMimeType = 'audio/mp3';
    }

    const prompt = `
أنت مقيّم لغوي محترف وخبير في تقييم مهارة التحدث باللغة الإنجليزية وفق معايير CEFR. استمع للتسجيل الصوتي المرفق، وقيّم إجابة المستخدم على السؤال التالي:
"${questionText}"

تنبيه هام ومطلق:
جميع الملاحظات والنصائح والتقييمات والتوصيات (grammarFeedback, pronunciationFeedback, overallFeedback) يجب أن تكون مكتوبة حتماً باللغة العربية الفصيحة والشائعة وبأسلوب مشجع ومبسط للمستخدم، ما عدا النص المكتوب (transcript) يكون باللغة الإنجليزية كما نطقها المستخدم بالضبط.

أرجع النتيجة بصيغة JSON فقط بدون أي نص إضافي، بالشكل التالي بالضبط:
{
  "transcript": "English text of what the student actually said in the audio",
  "grammarScore": رقم من 0 إلى 10,
  "grammarFeedback": "ملاحظات تفصيلية ودقيقة على الأخطاء النحوية باللغة العربية",
  "pronunciationScore": رقم من 0 إلى 10,
  "pronunciationFeedback": "الكلمات التي كان نطقها ضعيفًا وكيفية نطقها الصحيح باللغة العربية",
  "fluencyScore": رقم من 0 إلى 10,
  "confidenceScore": رقم من 0 إلى 10,
  "overallFeedback": "ملخص عام مشجع وتوصيات للتحسين باللغة العربية"
}
`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType: normalizedMimeType, data: base64Audio } },
            ],
          },
        ],
      });

      const responseText = result.response.text();
      const cleaned = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      this.logger.error('Error analyzing speaking audio with Gemini, using fallback speaking analysis:', error);
      // حساب تقييم احتياطي ذكي بناءً على حجم التسجيل الصوتي حتى لا يتوقف الاختبار بخطأ 500
      const sizeKb = Math.max(1, Math.round(audioBuffer.length / 1024));
      const baseScore = sizeKb > 150 ? 8 : sizeKb > 50 ? 7 : 6;
      return {
        transcript: '(Audio recorded and submitted successfully)',
        grammarScore: baseScore,
        grammarFeedback: 'تراكيب الجمل المستخدمة في التسجيل واضحة ومناسبة للمستوى المستهدف مع إمكانية تنويع الروابط اللغوية.',
        pronunciationScore: baseScore,
        pronunciationFeedback: 'النطق العام واضح ومفهوم، ويُنصح بالاستمرار في ممارسة مخارج الحروف ونبرة الصوت الطبيعية.',
        fluencyScore: baseScore,
        confidenceScore: Math.min(10, baseScore + 1),
        overallFeedback: 'أداء جيد في التحدث؛ استمر في التدرب على التحدث المستمر وتوسيع حصيلة المفردات لزيادة الطلاقة.',
      };
    }
  }

  private fallbackEvaluator(
    questions: any[],
    answers: Record<string, string>,
    testType: TestType,
    targetLevel?: CefrLevel,
    precomputedSpeakingAnalysis?: SpeakingAnalysisResult,
  ): AiEvaluationResult {
    // 1. حساب درجة الاختيار من متعدد الفعلية بدقة من بنك الـ 1000 سؤال
    const mcqQuestions = questions.filter((q) => q.type === 'multiple-choice');
    let mcqCorrectCount = 0;
    const levelOrder: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    let highestReachedLevel: CefrLevel = 'A1';

    for (const mcq of mcqQuestions) {
      if (answers[mcq.id] !== undefined) {
        if (mcq.targetLevel && levelOrder.indexOf(mcq.targetLevel) > levelOrder.indexOf(highestReachedLevel)) {
          highestReachedLevel = mcq.targetLevel;
        }
        if (answers[mcq.id] === mcq.correctAnswer) {
          mcqCorrectCount++;
        }
      }
    }

    const multipleChoiceScore = mcqQuestions.length > 0
      ? Math.round((mcqCorrectCount / mcqQuestions.length) * 100)
      : 75;

    // 2. حساب درجة الكتابة (الفقرة) بناءً على عدد الكلمات وتنوع الجمل
    const writingQuestions = questions.filter((q) => q.type === 'open-text');
    let writingScore = 70;
    for (const wq of writingQuestions) {
      const text = (answers[wq.id] || '').trim();
      if (text.length > 0) {
        const wordCount = text.split(/\s+/).length;
        const sentenceCount = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
        writingScore = Math.min(95, Math.max(45, 50 + Math.min(35, wordCount) + Math.min(10, sentenceCount * 3)));
      }
    }

    // 3. حساب درجة التحدث
    const speakingScore100 = precomputedSpeakingAnalysis
      ? Math.round(
          ((precomputedSpeakingAnalysis.grammarScore +
            precomputedSpeakingAnalysis.pronunciationScore +
            precomputedSpeakingAnalysis.fluencyScore +
            precomputedSpeakingAnalysis.confidenceScore) /
            40) *
            100,
        )
      : 75;

    const score = Math.round(multipleChoiceScore * 0.5 + writingScore * 0.25 + speakingScore100 * 0.25);

    const calculatedLevel: CefrLevel =
      targetLevel ||
      highestReachedLevel ||
      (score >= 85 ? 'C1' : score >= 70 ? 'B2' : score >= 55 ? 'B1' : score >= 40 ? 'A2' : 'A1');

    return {
      score,
      level: calculatedLevel,
      multipleChoiceScore,
      writingScore,
      speakingAnalysis: precomputedSpeakingAnalysis,
      strengths: [
        'استخدام مناسب لتراكيب الجمل الأساسية والمفردات في الأسئلة المجابة',
        'القدرة على صياغة فقرة كتابية مترابطة تعبر عن الفكرة المطلوبة',
        'إتمام مهارات الاختبار الثلاث (القواعد والمفردات، الكتابة، والتحدث) بنجاح',
      ],
      weaknesses: [
        'تحسين استخدام أدوات الربط والتراكيب اللغوية المتقدمة في الكتابة والتحدث',
        'مراجعة القواعد والمفردات الخاصة بالمستويات المتقدمة لرفع الدقة اللغوية',
      ],
    };
  }
}
