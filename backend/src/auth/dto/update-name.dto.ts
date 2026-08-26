import { IsString, MinLength, MaxLength } from 'class-validator';
export class UpdateNameDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  fullName!: string;
}
