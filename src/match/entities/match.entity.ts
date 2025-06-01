import { Lineups, MatchEvents, Statistic } from 'src/entity/match.entity';
import {
  FixtureDTO,
  LeagueDTO,
  PlayersDto,
  ScoreDTO,
  Team,
  TeamsDTO,
} from 'src/types/match.dto';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Match {
  @PrimaryColumn()
  match_id: number;

  @Column('simple-json')
  fixture: FixtureDTO;

  @Column('simple-json')
  league: LeagueDTO;

  @Column('simple-json')
  teams: {
    home: Team;
    away: Team;
  };

  @Column('simple-json', { nullable: true })
  goals: TeamsDTO;

  @Column('simple-json', { nullable: true })
  score: ScoreDTO;
  @Column('simple-json', { nullable: true })
  events?: MatchEvents[];
  @Column('simple-json', { nullable: true })
  lineups?: Lineups;
  @Column('simple-json', { nullable: true })
  statistics?: Statistic[];
  @Column('simple-json', { nullable: true })
  players?: PlayersDto[];
}
