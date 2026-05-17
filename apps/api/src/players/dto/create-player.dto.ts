import {
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PlayerPosition } from '../interfaces/players.interface';

export class CreatePlayerDto {
  @IsString({ message: 'O nome deve ser uma string válida.' })
  name: string;

  @IsInt({ message: 'O número deve ser um número inteiro.' })
  @Min(1, { message: 'O número deve ser maior que 0' })
  @Max(99, { message: 'O número deve ser menor que 100' })
  @Type(() => Number)
  number: number;

  @IsEnum(PlayerPosition, { message: 'A posição deve ser uma das seguintes: GOALKEEPER, DEFENDER, MIDFIELDER, FORWARD' })
  @IsNotEmpty()
  position: PlayerPosition;

  @IsOptional()
  @IsUrl({}, { message: 'A URL da foto deve ser um endereço válido' })
  photoUrl?: string;
}