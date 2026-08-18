import { IsEmail, IsNotEmpty, IsString, Length, IsIn } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'يرجى إدخال بريد إلكتروني صحيح' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'رمز التحقق مطلوب' })
  @Length(6, 6, { message: 'رمز التحقق يجب أن يتكون من 6 أرقام' })
  token: string;

  @IsString()
  @IsIn(['signup', 'recovery'], { message: 'نوع التحقق غير صحيح' })
  type: 'signup' | 'recovery';
}
