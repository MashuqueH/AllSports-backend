import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotAcceptableException,
  Query,
} from '@nestjs/common';
import { LeagueService } from './league.service';
import { UpdateLeagueDto } from './dto/update-league.dto';
import { firstValueFrom } from 'rxjs';

@Controller('league')
export class LeagueController {
  constructor(private readonly leagueService: LeagueService) {}

  @Post()
  async create(@Body() createLeagueDto: { id: number; season: number }) {
    console.log(createLeagueDto);
    const existing = await this.leagueService.findOne(
      createLeagueDto.id,
      createLeagueDto.season,
    );

    console.log(existing);

    if (existing) {
      return existing;
    }

    const { data } = await firstValueFrom(
      this.leagueService.getLeagueData(
        createLeagueDto.id,
        createLeagueDto.season,
      ),
    );

    if (data?.response && data.response.length > 0) {
      const { ...league } = data.response[0].league;

      return this.leagueService.create({
        ...league,
        standings: league?.standings.length ? league.standings[0] : [],
      });
    }

    throw new NotAcceptableException();
  }

  @Get()
  findAll() {
    return this.leagueService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('season') season: string = '2023',
  ) {
    const existing = await this.leagueService.findOne(+id, +season);

    if (existing) {
      return existing;
    }

    const { data } = await firstValueFrom(
      this.leagueService.getLeagueData(+id, +season),
    );

    if (data?.response && data.response.length > 0) {
      const { ...league } = data.response[0].league;

      return this.leagueService.create({
        ...league,
        standings: league?.standings.length ? league.standings[0] : [],
      });
    }

    throw new NotAcceptableException();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeagueDto: UpdateLeagueDto) {
    return this.leagueService.update(+id, updateLeagueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leagueService.remove(+id);
  }
}
