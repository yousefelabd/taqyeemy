import { Controller, Get, Post, Body, Query, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TestsService } from './tests.service';
import { SubmitTestDto } from './dto/submit-test.dto';
import { CheckAnswerDto } from './dto/check-answer.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CompositeRateLimiterGuard, RateLimit } from '../common/guards/rate-limiter.guard';
import type { CefrLevel } from '../common/interfaces/test-result.interface';

@Controller('tests')
@UseGuards(AuthGuard, CompositeRateLimiterGuard)
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get('questions')
  async getQuestions(
    @Request() req: any,
    @Query('type') testType: string = 'placement',
    @Query('level') level?: string,
  ) {
    return this.testsService.getQuestions(testType, level as CefrLevel, req.user.id, req.token);
  }

  @Post('submit')
  @RateLimit({ maxAttempts: 20, ttlSeconds: 900 })
  async submit(@Request() req: any, @Body() submitTestDto: SubmitTestDto) {
    return this.testsService.submitAndEvaluate(req.user.id, req.token, submitTestDto as any);
  }

  @Post('check-answer')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 150, ttlSeconds: 900 })
  checkAnswer(@Body() dto: CheckAnswerDto) {
    return this.testsService.checkAnswer(dto.questionId, dto.answer);
  }

  @Post('speaking/analyze')
  @RateLimit({ maxAttempts: 20, ttlSeconds: 900 })
  @UseInterceptors(
    FileInterceptor('audio', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async analyzeSpeaking(
    @UploadedFile() audio: Express.Multer.File,
    @Body('questionText') questionText: string,
    @Body('clientTranscript') clientTranscript?: string,
  ) {
    if (!audio) {
      throw new BadRequestException('الملف الصوتي مطلوب');
    }
    return this.testsService.analyzeSpeakingAnswer(audio, questionText, clientTranscript);
  }
}