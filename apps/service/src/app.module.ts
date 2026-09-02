import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ReportsModule } from './reports/reports.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      load: [configuration],
      cache: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60 * 1000,
        limit: 60,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('databaseUrl');
        const isSsl = config.get<boolean>('databaseSsl');
        const isLogging = config.get<boolean>('databaseLogging') ?? true;

        return {
          type: 'postgres',
          url,
          autoLoadEntities: true,
          synchronize: false,
          logging: isLogging ? ['query', 'error', 'schema', 'warn', 'info', 'log'] : ['error'],
          ssl: isSsl ? { rejectUnauthorized: false } : false,
          extra: isSsl ? { ssl: { rejectUnauthorized: false } } : undefined,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ProfilesModule,
    CategoriesModule,
    TransactionsModule,
    ReportsModule,
    AnnouncementsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
