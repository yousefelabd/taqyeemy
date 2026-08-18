import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './common/supabase/supabase.module';
import { AiModule } from './common/ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { TestsModule } from './tests/tests.module';
import { ResultsModule } from './results/results.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AiModule,
    AuthModule,
    TestsModule,
    ResultsModule,
  ],
})
export class AppModule {}
