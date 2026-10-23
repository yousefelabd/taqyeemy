import { IsString, MinLength, Length, Matches } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @Length(6, 6)
  otp!: string;

  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
    message: 'كلمة المرور يجب أن تكون قوية (8 أحرف على الأقل وتحتوي على حروف وأرقام)',
  })
  newPassword!: string;
}
