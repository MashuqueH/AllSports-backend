/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom, Observable } from 'rxjs';
import { EventDTO, MatchDTO, StatisticsDTO } from 'src/types/match.dto';
import { MatchEvents, Statistic } from 'src/entity/match.entity';

@Injectable()
export class FixturesService {
  constructor(private httpService: HttpService) {}

  private getApiFixtureData<T>(
    endpoint: string,
  ): Observable<AxiosResponse<{ response: T }>> {
    return this.httpService.get(
      `https://v3.football.api-sports.io/fixtures${endpoint}`,
      {
        headers: {
          'x-rapidapi-key': process.env.API_KEY,
        },
      },
    );
  }

  async getFixtureById(id: string) {
    const { data } = await firstValueFrom(
      this.getApiFixtureData<MatchDTO[]>(`?id=${id}`),
    );
    const { response } = data;

    if (response.length > 0) {
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

    throw new NotFoundException();
  }

  async getFixtureHeadToHead(team1: string, team2: string) {
    const { data } = await firstValueFrom(
      this.getApiFixtureData<MatchDTO[]>(`/headtohead?h2h=${team1}-${team2}`),
    );
    const { response } = data;

    if (!response) throw new NotFoundException();

    return response
      .sort((a, b) => a.fixture.timestamp - b.fixture.timestamp)
      .splice(-5);
  }

  async getRoundsById(id: string) {
    const { data } = await firstValueFrom(
      this.getApiFixtureData<string[]>(`/rounds?league=${id}&season=2021`),
    );

    console.log(data);

    if (!data.response) throw new NotFoundException();

    return data.response;
  }

  async getFixturesByRound(leagueId: string, round: string) {
    const { data } = await firstValueFrom(
      this.getApiFixtureData<MatchDTO[]>(
        `?league=${leagueId}&season=2021&round=${round}`,
      ),
    );

    if (data?.response?.length > 0) {
      const { response } = data;

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

    throw new NotFoundException();
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

  h2h = [
    {
      fixture: {
        id: 141,
        referee: 'Anthony Taylor, England',
        timezone: 'UTC',
        date: '2018-10-06T16:30:00+00:00',
        timestamp: 1538843400,
        periods: {
          first: 1538843400,
          second: 1538847000,
        },
        venue: {
          id: 556,
          name: 'Old Trafford',
          city: 'Manchester',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2018,
        round: 'Regular Season - 8',
        standings: true,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
      },
      goals: {
        home: 3,
        away: 2,
      },
      score: {
        halftime: {
          home: 0,
          away: 2,
        },
        fulltime: {
          home: 3,
          away: 2,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 11794,
        referee: 'Craig Pawson, England',
        timezone: 'UTC',
        date: '2017-11-18T17:30:00+00:00',
        timestamp: 1511026200,
        periods: {
          first: 1511026200,
          second: 1511029800,
        },
        venue: {
          id: 556,
          name: 'Old Trafford',
          city: 'Manchester',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2017,
        round: 'Regular Season - 12',
        standings: true,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
      },
      goals: {
        home: 4,
        away: 1,
      },
      score: {
        halftime: {
          home: 2,
          away: 1,
        },
        fulltime: {
          home: 4,
          away: 1,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 157201,
        referee: 'Kevin Friend, England',
        timezone: 'UTC',
        date: '2019-12-26T17:30:00+00:00',
        timestamp: 1577381400,
        periods: {
          first: 1577381400,
          second: 1577385000,
        },
        venue: {
          id: 556,
          name: 'Old Trafford',
          city: 'Manchester',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2019,
        round: 'Regular Season - 19',
        standings: true,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
      },
      goals: {
        home: 4,
        away: 1,
      },
      score: {
        halftime: {
          home: 3,
          away: 1,
        },
        fulltime: {
          home: 4,
          away: 1,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 192317,
        referee: 'Craig Pawson, England',
        timezone: 'UTC',
        date: '2015-08-22T11:45:00+00:00',
        timestamp: 1440243900,
        periods: {
          first: 1440243900,
          second: 1440247500,
        },
        venue: {
          id: 556,
          name: 'Old Trafford',
          city: 'Manchester',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2015,
        round: 'Regular Season - 3',
        standings: true,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: null,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: null,
        },
      },
      goals: {
        home: 0,
        away: 0,
      },
      score: {
        halftime: {
          home: 0,
          away: 0,
        },
        fulltime: {
          home: 0,
          away: 0,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 192852,
        referee: null,
        timezone: 'UTC',
        date: '2014-12-26T15:00:00+00:00',
        timestamp: 1419606000,
        periods: {
          first: 1419606000,
          second: 1419609600,
        },
        venue: {
          id: null,
          name: 'Old Trafford (Manchester)',
          city: null,
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2014,
        round: 'Regular Season - 18',
        standings: true,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
      },
      goals: {
        home: 3,
        away: 1,
      },
      score: {
        halftime: {
          home: 2,
          away: 0,
        },
        fulltime: {
          home: 3,
          away: 1,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 193197,
        referee: null,
        timezone: 'UTC',
        date: '2013-12-07T12:45:00+00:00',
        timestamp: 1386420300,
        periods: {
          first: 1386420300,
          second: 1386423900,
        },
        venue: {
          id: null,
          name: 'Old Trafford (Manchester)',
          city: null,
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2013,
        round: 'Regular Season - 15',
        standings: true,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: false,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: true,
        },
      },
      goals: {
        home: 0,
        away: 1,
      },
      score: {
        halftime: {
          home: 0,
          away: 0,
        },
        fulltime: {
          home: 0,
          away: 1,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 193619,
        referee: null,
        timezone: 'UTC',
        date: '2012-12-26T15:00:00+00:00',
        timestamp: 1356534000,
        periods: {
          first: 1356534000,
          second: 1356537600,
        },
        venue: {
          id: null,
          name: 'Old Trafford (Manchester)',
          city: null,
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2012,
        round: 'Regular Season - 19',
        standings: true,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
      },
      goals: {
        home: 4,
        away: 3,
      },
      score: {
        halftime: {
          home: 1,
          away: 2,
        },
        fulltime: {
          home: 4,
          away: 3,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 193940,
        referee: null,
        timezone: 'UTC',
        date: '2011-11-26T15:00:00+00:00',
        timestamp: 1322319600,
        periods: {
          first: 1322319600,
          second: 1322323200,
        },
        venue: {
          id: null,
          name: 'Old Trafford (Manchester)',
          city: null,
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2011,
        round: 'Regular Season - 13',
        standings: true,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: null,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: null,
        },
      },
      goals: {
        home: 1,
        away: 1,
      },
      score: {
        halftime: {
          home: 0,
          away: 0,
        },
        fulltime: {
          home: 1,
          away: 1,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 194206,
        referee: null,
        timezone: 'UTC',
        date: '2010-08-16T19:00:00+00:00',
        timestamp: 1281985200,
        periods: {
          first: null,
          second: null,
        },
        venue: {
          id: null,
          name: 'Old Trafford (Manchester)',
          city: null,
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2010,
        round: 'Regular Season - 38',
        standings: true,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
      },
      goals: {
        home: 3,
        away: 0,
      },
      score: {
        halftime: {
          home: 2,
          away: 0,
        },
        fulltime: {
          home: 3,
          away: 0,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 455536,
        referee: null,
        timezone: 'UTC',
        date: '2012-09-26T18:45:00+00:00',
        timestamp: 1348685100,
        periods: {
          first: 1348685100,
          second: 1348688700,
        },
        venue: {
          id: null,
          name: 'Old Trafford',
          city: null,
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 48,
        name: 'League Cup',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/48.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2012,
        round: '3rd Round',
        standings: false,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
      },
      goals: {
        home: 2,
        away: 1,
      },
      score: {
        halftime: {
          home: 1,
          away: 0,
        },
        fulltime: {
          home: 2,
          away: 1,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 592742,
        referee: 'P. Tierney',
        timezone: 'UTC',
        date: '2021-02-21T19:00:00+00:00',
        timestamp: 1613934000,
        periods: {
          first: 1613934000,
          second: 1613937600,
        },
        venue: {
          id: 556,
          name: 'Old Trafford',
          city: 'Manchester',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2020,
        round: 'Regular Season - 25',
        standings: true,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
      },
      goals: {
        home: 3,
        away: 1,
      },
      score: {
        halftime: {
          home: 1,
          away: 1,
        },
        fulltime: {
          home: 3,
          away: 1,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 710593,
        referee: 'A. Taylor',
        timezone: 'UTC',
        date: '2021-09-11T14:00:00+00:00',
        timestamp: 1631368800,
        periods: {
          first: 1631368800,
          second: 1631372400,
        },
        venue: {
          id: 556,
          name: 'Old Trafford',
          city: 'Manchester',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2021,
        round: 'Regular Season - 4',
        standings: true,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
      },
      goals: {
        home: 4,
        away: 1,
      },
      score: {
        halftime: {
          home: 1,
          away: 0,
        },
        fulltime: {
          home: 4,
          away: 1,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 868052,
        referee: 'C. Pawson',
        timezone: 'UTC',
        date: '2022-10-16T13:00:00+00:00',
        timestamp: 1665925200,
        periods: {
          first: 1665925200,
          second: 1665928800,
        },
        venue: {
          id: 556,
          name: 'Old Trafford',
          city: 'Manchester',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2022,
        round: 'Regular Season - 11',
        standings: true,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: null,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: null,
        },
      },
      goals: {
        home: 0,
        away: 0,
      },
      score: {
        halftime: {
          home: 0,
          away: 0,
        },
        fulltime: {
          home: 0,
          away: 0,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 998280,
        referee: 'D. Coote',
        timezone: 'UTC',
        date: '2023-02-26T16:30:00+00:00',
        timestamp: 1677429000,
        periods: {
          first: 1677429000,
          second: 1677432600,
        },
        venue: {
          id: 489,
          name: 'Wembley Stadium',
          city: 'London',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 48,
        name: 'League Cup',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/48.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2022,
        round: 'Final',
        standings: false,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
      },
      goals: {
        home: 2,
        away: 0,
      },
      score: {
        halftime: {
          home: 2,
          away: 0,
        },
        fulltime: {
          home: 2,
          away: 0,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 1035510,
        referee: 'R. Jones',
        timezone: 'UTC',
        date: '2024-05-15T19:00:00+00:00',
        timestamp: 1715799600,
        periods: {
          first: 1715799600,
          second: 1715803200,
        },
        venue: {
          id: 556,
          name: 'Old Trafford',
          city: 'Manchester',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2023,
        round: 'Regular Season - 34',
        standings: true,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
      },
      goals: {
        home: 3,
        away: 2,
      },
      score: {
        halftime: {
          home: 1,
          away: 0,
        },
        fulltime: {
          home: 3,
          away: 2,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 1136339,
        referee: 'R. Jones',
        timezone: 'UTC',
        date: '2023-11-01T20:15:00+00:00',
        timestamp: 1698869700,
        periods: {
          first: 1698869700,
          second: 1698873300,
        },
        venue: {
          id: 556,
          name: 'Old Trafford',
          city: 'Manchester',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 48,
        name: 'League Cup',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/48.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2023,
        round: 'Round of 16',
        standings: false,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: false,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: true,
        },
      },
      goals: {
        home: 0,
        away: 3,
      },
      score: {
        halftime: {
          home: 0,
          away: 2,
        },
        fulltime: {
          home: 0,
          away: 3,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 1208210,
        referee: 'S. Hooper',
        timezone: 'UTC',
        date: '2024-12-30T20:00:00+00:00',
        timestamp: 1735588800,
        periods: {
          first: 1735588800,
          second: 1735592400,
        },
        venue: {
          id: 556,
          name: 'Old Trafford',
          city: 'Manchester',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: 4,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2024,
        round: 'Regular Season - 19',
        standings: true,
      },
      teams: {
        home: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: false,
        },
        away: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: true,
        },
      },
      goals: {
        home: 0,
        away: 2,
      },
      score: {
        halftime: {
          home: 0,
          away: 2,
        },
        fulltime: {
          home: 0,
          away: 2,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 272,
        referee: 'Andre Marriner, England',
        timezone: 'UTC',
        date: '2019-01-02T20:00:00+00:00',
        timestamp: 1546459200,
        periods: {
          first: 1546459200,
          second: 1546462800,
        },
        venue: {
          id: 562,
          name: "St James' Park",
          city: 'Newcastle upon Tyne',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2018,
        round: 'Regular Season - 21',
        standings: true,
      },
      teams: {
        home: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
        away: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
      },
      goals: {
        home: 0,
        away: 2,
      },
      score: {
        halftime: {
          home: 0,
          away: 0,
        },
        fulltime: {
          home: 0,
          away: 2,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 11644,
        referee: 'Craig Pawson, England',
        timezone: 'UTC',
        date: '2018-02-11T14:15:00+00:00',
        timestamp: 1518358500,
        periods: {
          first: 1518358500,
          second: 1518362100,
        },
        venue: {
          id: 562,
          name: "St James' Park",
          city: 'Newcastle upon Tyne',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2017,
        round: 'Regular Season - 27',
        standings: true,
      },
      teams: {
        home: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: true,
        },
        away: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: false,
        },
      },
      goals: {
        home: 1,
        away: 0,
      },
      score: {
        halftime: {
          home: 0,
          away: 0,
        },
        fulltime: {
          home: 1,
          away: 0,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 157090,
        referee: 'Mike Dean, England',
        timezone: 'UTC',
        date: '2019-10-06T15:30:00+00:00',
        timestamp: 1570375800,
        periods: {
          first: 1570375800,
          second: 1570379400,
        },
        venue: {
          id: 562,
          name: "St. James' Park",
          city: 'Newcastle upon Tyne',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2019,
        round: 'Regular Season - 8',
        standings: true,
      },
      teams: {
        home: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: true,
        },
        away: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: false,
        },
      },
      goals: {
        home: 1,
        away: 0,
      },
      score: {
        halftime: {
          home: 0,
          away: 0,
        },
        fulltime: {
          home: 1,
          away: 0,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 192499,
        referee: 'Mike Dean, England',
        timezone: 'UTC',
        date: '2016-01-12T19:45:00+00:00',
        timestamp: 1452627900,
        periods: {
          first: 1452627900,
          second: 1452631500,
        },
        venue: {
          id: 562,
          name: "St James' Park",
          city: 'Newcastle upon Tyne',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2015,
        round: 'Regular Season - 21',
        standings: true,
      },
      teams: {
        home: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: null,
        },
        away: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: null,
        },
      },
      goals: {
        home: 3,
        away: 3,
      },
      score: {
        halftime: {
          home: 1,
          away: 2,
        },
        fulltime: {
          home: 3,
          away: 3,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 192953,
        referee: 'Anthony Taylor, England',
        timezone: 'UTC',
        date: '2015-03-04T19:45:00+00:00',
        timestamp: 1425498300,
        periods: {
          first: 1425498300,
          second: 1425501900,
        },
        venue: {
          id: 562,
          name: "St James' Park",
          city: 'Newcastle upon Tyne',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2014,
        round: 'Regular Season - 28',
        standings: true,
      },
      teams: {
        home: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
        away: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
      },
      goals: {
        home: 0,
        away: 1,
      },
      score: {
        halftime: {
          home: 0,
          away: 0,
        },
        fulltime: {
          home: 0,
          away: 1,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 193381,
        referee: null,
        timezone: 'UTC',
        date: '2014-04-05T14:00:00+00:00',
        timestamp: 1396706400,
        periods: {
          first: 1396706400,
          second: 1396710000,
        },
        venue: {
          id: null,
          name: "St. James' Park (Newcastle-upon-Tyne)",
          city: null,
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2013,
        round: 'Regular Season - 33',
        standings: true,
      },
      teams: {
        home: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
        away: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
      },
      goals: {
        home: 0,
        away: 4,
      },
      score: {
        halftime: {
          home: 0,
          away: 1,
        },
        fulltime: {
          home: 0,
          away: 4,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 193506,
        referee: null,
        timezone: 'UTC',
        date: '2012-10-07T15:00:00+00:00',
        timestamp: 1349622000,
        periods: {
          first: 1349622000,
          second: 1349625600,
        },
        venue: {
          id: null,
          name: "St. James' Park (Newcastle-upon-Tyne)",
          city: null,
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2012,
        round: 'Regular Season - 7',
        standings: true,
      },
      teams: {
        home: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
        away: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
      },
      goals: {
        home: 0,
        away: 3,
      },
      score: {
        halftime: {
          home: 0,
          away: 2,
        },
        fulltime: {
          home: 0,
          away: 3,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 194016,
        referee: null,
        timezone: 'UTC',
        date: '2012-01-04T20:00:00+00:00',
        timestamp: 1325707200,
        periods: {
          first: 1325707200,
          second: 1325710800,
        },
        venue: {
          id: null,
          name: 'Sports Direct Arena (Newcastle-upon-Tyne)',
          city: null,
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2011,
        round: 'Regular Season - 20',
        standings: true,
      },
      teams: {
        home: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: true,
        },
        away: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: false,
        },
      },
      goals: {
        home: 3,
        away: 0,
      },
      score: {
        halftime: {
          home: 1,
          away: 0,
        },
        fulltime: {
          home: 3,
          away: 0,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 194251,
        referee: null,
        timezone: 'UTC',
        date: '2011-04-19T18:45:00+00:00',
        timestamp: 1303238700,
        periods: {
          first: null,
          second: null,
        },
        venue: {
          id: null,
          name: 'Sports Direct Arena (Newcastle-upon-Tyne)',
          city: null,
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2010,
        round: 'Regular Season - 6',
        standings: true,
      },
      teams: {
        home: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: null,
        },
        away: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: null,
        },
      },
      goals: {
        home: 0,
        away: 0,
      },
      score: {
        halftime: {
          home: 0,
          away: 0,
        },
        fulltime: {
          home: 0,
          away: 0,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 592187,
        referee: 'C. Pawson',
        timezone: 'UTC',
        date: '2020-10-17T19:00:00+00:00',
        timestamp: 1602961200,
        periods: {
          first: 1602961200,
          second: 1602964800,
        },
        venue: {
          id: 562,
          name: "St. James' Park",
          city: 'Newcastle upon Tyne',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2020,
        round: 'Regular Season - 5',
        standings: true,
      },
      teams: {
        home: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: false,
        },
        away: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: true,
        },
      },
      goals: {
        home: 1,
        away: 4,
      },
      score: {
        halftime: {
          home: 1,
          away: 1,
        },
        fulltime: {
          home: 1,
          away: 4,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 710741,
        referee: 'C. Pawson',
        timezone: 'UTC',
        date: '2021-12-27T20:00:00+00:00',
        timestamp: 1640635200,
        periods: {
          first: 1640635200,
          second: 1640638800,
        },
        venue: {
          id: 562,
          name: "St. James' Park",
          city: 'Newcastle upon Tyne',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2021,
        round: 'Regular Season - 19',
        standings: true,
      },
      teams: {
        home: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: null,
        },
        away: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: null,
        },
      },
      goals: {
        home: 1,
        away: 1,
      },
      score: {
        halftime: {
          home: 1,
          away: 0,
        },
        fulltime: {
          home: 1,
          away: 1,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 868233,
        referee: 'S. Attwell',
        timezone: 'UTC',
        date: '2023-04-02T15:30:00+00:00',
        timestamp: 1680449400,
        periods: {
          first: 1680449400,
          second: 1680453000,
        },
        venue: {
          id: 562,
          name: "St. James' Park",
          city: 'Newcastle upon Tyne',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2022,
        round: 'Regular Season - 29',
        standings: true,
      },
      teams: {
        home: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: true,
        },
        away: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: false,
        },
      },
      goals: {
        home: 2,
        away: 0,
      },
      score: {
        halftime: {
          home: 0,
          away: 0,
        },
        fulltime: {
          home: 2,
          away: 0,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 1035311,
        referee: 'R. Jones',
        timezone: 'UTC',
        date: '2023-12-02T20:00:00+00:00',
        timestamp: 1701547200,
        periods: {
          first: 1701547200,
          second: 1701550800,
        },
        venue: {
          id: 562,
          name: "St. James' Park",
          city: 'Newcastle upon Tyne',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: null,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2023,
        round: 'Regular Season - 14',
        standings: true,
      },
      teams: {
        home: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: true,
        },
        away: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: false,
        },
      },
      goals: {
        home: 1,
        away: 0,
      },
      score: {
        halftime: {
          home: 0,
          away: 0,
        },
        fulltime: {
          home: 1,
          away: 0,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
    {
      fixture: {
        id: 1208339,
        referee: 'C. Kavanagh',
        timezone: 'UTC',
        date: '2025-04-13T15:30:00+00:00',
        timestamp: 1744558200,
        periods: {
          first: 1744558200,
          second: 1744561800,
        },
        venue: {
          id: 562,
          name: "St. James' Park",
          city: 'Newcastle upon Tyne',
        },
        status: {
          long: 'Match Finished',
          short: 'FT',
          elapsed: 90,
          extra: 5,
        },
      },
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2024,
        round: 'Regular Season - 32',
        standings: true,
      },
      teams: {
        home: {
          id: 34,
          name: 'Newcastle',
          logo: 'https://media.api-sports.io/football/teams/34.png',
          winner: true,
        },
        away: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media.api-sports.io/football/teams/33.png',
          winner: false,
        },
      },
      goals: {
        home: 4,
        away: 1,
      },
      score: {
        halftime: {
          home: 1,
          away: 1,
        },
        fulltime: {
          home: 4,
          away: 1,
        },
        extratime: {
          home: null,
          away: null,
        },
        penalty: {
          home: null,
          away: null,
        },
      },
    },
  ];

  fixtures = {
    fixture: {
      id: 215662,
      referee: 'H. Mastrángelo',
      timezone: 'UTC',
      date: '2019-10-20T14:00:00+00:00',
      timestamp: 1571580000,
      periods: {
        first: 1571580000,
        second: 1571583600,
      },
      venue: {
        id: 33,
        name: 'Estadio José María Minella',
        city: 'Mar del Plata, Provincia de Buenos Aires',
      },
      status: {
        long: 'Match Finished',
        short: 'FT',
        elapsed: 90,
        extra: null,
      },
    },
    league: {
      id: 128,
      name: 'Liga Profesional Argentina',
      country: 'Argentina',
      logo: 'https://media.api-sports.io/football/leagues/128.png',
      flag: 'https://media.api-sports.io/flags/ar.svg',
      season: 2019,
      round: 'Regular Season - 10',
      standings: true,
    },
    teams: {
      home: {
        id: 463,
        name: 'Aldosivi',
        logo: 'https://media.api-sports.io/football/teams/463.png',
        winner: true,
      },
      away: {
        id: 442,
        name: 'Defensa Y Justicia',
        logo: 'https://media.api-sports.io/football/teams/442.png',
        winner: false,
      },
    },
    goals: {
      home: 1,
      away: 0,
    },
    score: {
      halftime: {
        home: 1,
        away: 0,
      },
      fulltime: {
        home: 1,
        away: 0,
      },
      extratime: {
        home: null,
        away: null,
      },
      penalty: {
        home: null,
        away: null,
      },
    },
    events: [
      {
        time: {
          elapsed: 25,
          extra: null,
        },
        team: {
          id: 463,
          name: 'Aldosivi',
          logo: 'https://media.api-sports.io/football/teams/463.png',
        },
        player: {
          id: 6126,
          name: 'F. Andrada',
        },
        assist: {
          id: null,
          name: null,
        },
        type: 'Goal',
        detail: 'Normal Goal',
        comments: null,
      },
      {
        time: {
          elapsed: 33,
          extra: null,
        },
        team: {
          id: 442,
          name: 'Defensa Y Justicia',
          logo: 'https://media.api-sports.io/football/teams/442.png',
        },
        player: {
          id: 5936,
          name: 'Julio González',
        },
        assist: {
          id: null,
          name: null,
        },
        type: 'Card',
        detail: 'Yellow Card',
        comments: null,
      },
      {
        time: {
          elapsed: 33,
          extra: null,
        },
        team: {
          id: 463,
          name: 'Aldosivi',
          logo: 'https://media.api-sports.io/football/teams/463.png',
        },
        player: {
          id: 6126,
          name: 'Federico Andrada',
        },
        assist: {
          id: null,
          name: null,
        },
        type: 'Card',
        detail: 'Yellow Card',
        comments: null,
      },
      {
        time: {
          elapsed: 36,
          extra: null,
        },
        team: {
          id: 442,
          name: 'Defensa Y Justicia',
          logo: 'https://media.api-sports.io/football/teams/442.png',
        },
        player: {
          id: 5931,
          name: 'Diego Rodríguez',
        },
        assist: {
          id: null,
          name: null,
        },
        type: 'Card',
        detail: 'Yellow Card',
        comments: null,
      },
      {
        time: {
          elapsed: 39,
          extra: null,
        },
        team: {
          id: 442,
          name: 'Defensa Y Justicia',
          logo: 'https://media.api-sports.io/football/teams/442.png',
        },
        player: {
          id: 5954,
          name: 'Fernando Márquez',
        },
        assist: {
          id: null,
          name: null,
        },
        type: 'Card',
        detail: 'Yellow Card',
        comments: null,
      },
      {
        time: {
          elapsed: 44,
          extra: null,
        },
        team: {
          id: 463,
          name: 'Aldosivi',
          logo: 'https://media.api-sports.io/football/teams/463.png',
        },
        player: {
          id: 6262,
          name: 'Emanuel Iñiguez',
        },
        assist: {
          id: null,
          name: null,
        },
        type: 'Card',
        detail: 'Yellow Card',
        comments: null,
      },
      {
        time: {
          elapsed: 46,
          extra: null,
        },
        team: {
          id: 442,
          name: 'Defensa Y Justicia',
          logo: 'https://media.api-sports.io/football/teams/442.png',
        },
        player: {
          id: 35695,
          name: 'D. Rodríguez',
        },
        assist: {
          id: 5947,
          name: 'B. Merlini',
        },
        type: 'subst',
        detail: 'Substitution 1',
        comments: null,
      },
      {
        time: {
          elapsed: 62,
          extra: null,
        },
        team: {
          id: 463,
          name: 'Aldosivi',
          logo: 'https://media.api-sports.io/football/teams/463.png',
        },
        player: {
          id: 6093,
          name: 'Gonzalo Verón',
        },
        assist: {
          id: null,
          name: null,
        },
        type: 'Card',
        detail: 'Yellow Card',
        comments: null,
      },
      {
        time: {
          elapsed: 73,
          extra: null,
        },
        team: {
          id: 442,
          name: 'Defensa Y Justicia',
          logo: 'https://media.api-sports.io/football/teams/442.png',
        },
        player: {
          id: 5942,
          name: 'A. Castro',
        },
        assist: {
          id: 6059,
          name: 'G. Mainero',
        },
        type: 'subst',
        detail: 'Substitution 2',
        comments: null,
      },
      {
        time: {
          elapsed: 74,
          extra: null,
        },
        team: {
          id: 463,
          name: 'Aldosivi',
          logo: 'https://media.api-sports.io/football/teams/463.png',
        },
        player: {
          id: 6561,
          name: 'N. Solís',
        },
        assist: {
          id: 35845,
          name: 'H. Burbano',
        },
        type: 'subst',
        detail: 'Substitution 1',
        comments: null,
      },
      {
        time: {
          elapsed: 75,
          extra: null,
        },
        team: {
          id: 463,
          name: 'Aldosivi',
          logo: 'https://media.api-sports.io/football/teams/463.png',
        },
        player: {
          id: 6093,
          name: 'G. Verón',
        },
        assist: {
          id: 6396,
          name: 'N. Bazzana',
        },
        type: 'subst',
        detail: 'Substitution 2',
        comments: null,
      },
      {
        time: {
          elapsed: 79,
          extra: null,
        },
        team: {
          id: 463,
          name: 'Aldosivi',
          logo: 'https://media.api-sports.io/football/teams/463.png',
        },
        player: {
          id: 6474,
          name: 'G. Gil',
        },
        assist: {
          id: 6550,
          name: 'F. Grahl',
        },
        type: 'subst',
        detail: 'Substitution 3',
        comments: null,
      },
      {
        time: {
          elapsed: 79,
          extra: null,
        },
        team: {
          id: 442,
          name: 'Defensa Y Justicia',
          logo: 'https://media.api-sports.io/football/teams/442.png',
        },
        player: {
          id: 5936,
          name: 'J. González',
        },
        assist: {
          id: 70767,
          name: 'B. Ojeda',
        },
        type: 'subst',
        detail: 'Substitution 3',
        comments: null,
      },
      {
        time: {
          elapsed: 84,
          extra: null,
        },
        team: {
          id: 442,
          name: 'Defensa Y Justicia',
          logo: 'https://media.api-sports.io/football/teams/442.png',
        },
        player: {
          id: 6540,
          name: 'Juan Rodriguez',
        },
        assist: {
          id: null,
          name: null,
        },
        type: 'Card',
        detail: 'Yellow Card',
        comments: null,
      },
      {
        time: {
          elapsed: 85,
          extra: null,
        },
        team: {
          id: 463,
          name: 'Aldosivi',
          logo: 'https://media.api-sports.io/football/teams/463.png',
        },
        player: {
          id: 35845,
          name: 'Hernán Burbano',
        },
        assist: {
          id: null,
          name: null,
        },
        type: 'Card',
        detail: 'Yellow Card',
        comments: null,
      },
      {
        time: {
          elapsed: 90,
          extra: null,
        },
        team: {
          id: 463,
          name: 'Aldosivi',
          logo: 'https://media.api-sports.io/football/teams/463.png',
        },
        player: {
          id: 35845,
          name: 'Hernán Burbano',
        },
        assist: {
          id: null,
          name: null,
        },
        type: 'Card',
        detail: 'Red Card',
        comments: null,
      },
      {
        time: {
          elapsed: 90,
          extra: null,
        },
        team: {
          id: 442,
          name: 'Defensa Y Justicia',
          logo: 'https://media.api-sports.io/football/teams/442.png',
        },
        player: {
          id: 5912,
          name: 'Neri Cardozo',
        },
        assist: {
          id: null,
          name: null,
        },
        type: 'Card',
        detail: 'Yellow Card',
        comments: null,
      },
      {
        time: {
          elapsed: 90,
          extra: null,
        },
        team: {
          id: 463,
          name: 'Aldosivi',
          logo: 'https://media.api-sports.io/football/teams/463.png',
        },
        player: {
          id: 35845,
          name: 'Hernán Burbano',
        },
        assist: {
          id: null,
          name: null,
        },
        type: 'Card',
        detail: 'Yellow Card',
        comments: null,
      },
    ],
    lineups: [
      {
        team: {
          id: 463,
          name: 'Aldosivi',
          logo: 'https://media.api-sports.io/football/teams/463.png',
          colors: null,
        },
        coach: {
          id: 3946,
          name: 'G. Hoyos',
          photo: 'https://media.api-sports.io/football/coachs/3946.png',
        },
        formation: '4-3-3',
        startXI: [
          {
            player: {
              id: 6258,
              name: 'L. Pocrnjic',
              number: 1,
              pos: 'G',
              grid: '1:1',
            },
          },
          {
            player: {
              id: 6261,
              name: 'L. Galeano',
              number: 6,
              pos: 'D',
              grid: '2:4',
            },
          },
          {
            player: {
              id: 52701,
              name: 'M. Miers',
              number: 19,
              pos: 'D',
              grid: '2:3',
            },
          },
          {
            player: {
              id: 6268,
              name: 'L. Villalba',
              number: 23,
              pos: 'D',
              grid: '2:2',
            },
          },
          {
            player: {
              id: 6262,
              name: 'E. Iñíguez',
              number: 21,
              pos: 'D',
              grid: '2:1',
            },
          },
          {
            player: {
              id: 6474,
              name: 'G. Gil',
              number: 5,
              pos: 'M',
              grid: '3:3',
            },
          },
          {
            player: {
              id: 6269,
              name: 'F. Acevedo',
              number: 8,
              pos: 'M',
              grid: '3:2',
            },
          },
          {
            player: {
              id: 6212,
              name: 'L. Maciel',
              number: 33,
              pos: 'M',
              grid: '3:1',
            },
          },
          {
            player: {
              id: 6093,
              name: 'G. Verón',
              number: 29,
              pos: 'F',
              grid: '4:3',
            },
          },
          {
            player: {
              id: 6126,
              name: 'F. Andrada',
              number: 10,
              pos: 'F',
              grid: '4:2',
            },
          },
          {
            player: {
              id: 6561,
              name: 'N. Solís',
              number: 7,
              pos: 'F',
              grid: '4:1',
            },
          },
        ],
        substitutes: [
          {
            player: {
              id: 35845,
              name: 'H. Burbano',
              number: 11,
              pos: 'M',
              grid: null,
            },
          },
          {
            player: {
              id: 6396,
              name: 'N. Bazzana',
              number: 27,
              pos: 'D',
              grid: null,
            },
          },
          {
            player: {
              id: 6550,
              name: 'F. Grahl',
              number: 22,
              pos: 'M',
              grid: null,
            },
          },
          {
            player: {
              id: 152779,
              name: 'F. Tobares',
              number: 40,
              pos: 'F',
              grid: null,
            },
          },
          {
            player: {
              id: 6255,
              name: 'F. Assmann',
              number: 35,
              pos: 'G',
              grid: null,
            },
          },
          {
            player: {
              id: 6399,
              name: 'F. Evangelista',
              number: 20,
              pos: 'D',
              grid: null,
            },
          },
          {
            player: {
              id: 5426,
              name: 'C. Fara',
              number: 2,
              pos: 'D',
              grid: null,
            },
          },
        ],
      },
      {
        team: {
          id: 442,
          name: 'Defensa Y Justicia',
          logo: 'https://media.api-sports.io/football/teams/442.png',
          colors: null,
        },
        coach: {
          id: 896,
          name: 'M. Soso',
          photo: 'https://media.api-sports.io/football/coachs/896.png',
        },
        formation: '4-4-2',
        startXI: [
          {
            player: {
              id: 5932,
              name: 'E. Unsain',
              number: 22,
              pos: 'G',
              grid: '1:1',
            },
          },
          {
            player: {
              id: 5935,
              name: 'R. Delgado',
              number: 33,
              pos: 'D',
              grid: '2:4',
            },
          },
          {
            player: {
              id: 6540,
              name: 'J. Rodríguez',
              number: 28,
              pos: 'D',
              grid: '2:3',
            },
          },
          {
            player: {
              id: 5936,
              name: 'J. González',
              number: 4,
              pos: 'D',
              grid: '2:2',
            },
          },
          {
            player: {
              id: 5991,
              name: 'H. Martínez',
              number: 21,
              pos: 'D',
              grid: '2:1',
            },
          },
          {
            player: {
              id: 5912,
              name: 'N. Cardozo',
              number: 10,
              pos: 'M',
              grid: '3:4',
            },
          },
          {
            player: {
              id: 35695,
              name: 'D. Rodríguez',
              number: 15,
              pos: null,
              grid: '3:3',
            },
          },
          {
            player: {
              id: 6619,
              name: 'R. Loaiza',
              number: 30,
              pos: 'M',
              grid: '3:2',
            },
          },
          {
            player: {
              id: 5942,
              name: 'A. Castro',
              number: 11,
              pos: 'M',
              grid: '3:1',
            },
          },
          {
            player: {
              id: 5954,
              name: 'F. Márquez',
              number: 9,
              pos: 'F',
              grid: '4:2',
            },
          },
          {
            player: {
              id: 5952,
              name: 'N. Fernández',
              number: 29,
              pos: 'F',
              grid: '4:1',
            },
          },
        ],
        substitutes: [
          {
            player: {
              id: 5947,
              name: 'B. Merlini',
              number: 7,
              pos: 'M',
              grid: null,
            },
          },
          {
            player: {
              id: 6059,
              name: 'G. Mainero',
              number: 8,
              pos: 'M',
              grid: null,
            },
          },
          {
            player: {
              id: 70767,
              name: 'B. Ojeda',
              number: 26,
              pos: 'M',
              grid: null,
            },
          },
          {
            player: {
              id: 9515,
              name: 'M. Benítez',
              number: 3,
              pos: 'D',
              grid: null,
            },
          },
          {
            player: {
              id: 5929,
              name: 'N. Avellaneda',
              number: 17,
              pos: 'G',
              grid: null,
            },
          },
          {
            player: {
              id: 5943,
              name: 'F. Cerro',
              number: 18,
              pos: 'M',
              grid: null,
            },
          },
          {
            player: {
              id: 6433,
              name: 'G. Piovi',
              number: 16,
              pos: 'D',
              grid: null,
            },
          },
        ],
      },
    ],
    statistics: [
      {
        team: {
          id: 463,
          name: 'Aldosivi',
          logo: 'https://media.api-sports.io/football/teams/463.png',
        },
        statistics: [
          {
            type: 'Shots on Goal',
            value: 3,
          },
          {
            type: 'Shots off Goal',
            value: 2,
          },
          {
            type: 'Total Shots',
            value: 9,
          },
          {
            type: 'Blocked Shots',
            value: 4,
          },
          {
            type: 'Shots insidebox',
            value: 4,
          },
          {
            type: 'Shots outsidebox',
            value: 5,
          },
          {
            type: 'Fouls',
            value: 22,
          },
          {
            type: 'Corner Kicks',
            value: 3,
          },
          {
            type: 'Offsides',
            value: 1,
          },
          {
            type: 'Ball Possession',
            value: '32%',
          },
          {
            type: 'Yellow Cards',
            value: 5,
          },
          {
            type: 'Red Cards',
            value: 1,
          },
          {
            type: 'Goalkeeper Saves',
            value: 0,
          },
          {
            type: 'Total passes',
            value: 242,
          },
          {
            type: 'Passes accurate',
            value: 121,
          },
          {
            type: 'Passes %',
            value: '50%',
          },
        ],
      },
      {
        team: {
          id: 442,
          name: 'Defensa Y Justicia',
          logo: 'https://media.api-sports.io/football/teams/442.png',
        },
        statistics: [
          {
            type: 'Shots on Goal',
            value: 0,
          },
          {
            type: 'Shots off Goal',
            value: 3,
          },
          {
            type: 'Total Shots',
            value: 7,
          },
          {
            type: 'Blocked Shots',
            value: 4,
          },
          {
            type: 'Shots insidebox',
            value: 4,
          },
          {
            type: 'Shots outsidebox',
            value: 3,
          },
          {
            type: 'Fouls',
            value: 10,
          },
          {
            type: 'Corner Kicks',
            value: 5,
          },
          {
            type: 'Offsides',
            value: 9,
          },
          {
            type: 'Ball Possession',
            value: '68%',
          },
          {
            type: 'Yellow Cards',
            value: 5,
          },
          {
            type: 'Red Cards',
            value: 0,
          },
          {
            type: 'Goalkeeper Saves',
            value: 2,
          },
          {
            type: 'Total passes',
            value: 514,
          },
          {
            type: 'Passes accurate',
            value: 397,
          },
          {
            type: 'Passes %',
            value: '77%',
          },
        ],
      },
    ],
    players: [
      {
        team: {
          id: 463,
          name: 'Aldosivi',
          logo: 'https://media.api-sports.io/football/teams/463.png',
          update: '2020-05-13T18:19:45+00:00',
        },
        players: [
          {
            player: {
              id: 6258,
              name: 'Luciano Pocrnjic',
              photo: 'https://media.api-sports.io/football/players/6258.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 1,
                  position: 'G',
                  rating: '7.1',
                  captain: true,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: 0,
                },
                passes: {
                  total: 13,
                  key: 0,
                  accuracy: '44%',
                },
                tackles: {
                  total: null,
                  blocks: 0,
                  interceptions: 0,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 0,
                  success: 0,
                  past: null,
                },
                fouls: {
                  drawn: 0,
                  committed: 0,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: 0,
                },
              },
            ],
          },
          {
            player: {
              id: 6262,
              name: 'Emanuel Iñiguez',
              photo: 'https://media.api-sports.io/football/players/6262.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 21,
                  position: 'D',
                  rating: '7.0',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 1,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 8,
                  key: 1,
                  accuracy: '34%',
                },
                tackles: {
                  total: 3,
                  blocks: 0,
                  interceptions: 0,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 0,
                  success: 0,
                  past: 1,
                },
                fouls: {
                  drawn: 1,
                  committed: 1,
                },
                cards: {
                  yellow: 1,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 6261,
              name: 'Leonel Galeano',
              photo: 'https://media.api-sports.io/football/players/6261.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 6,
                  position: 'D',
                  rating: '7.6',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 9,
                  key: 0,
                  accuracy: '50%',
                },
                tackles: {
                  total: 3,
                  blocks: 3,
                  interceptions: 2,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 0,
                  success: 0,
                  past: 2,
                },
                fouls: {
                  drawn: 1,
                  committed: 0,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 52701,
              name: 'Marcos Miers',
              photo: 'https://media.api-sports.io/football/players/52701.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 19,
                  position: 'D',
                  rating: '7.2',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 6,
                  key: 0,
                  accuracy: '46%',
                },
                tackles: {
                  total: 1,
                  blocks: 1,
                  interceptions: 1,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 1,
                  success: 1,
                  past: null,
                },
                fouls: {
                  drawn: 0,
                  committed: 1,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 6268,
              name: 'Lucas Villalba',
              photo: 'https://media.api-sports.io/football/players/6268.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 23,
                  position: 'D',
                  rating: '7.0',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 2,
                  on: 1,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 5,
                  key: 1,
                  accuracy: '21%',
                },
                tackles: {
                  total: 1,
                  blocks: 0,
                  interceptions: 6,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 2,
                  success: 2,
                  past: 1,
                },
                fouls: {
                  drawn: 0,
                  committed: 3,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 6212,
              name: 'Leandro Maciel',
              photo: 'https://media.api-sports.io/football/players/6212.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 33,
                  position: 'M',
                  rating: '6.4',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 1,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 14,
                  key: 0,
                  accuracy: '60%',
                },
                tackles: {
                  total: null,
                  blocks: 0,
                  interceptions: 1,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 2,
                  success: 2,
                  past: 3,
                },
                fouls: {
                  drawn: 0,
                  committed: 1,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 6474,
              name: 'Gaston Gil Romero',
              photo: 'https://media.api-sports.io/football/players/6474.png',
            },
            statistics: [
              {
                games: {
                  minutes: 79,
                  number: 5,
                  position: 'M',
                  rating: '6.6',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 7,
                  key: 0,
                  accuracy: '38%',
                },
                tackles: {
                  total: 4,
                  blocks: 0,
                  interceptions: 1,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 2,
                  success: 0,
                  past: null,
                },
                fouls: {
                  drawn: 0,
                  committed: 5,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 6269,
              name: 'Federico Gino',
              photo: 'https://media.api-sports.io/football/players/6269.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 8,
                  position: 'M',
                  rating: '6.9',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 1,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 19,
                  key: 1,
                  accuracy: '65%',
                },
                tackles: {
                  total: 2,
                  blocks: 0,
                  interceptions: 2,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 3,
                  success: 2,
                  past: 1,
                },
                fouls: {
                  drawn: 1,
                  committed: 2,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 6093,
              name: 'Gonzalo Verón',
              photo: 'https://media.api-sports.io/football/players/6093.png',
            },
            statistics: [
              {
                games: {
                  minutes: 75,
                  number: 29,
                  position: 'F',
                  rating: '6.2',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 12,
                  key: 0,
                  accuracy: '66%',
                },
                tackles: {
                  total: null,
                  blocks: 0,
                  interceptions: 1,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 1,
                  success: 0,
                  past: 1,
                },
                fouls: {
                  drawn: 1,
                  committed: 2,
                },
                cards: {
                  yellow: 1,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 6126,
              name: 'Federico Andrada',
              photo: 'https://media.api-sports.io/football/players/6126.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 10,
                  position: 'F',
                  rating: '6.7',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 3,
                  on: 2,
                },
                goals: {
                  total: 1,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 11,
                  key: 0,
                  accuracy: '55%',
                },
                tackles: {
                  total: null,
                  blocks: 0,
                  interceptions: 0,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 1,
                  success: 1,
                  past: 2,
                },
                fouls: {
                  drawn: 2,
                  committed: 2,
                },
                cards: {
                  yellow: 1,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 6561,
              name: 'Nazareno Solis',
              photo: 'https://media.api-sports.io/football/players/6561.png',
            },
            statistics: [
              {
                games: {
                  minutes: 74,
                  number: 7,
                  position: 'F',
                  rating: '7.1',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 1,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 11,
                  key: 0,
                  accuracy: '61%',
                },
                tackles: {
                  total: 2,
                  blocks: 0,
                  interceptions: 1,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 1,
                  success: 1,
                  past: 1,
                },
                fouls: {
                  drawn: 1,
                  committed: 2,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 6396,
              name: 'Nicolás Bazzana',
              photo: 'https://media.api-sports.io/football/players/6396.png',
            },
            statistics: [
              {
                games: {
                  minutes: 15,
                  number: 27,
                  position: 'D',
                  rating: '6.5',
                  captain: false,
                  substitute: true,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 0,
                  key: 0,
                  accuracy: '0%',
                },
                tackles: {
                  total: null,
                  blocks: 0,
                  interceptions: 0,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 0,
                  success: 0,
                  past: null,
                },
                fouls: {
                  drawn: 0,
                  committed: 1,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 35845,
              name: 'Hernán Burbano',
              photo: 'https://media.api-sports.io/football/players/35845.png',
            },
            statistics: [
              {
                games: {
                  minutes: 15,
                  number: 11,
                  position: 'M',
                  rating: '3.7',
                  captain: false,
                  substitute: true,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 2,
                  key: 0,
                  accuracy: '40%',
                },
                tackles: {
                  total: null,
                  blocks: 0,
                  interceptions: 0,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 1,
                  success: 1,
                  past: null,
                },
                fouls: {
                  drawn: 2,
                  committed: 1,
                },
                cards: {
                  yellow: 2,
                  red: 1,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 6550,
              name: 'Francisco Grahl',
              photo: 'https://media.api-sports.io/football/players/6550.png',
            },
            statistics: [
              {
                games: {
                  minutes: 11,
                  number: 22,
                  position: 'M',
                  rating: '6.7',
                  captain: false,
                  substitute: true,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 4,
                  key: 0,
                  accuracy: '100%',
                },
                tackles: {
                  total: 2,
                  blocks: 0,
                  interceptions: 1,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 0,
                  success: 0,
                  past: null,
                },
                fouls: {
                  drawn: 0,
                  committed: 1,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
        ],
      },
      {
        team: {
          id: 442,
          name: 'Defensa Y Justicia',
          logo: 'https://media.api-sports.io/football/teams/442.png',
          update: '2020-05-13T18:19:45+00:00',
        },
        players: [
          {
            player: {
              id: 5932,
              name: 'Ezequiel Unsain',
              photo: 'https://media.api-sports.io/football/players/5932.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 22,
                  position: 'G',
                  rating: '6.7',
                  captain: true,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 1,
                  assists: null,
                  saves: 2,
                },
                passes: {
                  total: 39,
                  key: 0,
                  accuracy: '86%',
                },
                tackles: {
                  total: null,
                  blocks: 0,
                  interceptions: 0,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 0,
                  success: 0,
                  past: null,
                },
                fouls: {
                  drawn: 0,
                  committed: 0,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: 0,
                },
              },
            ],
          },
          {
            player: {
              id: 5936,
              name: 'Julio González',
              photo: 'https://media.api-sports.io/football/players/5936.png',
            },
            statistics: [
              {
                games: {
                  minutes: 79,
                  number: 4,
                  position: 'D',
                  rating: '6.2',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 22,
                  key: 0,
                  accuracy: '64%',
                },
                tackles: {
                  total: null,
                  blocks: 0,
                  interceptions: 1,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 1,
                  success: 1,
                  past: 1,
                },
                fouls: {
                  drawn: 2,
                  committed: 2,
                },
                cards: {
                  yellow: 1,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 6540,
              name: 'Juan Rodriguez',
              photo: 'https://media.api-sports.io/football/players/6540.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 28,
                  position: 'D',
                  rating: '7.0',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 45,
                  key: 0,
                  accuracy: '73%',
                },
                tackles: {
                  total: 3,
                  blocks: 0,
                  interceptions: 3,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 2,
                  success: 2,
                  past: 1,
                },
                fouls: {
                  drawn: 1,
                  committed: 2,
                },
                cards: {
                  yellow: 1,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 5991,
              name: 'Héctor Martínez',
              photo: 'https://media.api-sports.io/football/players/5991.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 21,
                  position: 'D',
                  rating: '7.0',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 76,
                  key: 0,
                  accuracy: '80%',
                },
                tackles: {
                  total: 2,
                  blocks: 0,
                  interceptions: 0,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 0,
                  success: 0,
                  past: null,
                },
                fouls: {
                  drawn: 1,
                  committed: 0,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 5935,
              name: 'Rafael Delgado',
              photo: 'https://media.api-sports.io/football/players/5935.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 33,
                  position: 'D',
                  rating: '7.1',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 37,
                  key: 1,
                  accuracy: '74%',
                },
                tackles: {
                  total: null,
                  blocks: 0,
                  interceptions: 2,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 5,
                  success: 3,
                  past: null,
                },
                fouls: {
                  drawn: 2,
                  committed: 1,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 5942,
              name: 'Alexis Castro',
              photo: 'https://media.api-sports.io/football/players/5942.png',
            },
            statistics: [
              {
                games: {
                  minutes: 73,
                  number: 11,
                  position: 'M',
                  rating: '6.4',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 9,
                  key: 0,
                  accuracy: '50%',
                },
                tackles: {
                  total: null,
                  blocks: 0,
                  interceptions: 1,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 3,
                  success: 1,
                  past: 2,
                },
                fouls: {
                  drawn: 3,
                  committed: 0,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 5931,
              name: 'Diego Rodríguez',
              photo: 'https://media.api-sports.io/football/players/5931.png',
            },
            statistics: [
              {
                games: {
                  minutes: 45,
                  number: 15,
                  position: 'M',
                  rating: '6.3',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 18,
                  key: 0,
                  accuracy: '94%',
                },
                tackles: {
                  total: null,
                  blocks: 1,
                  interceptions: 0,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 0,
                  success: 0,
                  past: null,
                },
                fouls: {
                  drawn: 0,
                  committed: 1,
                },
                cards: {
                  yellow: 1,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 6619,
              name: 'Raul Loaiza',
              photo: 'https://media.api-sports.io/football/players/6619.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 30,
                  position: 'M',
                  rating: '6.8',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 53,
                  key: 0,
                  accuracy: '85%',
                },
                tackles: {
                  total: 1,
                  blocks: 1,
                  interceptions: 0,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 0,
                  success: 0,
                  past: 1,
                },
                fouls: {
                  drawn: 1,
                  committed: 0,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 5912,
              name: 'Neri Cardozo',
              photo: 'https://media.api-sports.io/football/players/5912.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 10,
                  position: 'M',
                  rating: '7.3',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 47,
                  key: 0,
                  accuracy: '81%',
                },
                tackles: {
                  total: 3,
                  blocks: 0,
                  interceptions: 1,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 1,
                  success: 1,
                  past: 1,
                },
                fouls: {
                  drawn: 0,
                  committed: 1,
                },
                cards: {
                  yellow: 1,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 5954,
              name: 'Fernando Márquez',
              photo: 'https://media.api-sports.io/football/players/5954.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 9,
                  position: 'F',
                  rating: '5.8',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 4,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 14,
                  key: 1,
                  accuracy: '60%',
                },
                tackles: {
                  total: null,
                  blocks: 1,
                  interceptions: 1,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 2,
                  success: 1,
                  past: 3,
                },
                fouls: {
                  drawn: 1,
                  committed: 2,
                },
                cards: {
                  yellow: 1,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 5952,
              name: 'Nicolás Fernández',
              photo: 'https://media.api-sports.io/football/players/5952.png',
            },
            statistics: [
              {
                games: {
                  minutes: 90,
                  number: 29,
                  position: 'F',
                  rating: '6.5',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 2,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 6,
                  key: 1,
                  accuracy: '46%',
                },
                tackles: {
                  total: 1,
                  blocks: 0,
                  interceptions: 1,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 5,
                  success: 1,
                  past: 1,
                },
                fouls: {
                  drawn: 4,
                  committed: 0,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 70767,
              name: 'Braian Ojeda',
              photo: 'https://media.api-sports.io/football/players/70767.png',
            },
            statistics: [
              {
                games: {
                  minutes: 11,
                  number: 26,
                  position: 'M',
                  rating: '6.4',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 6,
                  key: 0,
                  accuracy: '66%',
                },
                tackles: {
                  total: null,
                  blocks: 0,
                  interceptions: 0,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 1,
                  success: 0,
                  past: null,
                },
                fouls: {
                  drawn: 1,
                  committed: 0,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 5947,
              name: 'Bautista Merlini',
              photo: 'https://media.api-sports.io/football/players/5947.png',
            },
            statistics: [
              {
                games: {
                  minutes: 45,
                  number: 7,
                  position: 'M',
                  rating: '6.8',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 1,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 18,
                  key: 0,
                  accuracy: '100%',
                },
                tackles: {
                  total: null,
                  blocks: 0,
                  interceptions: 0,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 1,
                  success: 1,
                  past: null,
                },
                fouls: {
                  drawn: 3,
                  committed: 1,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
          {
            player: {
              id: 6059,
              name: 'Guido Mainero',
              photo: 'https://media.api-sports.io/football/players/6059.png',
            },
            statistics: [
              {
                games: {
                  minutes: 17,
                  number: 8,
                  position: 'M',
                  rating: '7.1',
                  captain: false,
                  substitute: false,
                },
                offsides: null,
                shots: {
                  total: 0,
                  on: 0,
                },
                goals: {
                  total: null,
                  conceded: 0,
                  assists: null,
                  saves: null,
                },
                passes: {
                  total: 7,
                  key: 1,
                  accuracy: '77%',
                },
                tackles: {
                  total: null,
                  blocks: 0,
                  interceptions: 0,
                },
                duels: {
                  total: null,
                  won: null,
                },
                dribbles: {
                  attempts: 2,
                  success: 1,
                  past: null,
                },
                fouls: {
                  drawn: 2,
                  committed: 0,
                },
                cards: {
                  yellow: 0,
                  red: 0,
                },
                penalty: {
                  won: null,
                  commited: null,
                  scored: 0,
                  missed: 0,
                  saved: null,
                },
              },
            ],
          },
        ],
      },
    ],
  };
}
