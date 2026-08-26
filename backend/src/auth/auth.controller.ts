import { Controller, Post, Patch, Delete, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordOtpDto } from './dto/reset-password-otp.dto';
import { UpdateNameDto } from './dto/update-name.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CompositeRateLimiterGuard, RateLimit } from '../common/guards/rate-limiter.guard';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('auth')
@UseGuards(CompositeRateLimiterGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 30, ttlSeconds: 900 })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RateLimit({ maxAttempts: 30, ttlSeconds: 900 })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 30, ttlSeconds: 900 })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 20, ttlSeconds: 900 })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 20, ttlSeconds: 900 })
  async resendOtp(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.resendOtp(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 30, ttlSeconds: 900 })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordOtpDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Patch('update-name')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 30, ttlSeconds: 900 })
  async updateName(@Request() req: any, @Body() dto: UpdateNameDto) {
    return this.authService.updateName(req.user.id, dto.fullName);
  }

  @Post('request-password-change-otp')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 20, ttlSeconds: 900 })
  async requestPasswordChangeOtp(@Request() req: any) {
    return this.authService.requestPasswordChangeOtp(req.user.id);
  }

  @Patch('update-password')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 30, ttlSeconds: 900 })
  async updatePassword(@Request() req: any, @Body() dto: UpdatePasswordDto) {
    return this.authService.updatePassword(req.user.id, dto.otp, dto.newPassword);
  }

  @Delete('delete-account')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @RateLimit({ maxAttempts: 10, ttlSeconds: 900 })
  async deleteAccount(@Request() req: any) {
    return this.authService.deleteAccount(req.user.id);
  }
}