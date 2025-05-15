import { Controller, Get, Param } from '@nestjs/common';
import { FixturesService } from './fixtures.service';

@Controller('fixtures')
export class FixturesController {
  constructor(private fixtureService: FixturesService) {}

  @Get('/:id')
  getFixtureById(@Param('id') id: string) {
    return this.fixtureService.getFixtureById(id);
  }

  @Get('/h2h/:team1/:team2')
  getFixtureHeadToHead(
    @Param('team1') team1: string,
    @Param('team2') team2: string,
  ) {
    return this.fixtureService.getFixtureHeadToHead(team1, team2);
  }
}
