import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  userId: number;

  @Expose()
  email: string;

  @Expose()
  admin: boolean;
}
