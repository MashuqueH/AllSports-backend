import { Lineups, MatchEvents, Statistic } from 'src/entity/match.entity';
import {
  FixtureDTO,
  LeagueDTO,
  PlayersDto,
  ScoreDTO,
  Team,
  TeamsDTO,
} from 'src/types/match.dto';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity()
export class Match {
  @ObjectIdColumn()
  _id: number;

  @Column()
  fixture: FixtureDTO;

  @Column()
  league: LeagueDTO;

  @Column()
  teams: {
    home: Team;
    away: Team;
  };

  @Column({ nullable: true })
  goals: TeamsDTO;

  @Column({ nullable: true })
  score: ScoreDTO;
  @Column({ nullable: true })
  events?: MatchEvents[];
  @Column({ nullable: true })
  lineups?: Lineups;
  @Column({ nullable: true })
  statistics?: Statistic[];
  @Column({ nullable: true })
  players?: PlayersDto[];
}
