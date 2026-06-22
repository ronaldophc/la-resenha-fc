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
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlayerDto {
  @ApiProperty({
    description: 'Nome completo do jogador',
    example: 'Neymar da Silva',
  })
  @IsString({ message: 'O nome deve ser uma string válida.' })
  name: string;

  @ApiProperty({
    description: 'Número da camisa do jogador',
    example: 10,
    minimum: 1,
    maximum: 99,
  })
  @IsInt({ message: 'O número deve ser um número inteiro.' })
  @Min(1, { message: 'O número deve ser maior que 0' })
  @Max(99, { message: 'O número deve ser menor que 100' })
  @Type(() => Number)
  number: number;

  @ApiProperty({
    description: 'Posição tática do jogador',
    enum: PlayerPosition,
    example: PlayerPosition.FORWARD,
  })
  @IsEnum(PlayerPosition, { message: 'A posição deve ser uma das seguintes: GOALKEEPER, DEFENDER, MIDFIELDER, FORWARD' })
  @IsNotEmpty()
  position: PlayerPosition;

  @ApiProperty({
    description: 'URL para a foto do jogador',
    example: 'https://exemplo.com/fotos/neymar.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'A URL da foto deve ser um endereço válido' })
  photoUrl?: string;
}