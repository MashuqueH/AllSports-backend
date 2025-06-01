import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeagueModule } from './league/league.module';
import { League } from './league/entities/league.entity';
import { MatchModule } from './match/match.module';
import { FixturesModule } from './fixtures/fixtures.module';

@Module({
  imports: [
    FixturesModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: `mongodb+srv://mash:${process.env.MONGODB_PASSWORD}@allsports.x1conbs.mongodb.net/?retryWrites=true&w=majority&appName=Allsports`,
      synchronize: true,
      logging: true,
      entities: [League],
      // dropSchema: true,
    }),
    LeagueModule,
    MatchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
