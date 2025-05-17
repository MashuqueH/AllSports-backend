import { Module } from '@nestjs/common';
import { FootballController } from './football.controller';
import { FootballService } from './football.service';
import { FixturesModule } from 'src/fixtures/fixtures.module';

@Module({
  imports: [FixturesModule],
  controllers: [FootballController],
  providers: [FootballService],
})
export class FootballModule {}
