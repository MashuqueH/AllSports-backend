import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeagueModule } from './league/league.module';
import { League } from './league/entities/league.entity';
import { FixturesModule } from './fixtures/fixtures.module';
import { Match } from './match/entities/match.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';

@Module({
  imports: [
    // ApiModule,
    FixturesModule,
    CacheModule.register({ isGlobal: true }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: `mongodb+srv://mash:${process.env.MONGODB_PASSWORD}@allsports.x1conbs.mongodb.net/?retryWrites=true&w=majority&appName=Allsports`,
      synchronize: true,
      logging: true,
      entities: [League, Match],
      // dropSchema: true,
    }),
    LeagueModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
