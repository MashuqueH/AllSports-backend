import { Module } from '@nestjs/common';
import { FootballController } from './football.controller';
import { FootballService } from './football.service';
import { FixturesModule } from 'src/fixtures/fixtures.module';
import { StandingsModule } from 'src/standings/standings.module';

@Module({
  imports: [FixturesModule, StandingsModule],
  controllers: [FootballController],
  providers: [FootballService],
})
export class FootballModule {}
