import { IsNotEmpty, IsObject, IsIn, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

const MAX_ANSWERS = 20;
const MAX_AUDIO_BASE64_BYTES = 20 * 1024 * 1024;

export class SubmitTestDto {
  @IsNotEmpty()
  @IsIn(['placement', 'specific'])
  testType!: string;

  @IsOptional()
  @IsIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  targetLevel?: string;

  @IsObject()
  @Transform(({ value }) => {
    if (typeof value !== 'object' || value === null) return value;
    
    const keys = Object.keys(value);
    if (keys.length > MAX_ANSWERS) {
      throw new Error(`عدد الإجابات لا يجب أن يتجاوز ${MAX_ANSWERS}`);
    }

    for (const key of keys) {
      const val = value[key];
      if (typeof val === 'string' && val.length > MAX_AUDIO_BASE64_BYTES) {
        throw new Error(`حجم الإجابة كبير جداً`);
      }
    }

    return value;
  })
  answers!: Record<string, string>;
}