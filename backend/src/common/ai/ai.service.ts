import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { CefrLevel, TestType } from '../interfaces/test-result.interface';

export interface AiEvaluationResult {
  score: number;
  level: CefrLevel;
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
  ): Promise<AiEvaluationResult> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              score: {
                type: SchemaType.INTEGER,
                description: 'Overall proficiency score from 0 to 100 based on CEFR benchmarks',
              },
              level: {
                type: SchemaType.STRING,
                description: 'Assessed CEFR level: A1, A2, B1, B2, C1, or C2',
              },
              strengths: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: '2 to 4 specific strength bullet points in natural Arabic highlighting what the student did well',
              },
              weaknesses: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: '2 to 4 specific areas for improvement bullet points in natural Arabic with clear grammatical or lexical focus',
              },
            },
            required: ['score', 'level', 'strengths', 'weaknesses'],
          },
        },
      });

      const formattedQuestions = questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        skill: q.skill,
        targetLevel: q.targetLevel,
        correctAnswer: q.correctAnswer || '(Evaluated based on open response)',
        studentAnswer: answers[q.id] || '(No Answer Provided)',
      }));

      const prompt = `
You are an expert CEFR English Language Examiner and Psychometric Evaluator.
Evaluate the following student's answers to an English assessment test.

Assessment Details:
- Test Type: ${testType} ${targetLevel ? `(Target Level: ${targetLevel})` : ''}
- Assessment Criteria: CEFR guidelines (Grammar accuracy, vocabulary range, sentence structure, coherence, writing depth).

Questions and Student Answers:
${JSON.stringify(formattedQuestions, null, 2)}

Instructions:
1. Objectively assess multiple-choice answers for grammatical/lexical accuracy against correctAnswer.
2. In-depth assess open-text writing answers for sentence structure, spelling, vocabulary richness, and coherence.
3. Calculate an overall proficiency score between 0 and 100.
4. Assign the most accurate CEFR level ('A1', 'A2', 'B1', 'B2', 'C1', 'C2').
5. Provide 2-4 specific, actionable strengths in natural Arabic (نقاط القوة).
6. Provide 2-4 specific, actionable areas for improvement in natural Arabic (نقاط تحتاج تطوير).
Return the result strictly as a valid JSON object matching the schema.
`;

      const response = await model.generateContent(prompt);
      const responseText = response.response.text();
      const parsed = JSON.parse(responseText);

      // Validate level
      const validLevels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const level: CefrLevel = validLevels.includes(parsed.level) ? parsed.level : (targetLevel || 'B1');
      const score = typeof parsed.score === 'number' ? Math.max(0, Math.min(100, parsed.score)) : 70;

      const result: AiEvaluationResult = {
        score,
        level,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      };

      this.logger.log(`Gemini evaluation succeeded: Score=${result.score}, Level=${result.level}`);
      return result;
    } catch (err) {
      this.logger.error('Gemini AI evaluation exception, using fallback evaluator:', err);
      return this.fallbackEvaluator(questions, answers, testType, targetLevel);
    }
  }

  async analyzeSpeakingAudio(audioBuffer: Buffer, mimeType: string, questionText: string) {
    const base64Audio = audioBuffer.toString('base64');

    const prompt = `
أنت مقيّم لغوي محترف. استمع للتسجيل الصوتي المرفق، وقيّم إجابة المستخدم على السؤال التالي:
"${questionText}"

أرجع النتيجة بصيغة JSON فقط بدون أي نص إضافي، بالشكل التالي بالضبط:
{
  "transcript": "النص المكتوب لما قاله المستخدم",
  "grammarScore": رقم من 0 إلى 10,
  "grammarFeedback": "ملاحظات على الأخطاء النحوية",
  "pronunciationScore": رقم من 0 إلى 10,
  "pronunciationFeedback": "الكلمات التي كان نطقها ضعيفًا وكيف يحسنها",
  "fluencyScore": رقم من 0 إلى 10,
  "confidenceScore": رقم من 0 إلى 10,
  "overallFeedback": "ملخص عام وتوصيات للتحسين"
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
              { inlineData: { mimeType: mimeType || 'audio/mp3', data: base64Audio } },
            ],
          },
        ],
      });

      const responseText = result.response.text();
      const cleaned = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      this.logger.error('Error analyzing speaking audio:', error);
      throw new Error(
        'حدث خطأ أثناء تحليل التسجيل الصوتي، حاول مرة أخرى',
      );
    }
  }

  private fallbackEvaluator(
    questions: any[],
    answers: Record<string, string>,
    testType: TestType,
    targetLevel?: CefrLevel,
  ): AiEvaluationResult {
    let score = 70;
    const answeredCount = Object.keys(answers).length;
    if (answeredCount > 0) {
      score = Math.min(100, Math.max(30, Math.round((answeredCount / questions.length) * 85)));
    }

    const calculatedLevel: CefrLevel =
      targetLevel ||
      (score >= 85 ? 'C1' : score >= 70 ? 'B2' : score >= 55 ? 'B1' : score >= 40 ? 'A2' : 'A1');

    return {
      score,
      level: calculatedLevel,
      strengths: [
        'استخدام مناسب لتراكيب الجمل الأساسية',
        'مفردات جيدة وملائمة لسياق الأسئلة',
        'إكمال أغلب أقسام الاختبار بنجاح',
      ],
      weaknesses: [
        'تحسين استخدام أدوات الربط في الجمل المعقدة',
        'التدرب على تصريف الأفعال الشاذة والمصطلحات المتقدمة',
      ],
    };
  }
}
