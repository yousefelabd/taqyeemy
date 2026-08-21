import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

let app: any;

export default async function handler(req: any, res: any) {
  const allowedOrigins = [
    'https://taqyeemy11.pages.dev',
    'http://localhost:4200',
    process.env.FRONTEND_URL || '',
  ];

  const requestOrigin = req.headers.origin;
  const isAllowed = !requestOrigin || allowedOrigins.includes(requestOrigin);

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin || '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization,X-Requested-With');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (!app) {
    app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  }

  const expressInstance = app.getHttpAdapter().getInstance();
  return expressInstance(req, res);
}