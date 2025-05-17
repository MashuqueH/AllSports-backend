import { Standing } from 'src/types/standing';

export class CreateLeagueDto {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
  standings?: Standing[];
}
