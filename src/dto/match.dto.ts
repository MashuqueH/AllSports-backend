export interface MatchDTO {
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

export interface EventDTO {
  time: Time;
  team: Team;
  player: Assist;
  assist: Assist;
  type: string;
  detail: string;
  comments: null;
}

export interface Assist {
  id: number | null;
  name: null | string;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
  colors?: null;
  update?: Date;
  winner?: boolean;
}

export interface Time {
  elapsed: number;
  extra: null;
}

export interface FixtureDTO {
  id: number;
  referee: string;
  timezone: string;
  date: Date;
  timestamp: number;
  periods: Periods;
  venue: Venue;
  status: Status;
}

export interface Periods {
  first: number;
  second: number;
}

export interface Status {
  long: string;
  short: string;
  elapsed: number;
  extra: null;
}

export interface Venue {
  id: number;
  name: string;
  city: string;
}

export interface TeamsDTO {
  home: Team;
  away: Team;
}

export interface LeagueDTO {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
  round: string;
  standings: boolean;
}

export interface Lineup {
  team: Team;
  coach: Player;
  formation: string;
  startXI: StartXi[];
  substitutes: StartXi[];
}

export interface Player {
  id: number;
  name: string;
  photo: string;
}

export interface StartXi {
  player: StartXIPlayer;
}

export interface StartXIPlayer {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid: null | string;
}

export interface PlayersDto {
  team: Team;
  players: PlayerPlayer[];
}

export interface PlayerPlayer {
  player: Player;
  statistics: PlayerStatistic[];
}

export interface PlayerStatistic {
  games: Games;
  offsides: null;
  shots: Shots;
  goals: StatisticGoals;
  passes: Passes;
  tackles: Tackles;
  duels: Duels;
  dribbles: Dribbles;
  fouls: Fouls;
  cards: Cards;
  penalty: Penalty;
}

export interface Cards {
  yellow: number;
  red: number;
}

export interface Dribbles {
  attempts: number;
  success: number;
  past: number | null;
}

export interface Duels {
  total: null;
  won: null;
}

export interface Fouls {
  drawn: number;
  committed: number;
}

export interface Games {
  minutes: number;
  number: number;
  position: string;
  rating: string;
  captain: boolean;
  substitute: boolean;
}

export interface StatisticGoals {
  total: number | null;
  conceded: number;
  assists: null;
  saves: number | null;
}

export interface Passes {
  total: number;
  key: number;
  accuracy: string;
}

export interface Penalty {
  won: null;
  commited: null;
  scored: number;
  missed: number;
  saved: number;
}

export interface Shots {
  total: number;
  on: number;
}

export interface Tackles {
  total: number;
  blocks: number;
  interceptions: number;
}

export interface ScoreDTO {
  halftime: TeamsDTO;
  fulltime: TeamsDTO;
  extratime: TeamsDTO;
  penalty: TeamsDTO;
}

export interface StatisticsDTO {
  team: Team;
  statistics: Statistic[];
}

export interface Statistic {
  type: string;
  value: number | string;
}
