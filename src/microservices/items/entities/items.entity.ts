import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  itemId: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  quantity: number;

  @AfterInsert()
  logInsert() {
    console.log('Inserted Item with id', this.itemId);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated Item with id', this.itemId);
  }

  @AfterRemove()
  logRemove() {
    console.log('Removed Item with id', this.itemId);
  }
}
