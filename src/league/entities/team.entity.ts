import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Standings } from './standings.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  team_id: number;

  @Column()
  id: number;
  @Column()
  name: string;
  @Column()
  logo: string;
  @Column({ nullable: true })
  update?: Date;
  @Column({ nullable: true })
  winner?: boolean;

  @OneToMany(() => Standings, (standings) => standings.team)
  standings?: Standings;
}
