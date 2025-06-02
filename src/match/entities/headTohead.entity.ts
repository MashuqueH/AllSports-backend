import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Match } from './match.entity';

Entity();
export class HeadToHead {
  @ObjectIdColumn()
  _id: number;

  @Column()
  h2h: string;

  @Column(() => Match)
  matches: Match[];
}
