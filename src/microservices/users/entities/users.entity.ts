import { Team } from 'src/microservices/teams';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  admin: boolean;

  @ManyToOne(() => Team, { eager: true })
  @JoinColumn({ name: 'teamId', referencedColumnName: 'teamId' })
  teamId: number;

  @AfterInsert()
  logInsert() {
    console.log('Inserted User with id', this.userId);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated User with id', this.userId);
  }

  @AfterRemove()
  logRemove() {
    console.log('Removed User with id', this.userId);
  }
}
