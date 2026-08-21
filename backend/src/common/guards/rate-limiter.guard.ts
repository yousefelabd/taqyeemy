import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../supabase/supabase.service';

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

  constructor(
    private reflector: Reflector,
    private supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!options) return true;

    const request = context.switchToHttp().getRequest();

    // Extract IP
    const ip =
      request.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      request.ip ||
      request.connection?.remoteAddress ||
      'unknown-ip';

    // Extract Email (if present in body)
    const email = request.body?.email ? request.body.email.toString().toLowerCase().trim() : null;

    // 1. Check IP bucket atomically
    await this.checkAtomicRateLimit(`ip:${ip}`, options.maxAttempts, options.ttlSeconds, this.ipBuckets);

    // 2. Check Email bucket independently (if email present)
    if (email) {
      await this.checkAtomicRateLimit(`email:${email}`, options.maxAttempts, options.ttlSeconds, this.emailBuckets);
    }

    return true;
  }

  private async checkAtomicRateLimit(
    key: string,
    maxAttempts: number,
    ttlSeconds: number,
    fallbackMap: Map<string, RateBucket>,
  ): Promise<void> {
    try {
      const client = this.supabaseService.getAdminClient();
      const { data, error } = await client.rpc('check_and_increment_rate_limit', {
        p_key: key,
        p_max_attempts: maxAttempts,
        p_ttl_seconds: ttlSeconds,
      });

      if (error) {
        // [STRATEGY: Fail-Open with In-Memory Soft Limiting]
        // If DB RPC fails or table is unreachable during network glitch, fallback to in-memory map
        // to prevent blocking legitimate users while providing emergency soft rate limiting per instance.
        return this.checkInMemoryFallback(fallbackMap, key, maxAttempts, ttlSeconds * 1000);
      }

      if (data && data.blocked) {
        const waitMinutes = Math.ceil((data.wait_seconds || 60) / 60);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            error: 'Too Many Requests',
            message: `لقد تجاوزت الحد الأقصى للمحاولات المسموح بها. يرجى الانتظار ${waitMinutes} دقيقة ثم المحاولة مرة أخرى.`,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (err) {
      if (err instanceof HttpException) throw err;
      // Fallback to in-memory check
      this.checkInMemoryFallback(fallbackMap, key, maxAttempts, ttlSeconds * 1000);
    }
  }

  private checkInMemoryFallback(
    map: Map<string, RateBucket>,
    key: string,
    maxAttempts: number,
    ttlMs: number,
  ) {
    const now = Date.now();
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
