import {
  EventDTO,
  FixtureDTO,
  LeagueDTO,
  Lineup,
  MatchDTO,
  PlayersDto,
  ScoreDTO,
  StatisticsDTO,
  TeamsDTO,
} from 'src/types/match.dto';

export class CreateMatchDto implements MatchDTO {
  fixture: FixtureDTO;
  league: LeagueDTO;
  teams: TeamsDTO;
  goals: TeamsDTO;
  score: ScoreDTO;
  events?: EventDTO[];
  lineups?: Lineup[];
  statistics?: StatisticsDTO[];
  players?: PlayersDto[];
}
