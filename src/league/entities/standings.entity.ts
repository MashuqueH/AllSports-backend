import { Column, Entity } from 'typeorm';
import { Statistics, Team } from 'src/types/standing';

@Entity()
export class Standings {
  @Column()
  rank: number;
  @Column()
  team: Team;
  @Column()
  points: number;
  @Column()
  goalsDiff: number;
  @Column()
  group: string;
  @Column()
  form: string;
  @Column()
  status: string;
  @Column({ nullable: true })
  description: string;
  @Column()
  all: Statistics;
  @Column()
  home: Statistics;
  @Column()
  away: Statistics;
  @Column()
  update: string;
}
