import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FootballModule } from './football/football.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeagueModule } from './league/league.module';
import { League } from './league/entities/league.entity';
import { Standings } from './league/entities/standings.entity';
import { Team } from './league/entities/team.entity';
import { MatchModule } from './match/match.module';

@Module({
  imports: [
    FootballModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      password: 'root',
      username: 'postgres',
      entities: [League, Standings, Team],
      database: 'allsports',
      synchronize: true,
      logging: true,
      // dropSchema: true,
    }),
    LeagueModule,
    MatchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
