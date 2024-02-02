import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// export enum UserRole {
//   SHOPKEEPER = 'shopkeeper',
//   CUSTOMER = 'customer',
// }

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

  // @Column({
  //   type: 'enum',
  //   enum: UserRole,
  //   default: UserRole.CUSTOMER,
  // })
  // type: UserRole;

  // @OneToMany(() => Report, (report) => report.user)
  // reports: Report[];

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
