import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './items.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ItemsService {
  constructor(@InjectRepository(Item) private repo: Repository<Item>) {}

  async create(name: string, price: number, quantity: number) {
    const item = await this.repo
      .createQueryBuilder()
      .insert()
      .values({ name, price, quantity })
      .returning('*')
      .execute();

    return item.raw[0];
  }

  findAll() {
    return this.repo.createQueryBuilder().getMany();
  }

  async findOne(itemId: number) {
    return this.repo
      .createQueryBuilder('item')
      .where('item.itemId = :itemId', { itemId })
      .getOne();
  }

  async update(id: number, attrs: Partial<Item>) {
    const result = await this.repo
      .createQueryBuilder()
      .update()
      .set(attrs)
      .where('itemId = :id', { id })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  async remove(id: number) {
    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .where('itemId = :id', { id })
      .returning('*')
      .execute();

    return result.raw[0];
  }
}
