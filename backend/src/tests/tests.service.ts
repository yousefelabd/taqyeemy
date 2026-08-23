import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { parseBuffer } from 'music-metadata';
import { SubmitTestDto } from './dto/submit-test.dto';
import { ResultsService } from '../results/results.service';
import { AiService } from '../common/ai/ai.service';
import { TestResultResponse, CefrLevel, TestType } from '../common/interfaces/test-result.interface';

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION BANK — organised by targetLevel
// Each level has: grammar, vocabulary, and open-text (writing) questions
// ─────────────────────────────────────────────────────────────────────────────
const QUESTION_BANK = [

  // ── A1 (Beginner) ──────────────────────────────────────────────────────────
  { id: 'a1_g1', text: 'Choose the correct form: She ___ to school every day.', type: 'multiple-choice', skill: 'grammar', targetLevel: 'A1', correctAnswer: 'b', options: [{ id: 'a', text: 'go' }, { id: 'b', text: 'goes' }, { id: 'c', text: 'going' }, { id: 'd', text: 'gone' }] },
  { id: 'a1_g2', text: 'What is the correct question? "___ is your name?"', type: 'multiple-choice', skill: 'grammar', targetLevel: 'A1', correctAnswer: 'c', options: [{ id: 'a', text: 'Who' }, { id: 'b', text: 'Where' }, { id: 'c', text: 'What' }, { id: 'd', text: 'Why' }] },
  { id: 'a1_g3', text: 'Complete: There ___ two cats in the garden.', type: 'multiple-choice', skill: 'grammar', targetLevel: 'A1', correctAnswer: 'b', options: [{ id: 'a', text: 'is' }, { id: 'b', text: 'are' }, { id: 'c', text: 'am' }, { id: 'd', text: 'be' }] },
  { id: 'a1_v1', text: 'What does "big" mean?', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'A1', correctAnswer: 'a', options: [{ id: 'a', text: 'large' }, { id: 'b', text: 'small' }, { id: 'c', text: 'fast' }, { id: 'd', text: 'cold' }] },
  { id: 'a1_v2', text: 'Which word is a colour?', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'A1', correctAnswer: 'd', options: [{ id: 'a', text: 'run' }, { id: 'b', text: 'chair' }, { id: 'c', text: 'happy' }, { id: 'd', text: 'blue' }] },
  { id: 'a1_v3', text: 'Choose the animal: ___', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'A1', correctAnswer: 'b', options: [{ id: 'a', text: 'table' }, { id: 'b', text: 'dog' }, { id: 'c', text: 'red' }, { id: 'd', text: 'walk' }] },
  { id: 'a1_w1', text: 'Write 2 sentences about your family. (Example: "I have a mother and a father.")', type: 'open-text', skill: 'writing', targetLevel: 'A1' },

  // ── A2 (Elementary) ────────────────────────────────────────────────────────
  { id: 'a2_g1', text: 'My brother is ___ engineer. He works at ___ large company.', type: 'multiple-choice', skill: 'grammar', targetLevel: 'A2', correctAnswer: 'b', options: [{ id: 'a', text: 'a / a' }, { id: 'b', text: 'an / a' }, { id: 'c', text: 'the / a' }, { id: 'd', text: 'a / the' }] },
  { id: 'a2_g2', text: 'Choose the correct past tense: Yesterday, I ___ to the market.', type: 'multiple-choice', skill: 'grammar', targetLevel: 'A2', correctAnswer: 'c', options: [{ id: 'a', text: 'go' }, { id: 'b', text: 'going' }, { id: 'c', text: 'went' }, { id: 'd', text: 'gone' }] },
  { id: 'a2_g3', text: 'She ___ watching TV when I called her.', type: 'multiple-choice', skill: 'grammar', targetLevel: 'A2', correctAnswer: 'a', options: [{ id: 'a', text: 'was' }, { id: 'b', text: 'is' }, { id: 'c', text: 'were' }, { id: 'd', text: 'be' }] },
  { id: 'a2_v1', text: 'What is the synonym of "happy"?', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'A2', correctAnswer: 'b', options: [{ id: 'a', text: 'sad' }, { id: 'b', text: 'joyful' }, { id: 'c', text: 'angry' }, { id: 'd', text: 'tired' }] },
  { id: 'a2_v2', text: 'Choose the opposite of "expensive":', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'A2', correctAnswer: 'c', options: [{ id: 'a', text: 'beautiful' }, { id: 'b', text: 'ugly' }, { id: 'c', text: 'cheap' }, { id: 'd', text: 'heavy' }] },
  { id: 'a2_v3', text: 'What does "frequently" mean?', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'A2', correctAnswer: 'a', options: [{ id: 'a', text: 'often' }, { id: 'b', text: 'never' }, { id: 'c', text: 'slowly' }, { id: 'd', text: 'quietly' }] },
  { id: 'a2_w1', text: 'Write 3 sentences about what you did last weekend.', type: 'open-text', skill: 'writing', targetLevel: 'A2' },

  // ── B1 (Intermediate) ──────────────────────────────────────────────────────
  { id: 'b1_g1', text: 'Complete: If I ___ you, I would study harder.', type: 'multiple-choice', skill: 'grammar', targetLevel: 'B1', correctAnswer: 'c', options: [{ id: 'a', text: 'am' }, { id: 'b', text: 'was' }, { id: 'c', text: 'were' }, { id: 'd', text: 'be' }] },
  { id: 'b1_g2', text: 'She has been working here ___ five years.', type: 'multiple-choice', skill: 'grammar', targetLevel: 'B1', correctAnswer: 'b', options: [{ id: 'a', text: 'since' }, { id: 'b', text: 'for' }, { id: 'c', text: 'during' }, { id: 'd', text: 'while' }] },
  { id: 'b1_g3', text: 'Choose the correct form: By the time she arrived, the film ___.', type: 'multiple-choice', skill: 'grammar', targetLevel: 'B1', correctAnswer: 'd', options: [{ id: 'a', text: 'started' }, { id: 'b', text: 'has started' }, { id: 'c', text: 'starts' }, { id: 'd', text: 'had started' }] },
  { id: 'b1_v1', text: 'What does "determined" mean?', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'B1', correctAnswer: 'a', options: [{ id: 'a', text: 'having a strong will to succeed' }, { id: 'b', text: 'feeling very tired' }, { id: 'c', text: 'being very confused' }, { id: 'd', text: 'acting very quickly' }] },
  { id: 'b1_v2', text: 'Choose the word that best completes: The scientist made an important ___ about the new virus.', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'B1', correctAnswer: 'b', options: [{ id: 'a', text: 'game' }, { id: 'b', text: 'discovery' }, { id: 'c', text: 'furniture' }, { id: 'd', text: 'weather' }] },
  { id: 'b1_v3', text: 'What does "consequence" mean?', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'B1', correctAnswer: 'c', options: [{ id: 'a', text: 'a question' }, { id: 'b', text: 'a plan' }, { id: 'c', text: 'a result or effect' }, { id: 'd', text: 'a type of sport' }] },
  { id: 'b1_w1', text: 'Write a short paragraph (3-5 sentences) describing your ideal job and why you would enjoy it.', type: 'open-text', skill: 'writing', targetLevel: 'B1' },

  // ── B2 (Upper-Intermediate) ────────────────────────────────────────────────
  { id: 'b2_g1', text: 'Choose the sentence with the correct use of the article:', type: 'multiple-choice', skill: 'grammar', targetLevel: 'B2', correctAnswer: 'b', options: [{ id: 'a', text: 'I saw a elephant.' }, { id: 'b', text: 'I saw an elephant.' }, { id: 'c', text: 'I saw the elephant a big one.' }, { id: 'd', text: 'I saw elephant.' }] },
  { id: 'b2_g2', text: 'Choose the correct passive form: The report ___ by the manager yesterday.', type: 'multiple-choice', skill: 'grammar', targetLevel: 'B2', correctAnswer: 'a', options: [{ id: 'a', text: 'was written' }, { id: 'b', text: 'is written' }, { id: 'c', text: 'wrote' }, { id: 'd', text: 'has written' }] },
  { id: 'b2_g3', text: 'She wishes she ___ more time to travel when she was young.', type: 'multiple-choice', skill: 'grammar', targetLevel: 'B2', correctAnswer: 'c', options: [{ id: 'a', text: 'has' }, { id: 'b', text: 'would have' }, { id: 'c', text: 'had had' }, { id: 'd', text: 'having' }] },
  { id: 'b2_v1', text: 'Choose the correct meaning of "ambiguous":', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'B2', correctAnswer: 'b', options: [{ id: 'a', text: 'extremely powerful' }, { id: 'b', text: 'open to more than one interpretation' }, { id: 'c', text: 'deeply emotional' }, { id: 'd', text: 'very complicated' }] },
  { id: 'b2_v2', text: 'What does "phenomenon" mean?', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'B2', correctAnswer: 'a', options: [{ id: 'a', text: 'an observable fact or event' }, { id: 'b', text: 'a type of scientific experiment' }, { id: 'c', text: 'a philosophical theory' }, { id: 'd', text: 'a historical period' }] },
  { id: 'b2_v3', text: 'Complete: Despite the team\'s best efforts, the project proved to be ___:', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'B2', correctAnswer: 'd', options: [{ id: 'a', text: 'successful' }, { id: 'b', text: 'encouraging' }, { id: 'c', text: 'achievable' }, { id: 'd', text: 'futile' }] },
  { id: 'b2_w1', text: 'Explain in a short paragraph (4-5 sentences) the advantages and disadvantages of social media on society.', type: 'open-text', skill: 'writing', targetLevel: 'B2' },

  // ── C1 (Advanced) ──────────────────────────────────────────────────────────
  { id: 'c1_g1', text: 'The word "ephemeral" means:', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'C1', correctAnswer: 'b', options: [{ id: 'a', text: 'long-lasting' }, { id: 'b', text: 'short-lived' }, { id: 'c', text: 'very old' }, { id: 'd', text: 'extremely large' }] },
  { id: 'c1_g2', text: 'Which word best completes: The politician gave a ___ speech that moved the audience to tears.', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'C1', correctAnswer: 'b', options: [{ id: 'a', text: 'boring' }, { id: 'b', text: 'poignant' }, { id: 'c', text: 'quiet' }, { id: 'd', text: 'short' }] },
  { id: 'c1_g3', text: 'Choose the correct complex structure: ___ he studied hard, he failed the examination.', type: 'multiple-choice', skill: 'grammar', targetLevel: 'C1', correctAnswer: 'c', options: [{ id: 'a', text: 'Because' }, { id: 'b', text: 'So that' }, { id: 'c', text: 'Even though' }, { id: 'd', text: 'As long as' }] },
  { id: 'c1_v1', text: 'What does "taciturn" mean?', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'C1', correctAnswer: 'a', options: [{ id: 'a', text: 'habitually silent or reserved' }, { id: 'b', text: 'extremely talkative' }, { id: 'c', text: 'overly aggressive' }, { id: 'd', text: 'deeply religious' }] },
  { id: 'c1_v2', text: 'Which phrase correctly uses the word "ubiquitous"?', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'C1', correctAnswer: 'd', options: [{ id: 'a', text: 'The ubiquitous bird sat alone.' }, { id: 'b', text: 'She felt ubiquitous after the surgery.' }, { id: 'c', text: 'The ubiquitous problem was easily solved.' }, { id: 'd', text: 'Smartphones have become ubiquitous in modern life.' }] },
  { id: 'c1_w1', text: 'Explain in 2-3 sentences the difference between "affect" and "effect", providing one example for each.', type: 'open-text', skill: 'writing', targetLevel: 'C1' },

  // ── C2 (Proficient) ────────────────────────────────────────────────────────
  { id: 'c2_g1', text: 'Which sentence uses the subjunctive mood correctly?', type: 'multiple-choice', skill: 'grammar', targetLevel: 'C2', correctAnswer: 'c', options: [{ id: 'a', text: 'It is important that he attends the meeting.' }, { id: 'b', text: 'The manager insisted that she will leave early.' }, { id: 'c', text: 'The committee recommended that the law be revised immediately.' }, { id: 'd', text: 'They suggested that he should arrives on time.' }] },
  { id: 'c2_g2', text: 'What does the phrase "notwithstanding the foregoing" mean in legal English?', type: 'multiple-choice', skill: 'grammar', targetLevel: 'C2', correctAnswer: 'b', options: [{ id: 'a', text: 'Referring to the next section' }, { id: 'b', text: 'Despite what was previously stated' }, { id: 'c', text: 'In addition to the above' }, { id: 'd', text: 'As a direct result of the above' }] },
  { id: 'c2_g3', text: 'Choose the sentence that demonstrates the most sophisticated and accurate use of an inversion structure:', type: 'multiple-choice', skill: 'grammar', targetLevel: 'C2', correctAnswer: 'a', options: [{ id: 'a', text: 'Seldom have I encountered such a compelling argument.' }, { id: 'b', text: 'Never I have seen such beauty before.' }, { id: 'c', text: 'Not only she spoke eloquently, but also wrote brilliantly.' }, { id: 'd', text: 'Hardly he had arrived when the meeting started.' }] },
  { id: 'c2_v1', text: 'What does "solipsistic" mean?', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'C2', correctAnswer: 'c', options: [{ id: 'a', text: 'extremely generous and selfless' }, { id: 'b', text: 'deeply philosophical in nature' }, { id: 'c', text: 'preoccupied with only one\'s own existence and perspectives' }, { id: 'd', text: 'relating to ancient Greek philosophy' }] },
  { id: 'c2_v2', text: 'Which sentence correctly uses the word "sanguine"?', type: 'multiple-choice', skill: 'vocabulary', targetLevel: 'C2', correctAnswer: 'b', options: [{ id: 'a', text: 'The room was sanguine after the renovation.' }, { id: 'b', text: 'She remained sanguine about the project\'s prospects despite the setbacks.' }, { id: 'c', text: 'He gave a sanguine response to the technical question.' }, { id: 'd', text: 'The sanguine building stood at the corner of the street.' }] },
  { id: 'c2_w1', text: 'Write a nuanced analysis (4-5 sentences) of whether artificial intelligence poses an existential risk to humanity, using advanced academic vocabulary and complex sentence structures.', type: 'open-text', skill: 'writing', targetLevel: 'C2' },
];

