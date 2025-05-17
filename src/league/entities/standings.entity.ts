import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { League } from './league.entity';
import { Statistics } from 'src/types/standing';
import { Team } from './team.entity';

@Entity()
export class Standings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rank: number;
  @OneToOne(() => Team, (team) => team.team_id, { cascade: true })
  @JoinColumn()
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
  @Column('simple-json')
  all: Statistics;
  @Column('simple-json')
  home: Statistics;
  @Column('simple-json')
  away: Statistics;
  @Column()
  update: string;

  @ManyToOne(() => League, (league) => league.standings)
  league: League;
}
