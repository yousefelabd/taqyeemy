import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('يجب توفير رمز الدخول (Authorization Bearer Token)');
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.trim() === '') {
      throw new UnauthorizedException('رمز الدخول غير صالح');
    }

    // Verify token with Supabase Auth
    const { data: { user }, error } = await this.supabaseService.getAnonClient().auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('جلسة الدخول منتهية أو غير صالحة');
    }

    // Attach verified user and token to request for downstream handlers and RLS
    request.user = {
      id: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'مستخدم',
    };
    request.token = token;

    return true;
  }
}
