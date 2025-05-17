import { Injectable } from '@nestjs/common';
import { CreateLeagueDto } from './dto/create-league.dto';
import { UpdateLeagueDto } from './dto/update-league.dto';
import { League } from './entities/league.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { Standings } from 'src/types/standing';

@Injectable()
export class LeagueService {
  constructor(
    @InjectRepository(League)
    private readonly leagueRepository: Repository<League>,
    private httpService: HttpService,
  ) {}

  public getLeagueData(
    id: number,
    season = 2023,
  ): Observable<AxiosResponse<{ response: Standings[] }>> {
    return this.httpService.get(
      `https://v3.football.api-sports.io/standings?league=${id}&season=${season}`,
      {
        headers: {
          'x-rapidapi-key': process.env.API_KEY,
        },
      },
    );
  }

  create(createLeagueDto: CreateLeagueDto) {
    return this.leagueRepository.save(createLeagueDto);
  }

  findAll() {
    return this.leagueRepository.find({
      relations: {
        standings: {
          team: true,
        },
      },
    });
  }

  findOne(id: number, season: number) {
    return this.leagueRepository.findOne({
      where: {
        id,
        season,
      },
      relations: {
        standings: {
          team: true,
        },
      },
    });
  }

  update(id: number, updateLeagueDto: UpdateLeagueDto) {
    return this.leagueRepository.update('' + updateLeagueDto.id, {
      ...updateLeagueDto,
    });
  }

  remove(id: number) {
    return this.leagueRepository.delete(id);
  }
}
