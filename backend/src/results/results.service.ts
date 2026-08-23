import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { TestResultResponse, CefrLevel, TestType } from '../common/interfaces/test-result.interface';

@Injectable()
export class ResultsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getHistory(userId: string, token: string): Promise<TestResultResponse[]> {
    const supabase = this.supabaseService.getUserClient(token);

    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching results from Supabase:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      level: row.level as CefrLevel,
      score: row.score,
      multipleChoiceScore: row.multiple_choice_score,
      writingScore: row.writing_score,
      speakingAnalysis: row.speaking_analysis,
      strengths: row.strengths || [],
      weaknesses: row.weaknesses || [],
      testType: row.test_type as TestType,
      targetLevel: row.target_level as CefrLevel | undefined,
      completedAt: row.completed_at,
    }));
  }

  async getResultById(id: string, token: string): Promise<TestResultResponse> {
    const supabase = this.supabaseService.getUserClient(token);

    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`النتيجة رقم ${id} غير موجودة`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      level: data.level as CefrLevel,
      score: data.score,
      multipleChoiceScore: data.multiple_choice_score,
      writingScore: data.writing_score,
      speakingAnalysis: data.speaking_analysis,
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      testType: data.test_type as TestType,
      targetLevel: data.target_level as CefrLevel | undefined,
      completedAt: data.completed_at,
    };
  }

  async saveResult(result: TestResultResponse, token: string): Promise<TestResultResponse> {
    const supabase = this.supabaseService.getUserClient(token);

    const insertData: any = {
      user_id: result.userId,
      level: result.level,
      score: result.score,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      test_type: result.testType,
      target_level: result.targetLevel || null,
      completed_at: result.completedAt,
    };

    if (result.multipleChoiceScore !== undefined) insertData.multiple_choice_score = result.multipleChoiceScore;
    if (result.writingScore !== undefined) insertData.writing_score = result.writingScore;
    if (result.speakingAnalysis !== undefined) insertData.speaking_analysis = result.speakingAnalysis;

    const { data, error } = await supabase
      .from('test_results')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error saving result to Supabase:', error);
      throw new InternalServerErrorException('حدث خطأ أثناء حفظ النتيجة، يرجى المحاولة مرة أخرى');
    }

    return {
      id: data.id,
      userId: data.user_id,
      level: data.level as CefrLevel,
      score: data.score,
      multipleChoiceScore: data.multiple_choice_score,
      writingScore: data.writing_score,
      speakingAnalysis: data.speaking_analysis,
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      testType: data.test_type as TestType,
      targetLevel: data.target_level as CefrLevel | undefined,
      completedAt: data.completed_at,
    };
  }
}