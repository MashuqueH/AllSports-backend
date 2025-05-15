export interface Statistic {
  name: string;
  home: number;
  away: number;
  isPercentage?: boolean;
}

export interface MatchEvents {
  timestamp: string;
  home?: MatchEvent;
  away?: MatchEvent;
}

export interface MatchEvent {
  player: {
    id: number;
    name: string;
  };
  assist?: {
    id: number;
    name: string;
  };
  type: string;
  detail: string;
  team: Team;
  comments?: string;
  time: {
    elapsed: number;
    extra: number;
  };
}

export interface Player {
  player: {
    id: number;
    name: string;
    number?: number;
    pos?: string;
  };
}

export interface Colors {
  primary: string;
  number: string;
  border: string;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
  colors?: Colors;
  update?: string;
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

export interface Fixture {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    periods: Record<string, number>;
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number;
      extra: number;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
    standing?: boolean;
  };
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number;
    away: number;
  };
  score?: {
    [key: string]: {
      home: number;
      away: number;
    };
  };
  events?: MatchEvents[];
  lineups?: Lineups;
  statistics?: Statistic[];
  players?: {
    team: Team;
    players: { player: Player[]; statistics: any[] };
  };
}
