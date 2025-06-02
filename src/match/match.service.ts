import { Injectable } from '@nestjs/common';
import { UpdateMatchDto } from './dto/update-match.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { EventDTO, MatchDTO, StatisticsDTO } from 'src/types/match.dto';
import { Observable } from 'rxjs';
import { MatchEvents, Statistic } from 'src/entity/match.entity';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private httpService: HttpService,
  ) {}

  public getMatchData(
    id: number,
  ): Observable<AxiosResponse<{ response: MatchDTO[] }>> {
    return this.httpService.get(
      `https://v3.football.api-sports.io/fixtures?id=${id}`,
      {
        headers: {
          'x-rapidapi-key': process.env.API_KEY,
        },
      },
    );
  }

  create(createMatchDto: Match) {
    return this.matchRepository.save(createMatchDto);
  }

  findOne(id: number) {
    return this.matchRepository.manager.getMongoRepository(Match).findOne({
      where: {
        'fixture.id': id,
      },
    });
  }

  update(id: number, updateMatchDto: UpdateMatchDto) {
    return `This action updates a #${id} match`;
  }

  remove(id: number) {
    return `This action removes a #${id} match`;
  }

  public formatEvents(
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

  public formatStatistics(data: StatisticsDTO[]): Statistic[] {
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
