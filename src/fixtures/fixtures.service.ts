import { Injectable } from '@nestjs/common';
import { EventDTO, MatchDTO, StatisticsDTO } from 'src/types/match.dto';
import { MatchEvents, Statistic } from 'src/entity/match.entity';
import { ApiService } from 'src/api/api.service';

@Injectable()
export class FixturesService {
  constructor(private apiService: ApiService) {}

  async getFixtureById(id: string) {
    const response = await this.apiService.getApiResponse<MatchDTO>(
      'fixtures',
      new URLSearchParams({ id }),
    );

    const { events, statistics, lineups, teams } = response[0];
    return {
      ...response[0],
      events: this.formatEvents(events, teams.home.id, teams.away.id),
      statistics: this.formatStatistics(statistics),
      lineups: {
        home: lineups[0],
        away: lineups[1],
      },
    };
  }

  async getFixtureHeadToHead(team1: string, team2: string) {
    const response = await this.apiService.getApiResponse<MatchDTO>(
      '/fixtures/headtohead',
      new URLSearchParams({
        h2h: `${team1}-${team2}`,
      }),
    );

    return response
      .sort((a, b) => a.fixture.timestamp - b.fixture.timestamp)
      .splice(-5);
  }

  async getRoundsById(id: string) {
    const response = this.apiService.getApiResponse(
      '/fixtures/rounds',
      new URLSearchParams({
        league: id,
        season: '2023',
      }),
    );

    return response;
  }

  async getFixturesByRound(leagueId: string, round: string) {
    const response = await this.apiService.getApiResponse<MatchDTO>(
      '/fixtures',
      new URLSearchParams({
        league: leagueId,
        season: '2023',
        round,
      }),
    );

    const groupByDate: { [key: string]: MatchDTO[] } = {};

    for (const fixture of response) {
      const { date, timezone } = fixture.fixture;

      const formatted = new Date(date).toLocaleDateString(timezone, {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      });

      if (formatted in groupByDate) {
        groupByDate[formatted] = [...groupByDate[formatted], fixture];
      } else {
        groupByDate[formatted] = [fixture];
      }
    }

    return groupByDate;
  }

  private formatEvents(
    data: EventDTO[],
    homeId: number,
    awayId: number,
  ): MatchEvents[] {
    const match: Record<string, MatchEvents> = {};

    for (const e of data) {
      match[e.time.elapsed] = {
        ...match[e.time.elapsed],
        ...(+e.team.id === +homeId && {
          home: e,
        }),
        ...(+e.team.id === +awayId && {
          away: e,
        }),
      };
    }

    return Object.keys(match).map(
      (key: string): MatchEvents => ({
        timestamp: key,
        ...match[key],
      }),
    );
  }

  private formatStatistics(data: StatisticsDTO[]): Statistic[] {
    const statistics: Statistic[] = [];

    if (
      data?.length !== 2 ||
      data[0].statistics.length !== data[1].statistics.length
    )
      return [];

    for (let i = 0; i < data[0].statistics.length; i++) {
      const type = data[0].statistics[i].type;
      const home = data[0].statistics[i].value;
      const away = data[1].statistics[i].value;

      statistics.push({
        name: type,
        home: parseInt('' + home),
        away: parseInt('' + away),
        isPercentage: typeof home === 'string',
      });
    }

    return statistics;
  }
}
