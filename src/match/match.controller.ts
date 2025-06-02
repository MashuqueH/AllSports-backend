import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { UpdateMatchDto } from './dto/update-match.dto';
import { firstValueFrom } from 'rxjs';
import { Match } from './entities/match.entity';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get()
  findAll() {
    // return this.matchService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log(id);
    const existing = await this.matchService.findOne(+id);

    console.log('existing');
    if (existing) return existing;

    const { data } = await firstValueFrom(this.matchService.getMatchData(+id));

    if (data?.response && data.response.length > 0) {
      const {
        events,
        statistics,
        lineups,
        teams,
        fixture,
        league,
        goals,
        score,
        players,
      } = data.response[0];

      const match: Match = new Match();

      match.fixture = fixture;
      match.league = league;
      match.teams = teams;
      match.goals = goals;
      match.score = score;
      match.events = this.matchService.formatEvents(
        events,
        teams.home.id,
        teams.away.id,
      );
      match.lineups = {
        home: lineups[0],
        away: lineups[1],
      };
      match.players = players;
      match.statistics = this.matchService.formatStatistics(statistics);

      return this.matchService.create(match);
    }

    throw new NotFoundException();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMatchDto: UpdateMatchDto) {
    return this.matchService.update(+id, updateMatchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.matchService.remove(+id);
  }
}