// ── SPEAKING QUESTION BANK ─────────────────────────────────────────────────
const SPEAKING_QUESTION_BANK = [
  // ── Beginner (A1 / A2) ──────────────────────────────────────────────────────
  { id: 'sp_a1_1', text: 'Please introduce yourself. Talk about your name, age, hometown, and what you do for work or study.', type: 'speaking', skill: 'speaking', targetLevel: 'A1' },
  { id: 'sp_a2_1', text: 'Describe a typical daily routine of yours. What do you usually do in the morning and evening?', type: 'speaking', skill: 'speaking', targetLevel: 'A2' },
  { id: 'sp_a2_2', text: 'Talk about your favorite hobby or sport. Why do you enjoy it, and how often do you do it?', type: 'speaking', skill: 'speaking', targetLevel: 'A2' },

  // ── Intermediate (B1 / B2) ──────────────────────────────────────────────────
  { id: 'sp_b1_1', text: 'Describe a memorable holiday or trip you took. Where did you go, and what made it special?', type: 'speaking', skill: 'speaking', targetLevel: 'B1' },
  { id: 'sp_b1_2', text: 'Talk about your personal or professional goals for the next three years and how you plan to achieve them.', type: 'speaking', skill: 'speaking', targetLevel: 'B1' },
  { id: 'sp_b2_1', text: 'Discuss the advantages and disadvantages of remote working compared to traditional office environments.', type: 'speaking', skill: 'speaking', targetLevel: 'B2' },
  { id: 'sp_b2_2', text: 'How has smartphones and social media changed the way people build real-life relationships today?', type: 'speaking', skill: 'speaking', targetLevel: 'B2' },

  // ── Advanced (C1 / C2) ──────────────────────────────────────────────────────
  { id: 'sp_c1_1', text: 'Analyze the impact of artificial intelligence on future job opportunities and the education system.', type: 'speaking', skill: 'speaking', targetLevel: 'C1' },
  { id: 'sp_c1_2', text: 'Do you believe global climate policies should prioritize economic expansion or environmental conservation? Justify your view.', type: 'speaking', skill: 'speaking', targetLevel: 'C1' },
  { id: 'sp_c2_1', text: 'Evaluate how recommendation algorithms in digital media influence public opinions and shape contemporary cultural trends.', type: 'speaking', skill: 'speaking', targetLevel: 'C2' },
];

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION SELECTION LOGIC
// ─────────────────────────────────────────────────────────────────────────────
function selectPlacementQuestions() {
  const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const result: any[] = [];
  for (const lvl of levels) {
    const bank = QUESTION_BANK.filter(q => q.targetLevel === lvl);
    const mcqs = bank.filter(q => q.type === 'multiple-choice').slice(0, 2);
    const writing = bank.filter(q => q.type === 'open-text').slice(0, 1);
    result.push(...mcqs, ...writing);
  }
  return result;
}

