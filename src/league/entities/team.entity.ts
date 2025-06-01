import { Column, Entity } from 'typeorm';

@Entity()
export class Team {
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
}
