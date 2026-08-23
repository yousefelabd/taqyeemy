import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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