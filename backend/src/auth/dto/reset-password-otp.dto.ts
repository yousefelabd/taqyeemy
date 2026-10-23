import { IsEmail, IsNotEmpty, IsString, MinLength, Length, Matches } from 'class-validator';

export class ResetPasswordOtpDto {
  @IsEmail({}, { message: 'يرجى إدخال بريد إلكتروني صحيح' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'رمز التحقق مطلوب' })
  @Length(6, 6, { message: 'رمز التحقق يجب أن يتكون من 6 أرقام' })
  token: string;

  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
    message: 'كلمة المرور يجب أن تكون قوية (8 أحرف على الأقل وتحتوي على حروف وأرقام)',
  })
  newPassword: string;
}
