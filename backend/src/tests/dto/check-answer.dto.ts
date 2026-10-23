import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CheckAnswerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  answer!: string;
}
