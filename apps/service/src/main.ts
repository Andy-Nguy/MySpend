import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Support running from root or apps/service
dotenv.config();
dotenv.config({ path: resolve(process.cwd(), '.env') });
dotenv.config({ path: resolve(process.cwd(), '../../.env') });
dotenv.config({ path: resolve(__dirname, '../../../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env') });


import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';


async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.use(cookieParser());

  // Parse CORS origins from environment variable
  const rawCorsEnv = process.env.CORS_ORIGIN || 'http://localhost:4200';
  const parsedOrigins = rawCorsEnv
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const defaultDevOrigins = ['http://localhost:4200', 'http://localhost:3000'];
  const allowedOrigins = Array.from(
    new Set([...parsedOrigins, ...defaultDevOrigins])
  );

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const isProduction = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (isProduction && (!jwtSecret || jwtSecret === 'your-jwt-secret' || jwtSecret === 'your-jwt-access-secret-key')) {
    logger.warn('⚠️ WARNING: Using default or missing JWT_SECRET in production mode! Please set a secure random string.');
  }
  if (isProduction && (!jwtRefreshSecret || jwtRefreshSecret === 'your-jwt-refresh-secret' || jwtRefreshSecret === 'your-jwt-refresh-secret-key')) {
    logger.warn('⚠️ WARNING: Using default or missing JWT_REFRESH_SECRET in production mode! Please set a secure random string.');
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MySpend API')
    .setDescription('Personal Expense Tracker API Service')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Service is running on: http://localhost:${port}/${globalPrefix}`);
  logger.log(`📚 Swagger Docs available at: http://localhost:${port}/api/docs`);
  logger.log(`🔒 Allowed CORS Origins: ${allowedOrigins.join(', ')}`);
}

bootstrap();
