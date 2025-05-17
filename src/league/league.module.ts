import { Module } from '@nestjs/common';
import { LeagueService } from './league.service';
import { LeagueController } from './league.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { League } from './entities/league.entity';
import { Standings } from './entities/standings.entity';
import { Team } from './entities/team.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([League, Standings, Team]), HttpModule],
  controllers: [LeagueController],
  providers: [LeagueService],
})
export class LeagueModule {}
