import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsBoolean()
  admin: boolean;

  @IsNumber()
  @IsOptional()
  participant: number;

  @IsNumber()
  @IsOptional()
  owner: number;
}
