import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally for all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS dynamically for Angular Frontend (Localhost + Production Vercel URL)
  const allowedOrigins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
    // Also allow without trailing slash if present
    allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');

      // Check allowedOrigins array
      if (allowedOrigins.includes(origin) || allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // Automatically allow trusted deployment domains (.pages.dev, .vercel.app, localhost)
      if (
        normalizedOrigin.endsWith('.pages.dev') ||
        normalizedOrigin.endsWith('.vercel.app') ||
        normalizedOrigin.includes('localhost') ||
        normalizedOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }

      callback(null, false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend API running on http://localhost:${port}`);
}
bootstrap();
