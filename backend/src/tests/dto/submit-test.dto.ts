import { IsNotEmpty, IsObject, IsIn, IsOptional } from 'class-validator';
import type { CefrLevel, TestType } from '../../common/interfaces/test-result.interface';

export class SubmitTestDto {
  @IsNotEmpty()
  @IsIn(['placement', 'specific'])
  testType: string;

  @IsOptional()
  @IsIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  targetLevel?: string;

  @IsObject()
  answers: Record<string, string>;
}
