import { Expose } from 'class-transformer';

export class ShowDto {
  @Expose()
  userId: number;

  @Expose()
  email: string;
}
