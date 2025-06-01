import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { Standings } from './standings.entity';

@Entity()
export class League {
  @ObjectIdColumn()
  _id: string;

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
  @Column(() => Standings)
  standings: Standings[];
}
