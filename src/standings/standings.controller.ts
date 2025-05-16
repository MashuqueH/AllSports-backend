import { Controller, Get, Param } from '@nestjs/common';
import { StandingsService } from './standings.service';

@Controller('standings')
export class StandingsController {
  constructor(private standingsService: StandingsService) {}

  @Get('/:id')
  getStandingsById(@Param('id') id: string) {
    return this.standingsService.getStandingsById(id);
  }
}
