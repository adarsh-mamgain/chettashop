import { Expose } from 'class-transformer';

export class TeamDto {
  @Expose()
  teamId: number;

  @Expose()
  name: string;

  @Expose()
  owner: number;
}
