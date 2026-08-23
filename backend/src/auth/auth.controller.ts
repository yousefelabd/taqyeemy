import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordOtpDto } from './dto/reset-password-otp.dto';
import { CompositeRateLimiterGuard, RateLimit } from '../common/guards/rate-limiter.guard';

@Controller('auth')
@UseGuards(CompositeRateLimiterGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 5, ttlSeconds: 900 })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RateLimit({ maxAttempts: 5, ttlSeconds: 900 })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 5, ttlSeconds: 900 })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 3, ttlSeconds: 900 })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 3, ttlSeconds: 900 })
  async resendOtp(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.resendOtp(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 5, ttlSeconds: 900 })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordOtpDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}