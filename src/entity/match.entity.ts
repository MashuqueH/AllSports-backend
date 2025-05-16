import {
  EventDTO,
  FixtureDTO,
  LeagueDTO,
  ScoreDTO,
  Team,
} from 'src/dto/match.dto';

export interface Statistic {
  name: string;
  home: number;
  away: number;
  isPercentage?: boolean;
}

export interface MatchEvents {
  timestamp: string;
  home?: EventDTO;
  away?: EventDTO;
}

export interface Player {
  player: {
    id: number;
    name: string;
    number?: number;
    pos?: string;
  };
}

export interface Lineup {
  team: Team;
  formation: string;
  coach: {
    id: number;
    name: string;
    photo: string;
  };
  startXI: Player[];
  substitutes?: Player[];
}

export interface Lineups {
  home: Lineup;
  away: Lineup;
}

export interface Match {
  fixture: FixtureDTO;
  league: LeagueDTO;
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number;
    away: number;
  };
  score: ScoreDTO;
  events?: MatchEvents[];
  lineups?: Lineups;
  statistics?: Statistic[];
  players?: {
    team: Team;
    players: { player: Player[]; statistics: any[] };
  };
}
