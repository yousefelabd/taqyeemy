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

    let { data, error } = await supabase
      .from('test_results')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.warn('User client insert failed, trying admin client fallback:', error);
      const adminClient = this.supabaseService.getAdminClient();
      const adminRes = await adminClient
        .from('test_results')
        .insert(insertData)
        .select()
        .single();

      if (adminRes.error) {
        console.warn('Admin client full insert failed, trying basic columns fallback:', adminRes.error);
        const basicData = {
          user_id: result.userId,
          level: result.level,
          score: result.score,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          test_type: result.testType,
          target_level: result.targetLevel || null,
          completed_at: result.completedAt,
        };
        const basicRes = await adminClient
          .from('test_results')
          .insert(basicData)
          .select()
          .single();

        if (basicRes.error) {
          console.error('Fatal error saving result to Supabase:', basicRes.error);
          throw new InternalServerErrorException('حدث خطأ أثناء حفظ النتيجة، يرجى المحاولة مرة أخرى');
        }
        data = basicRes.data;
      } else {
        data = adminRes.data;
      }
    }

    return {
      id: data.id,
      userId: data.user_id,
      level: data.level as CefrLevel,
      score: data.score,
      multipleChoiceScore: data.multiple_choice_score ?? result.multipleChoiceScore,
      writingScore: data.writing_score ?? result.writingScore,
      speakingAnalysis: data.speaking_analysis ?? result.speakingAnalysis,
      strengths: (data.strengths && data.strengths.length > 0) ? data.strengths : (result.strengths || []),
      weaknesses: (data.weaknesses && data.weaknesses.length > 0) ? data.weaknesses : (result.weaknesses || []),
      testType: (data.test_type as TestType) || result.testType,
      targetLevel: (data.target_level as CefrLevel | undefined) || result.targetLevel,
      completedAt: data.completed_at || result.completedAt,
    };
  }
}