import { Module } from '@nestjs/common';
import { StandingsController } from './standings.controller';
import { StandingsService } from './standings.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [StandingsController],
  providers: [StandingsService],
})
export class StandingsModule {}
