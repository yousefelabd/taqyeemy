import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export interface RateLimitOptions {
  ttlSeconds: number;
  maxAttempts: number;
}

export const RATE_LIMIT_KEY = 'rate_limit_options';
export const RateLimit = (options?: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

interface RateRecord {
  count: number;
  expiresAt: number;
}

@Injectable()
export class CompositeRateLimiterGuard implements CanActivate {
  private readonly store = new Map<string, RateRecord>();

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions | undefined>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const forwarded = req.headers?.['x-forwarded-for'];
    const clientIp =
      (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown';

    const routeKey = `${req.method}:${req.route?.path || req.url || 'route'}`;
    const key = `${clientIp}:${routeKey}`;
    const now = Date.now();

    if (this.store.size > 2000) {
      for (const [k, v] of this.store.entries()) {
        if (v.expiresAt <= now) {
          this.store.delete(k);
        }
      }
    }

    const existing = this.store.get(key);
    if (!existing || existing.expiresAt <= now) {
      const expiresAt = now + options.ttlSeconds * 1000;
      this.store.set(key, { count: 1, expiresAt });
      this.setHeaders(res, options.maxAttempts, options.maxAttempts - 1, options.ttlSeconds);
      return true;
    }

    existing.count += 1;
    const remaining = Math.max(0, options.maxAttempts - existing.count);
    const retryAfterSec = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));
    this.setHeaders(res, options.maxAttempts, remaining, retryAfterSec);

    if (existing.count > options.maxAttempts) {
      throw new HttpException(
        `تم تجاوز الحد المسموح من المحاولات. يرجى الانتظار ${retryAfterSec} ثانية والمحاولة مرة أخرى.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private setHeaders(res: any, limit: number, remaining: number, resetSec: number): void {
    try {
      if (res && typeof res.setHeader === 'function') {
        res.setHeader('X-RateLimit-Limit', String(limit));
        res.setHeader('X-RateLimit-Remaining', String(remaining));
        res.setHeader('Retry-After', String(resetSec));
      }
    } catch {
      // ignore header errors
    }
  }
}
