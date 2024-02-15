import { User } from 'src/microservices/users';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  teamId: number;

  @Column()
  name: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'ownerId', referencedColumnName: 'userId' })
  ownerId: number;

  @AfterInsert()
  logInsert() {
    console.log('Inserted Item with id', this.teamId);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated Item with id', this.teamId);
  }

  @AfterRemove()
  logRemove() {
    console.log('Removed Item with id', this.teamId);
  }
}
