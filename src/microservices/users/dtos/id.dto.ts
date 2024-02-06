import { Expose } from 'class-transformer';

export class IdDto {
  @Expose()
  userId: number;
}
