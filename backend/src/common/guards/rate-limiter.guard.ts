import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export interface RateLimitOptions {
  ttlSeconds: number;
  maxAttempts: number;
}

export const RATE_LIMIT_KEY = 'rate_limit_options';
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

interface RateBucket {
  count: number;
  resetAt: number;
}

@Injectable()
export class CompositeRateLimiterGuard implements CanActivate {
  private ipBuckets = new Map<string, RateBucket>();
  private emailBuckets = new Map<string, RateBucket>();

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!options) return true;

    const request = context.switchToHttp().getRequest();
    const now = Date.now();
    const ttlMs = options.ttlSeconds * 1000;

    // Extract IP
    const ip =
      request.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      request.ip ||
      request.connection?.remoteAddress ||
      'unknown-ip';

    // Extract Email (if present in body)
    const email = request.body?.email ? request.body.email.toString().toLowerCase().trim() : null;

    // 1. Check IP bucket
    this.checkBucket(this.ipBuckets, `ip:${ip}`, options.maxAttempts, ttlMs, now);

    // 2. Check Email bucket independently (if email present)
    if (email) {
      this.checkBucket(this.emailBuckets, `email:${email}`, options.maxAttempts, ttlMs, now);
    }

    return true;
  }

  private checkBucket(
    map: Map<string, RateBucket>,
    key: string,
    maxAttempts: number,
    ttlMs: number,
    now: number,
  ) {
    const bucket = map.get(key);

    if (!bucket || now > bucket.resetAt) {
      map.set(key, { count: 1, resetAt: now + ttlMs });
      return;
    }

    if (bucket.count >= maxAttempts) {
      const waitMinutes = Math.ceil((bucket.resetAt - now) / 60000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `لقد تجاوزت الحد الأقصى للمحاولات المسموح بها. يرجى الانتظار ${waitMinutes} دقيقة ثم المحاولة مرة أخرى.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    bucket.count += 1;
  }
}
