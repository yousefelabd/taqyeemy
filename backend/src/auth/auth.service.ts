import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(registerDto: RegisterDto) {
    // 1. Create user via admin API with email pre-confirmed for seamless MVP experience
    const { data: adminData, error: adminError } = await this.supabaseService
      .getAdminClient()
      .auth.admin.createUser({
        email: registerDto.email,
        password: registerDto.password,
        email_confirm: true,
        user_metadata: {
          full_name: registerDto.fullName,
        },
      });

    if (adminError) {
      throw new BadRequestException(adminError.message);
    }

    // 2. Automatically log them in to return an active Supabase JWT session
    const { data: sessionData, error: sessionError } = await this.supabaseService
      .getAnonClient()
      .auth.signInWithPassword({
        email: registerDto.email,
        password: registerDto.password,
      });

    if (sessionError || !sessionData.session) {
      return {
        message: 'تم إنشاء الحساب بنجاح',
        token: null,
        user: {
          id: adminData.user.id,
          email: adminData.user.email,
          fullName: registerDto.fullName,
        },
      };
    }

    return {
      message: 'تم إنشاء الحساب وتأكيد الدخول بنجاح',
      token: sessionData.session.access_token,
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
        fullName: registerDto.fullName,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { data, error } = await this.supabaseService.getAnonClient().auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException(error?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
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
}
