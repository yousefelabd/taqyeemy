import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordOtpDto } from './dto/reset-password-otp.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(registerDto: RegisterDto) {
    // 1. Sign up user via Supabase Auth (triggers email verification OTP)
    const { data, error } = await this.supabaseService.getAnonClient().auth.signUp({
      email: registerDto.email,
      password: registerDto.password,
      options: {
        data: {
          full_name: registerDto.fullName,
        },
      },
    });

    if (error) {
      // If user already exists or error
      throw new BadRequestException(error.message || 'حدث خطأ أثناء إنشاء الحساب');
    }

    return {
      message: 'تم إرسال رمز التحقق (OTP) إلى بريدك الإلكتروني',
      requiresOtp: true,
      email: registerDto.email,
    };
  }

  async login(loginDto: LoginDto) {
    const { data, error } = await this.supabaseService.getAnonClient().auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error || !data.session) {
      if (error?.message?.includes('Email not confirmed')) {
        throw new UnauthorizedException('يرجى تأكيد حسابك عبر كود OTP المرسل لإيميلك أولاً');
      }
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    return {
      message: 'تم تسجيل الدخول بنجاح',
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'مستخدم',
      },
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const { data, error } = await this.supabaseService.getAnonClient().auth.verifyOtp({
      email: dto.email,
      token: dto.token,
      type: dto.type,
    });

    if (error || !data.session || !data.user) {
      throw new BadRequestException(
        error?.message || 'رمز التحقق منتهي الصلاحية أو غير صحيح، يرجى إعادة الطلب',
      );
    }

    return {
      message: 'تم التحقق بنجاح',
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'مستخدم',
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { error } = await this.supabaseService.getAnonClient().auth.resetPasswordForEmail(dto.email);

    if (error) {
      // Return clear Arabic feedback
      throw new BadRequestException(error.message || 'حدث خطأ أثناء طلب استعادة كلمة المرور');
    }

    return {
      message: 'تم إرسال رمز استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح',
      email: dto.email,
    };
  }

  async resetPassword(dto: ResetPasswordOtpDto) {
    // 1. Verify recovery OTP
    const { data: verifyData, error: verifyError } = await this.supabaseService
      .getAnonClient()
      .auth.verifyOtp({
        email: dto.email,
        token: dto.token,
        type: 'recovery',
      });

    if (verifyError || !verifyData.user) {
      throw new BadRequestException('رمز التحقق منتهي الصلاحية أو غير صحيح');
    }

    // 2. Update password for verified user via admin client
    const { error: updateError } = await this.supabaseService
      .getAdminClient()
      .auth.admin.updateUserById(verifyData.user.id, {
        password: dto.newPassword,
      });

    if (updateError) {
      throw new BadRequestException('حدث خطأ أثناء تحديث كلمة المرور');
    }

    return {
      message: 'تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول',
    };
  }
}
