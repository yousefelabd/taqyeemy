import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

export interface RateLimitOptions {
  ttlSeconds: number;
  maxAttempts: number;
}

export const RATE_LIMIT_KEY = 'rate_limit_options';
export const RateLimit = (options?: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

@Injectable()
export class CompositeRateLimiterGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // تم إلغاء الليمت بالكامل - مفيش أي حظر أو قيود على عدد الطلبات
    return true;
  }
}
