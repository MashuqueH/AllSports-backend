import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), HttpModule],
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}