function selectLevelQuestions(level: CefrLevel) {
  return QUESTION_BANK.filter(q => q.targetLevel === level);
}

function selectSpeakingQuestion(targetLevel?: CefrLevel, userHistoryCount: number = 0) {
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

    const speakingQ = selectSpeakingQuestion(level, historyCount);
    const finalQuestions = [...questions, speakingQ];

    // إخفاء الإجابة الصحيحة قبل الإرسال للفرونت إند
    return finalQuestions.map(({ correctAnswer, ...rest }: any) => rest);
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

    const questions = testType === 'specific' && targetLevel
      ? selectLevelQuestions(targetLevel)
      : selectPlacementQuestions();

    // نجيب السؤال الصوتي من إجابات الفرونت إند نفسها لو موجود، بدل ما نعيد اختياره عشوائي تاني وممكن يختلف
   const speakingAnswer = Object.keys(dto.answers || {}).find(key =>
  SPEAKING_QUESTION_BANK.some(q => q.id === key)
);

const speakingQ = SPEAKING_QUESTION_BANK.find(q => q.id === speakingAnswer)
  ?? selectSpeakingQuestion(targetLevel, historyCount);
    const finalQuestions = [...questions, speakingQ];

    // تحليل التسجيل الصوتي (لو موجود) — مرة واحدة بس هنا
    let speakingAnalysis: any = undefined;
    const rawSpeakingAnswer = (dto.answers || {})[speakingQ.id];
    if (rawSpeakingAnswer) {
      try {
        const { audioBase64, mimeType } = JSON.parse(rawSpeakingAnswer);
        const audioBuffer = Buffer.from(audioBase64, 'base64');

        let durationSeconds = 0;
        try {
          const metadata = await parseBuffer(audioBuffer, mimeType);
          durationSeconds = metadata.format.duration ?? 0;
        } catch {
          durationSeconds = 0;
        }

        if (durationSeconds > 90) {
          throw new BadRequestException(
            `مدة التسجيل الصوتي ${Math.round(durationSeconds)} ثانية، يجب أن تكون 90 ثانية كحد أقصى`,
          );
        }

        speakingAnalysis = await this.aiService.analyzeSpeakingAudio(audioBuffer, mimeType, speakingQ.text);
      } catch (err) {
        if (err instanceof BadRequestException) throw err;
        speakingAnalysis = undefined;
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
}