import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  ownerId: number;
}
