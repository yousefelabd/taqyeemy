import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // إخفاء بصمة السيرفر (X-Powered-By) وإضافة Security Headers القياسية
  const expressApp = app.getHttpAdapter().getInstance();
  if (expressApp && typeof expressApp.disable === 'function') {
    expressApp.disable('x-powered-by');
  }

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=(self)');
    next();
  });

  // زيادة الحد الأقصى لحجم الطلب عشان بيانات الصوت (base64) هتتبعت جوه /tests/submit
  app.use(json({ limit: '15mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      const allowed =
        !origin ||
        origin === 'http://localhost:4200' ||
        origin.startsWith('http://127.0.0.1') ||
        origin === 'https://taqyeemy11.pages.dev' ||
        origin.endsWith('.taqyeemy11.pages.dev') ||
        origin === 'https://taqyeemy-backend.vercel.app' ||
        origin === process.env.FRONTEND_URL;

      if (allowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();