import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  userId: number;
}
