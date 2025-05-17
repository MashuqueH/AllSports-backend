import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Standings } from './standings.entity';

@Entity()
export class League {
  @PrimaryGeneratedColumn()
  league_id: number;

  @Column()
  id: number;
  @Column()
  name: string;
  @Column()
  country: string;
  @Column()
  logo: string;
  @Column()
  flag: string;
  @Column()
  season: number;
  @OneToMany(() => Standings, (standing) => standing.league, { cascade: true })
  standings: Standings[];
}
