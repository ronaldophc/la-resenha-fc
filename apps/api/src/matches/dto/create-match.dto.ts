import { IsString, IsInt, Min, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMatchDto {
  @ApiProperty({
    description: 'Data e hora da partida no formato ISO 8601',
    example: '2026-06-22T21:00:00.000Z',
  })
  @IsDateString({}, { message: 'A data deve ser uma string de data válida (ISO 8601).' })
  @IsNotEmpty({ message: 'A data é obrigatória.' })
  date: string;

  @ApiProperty({
    description: 'Nome do time adversário',
    example: 'Tabajara FC',
  })
  @IsString({ message: 'O adversário deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O adversário é obrigatório.' })
  opponent: string;

  @ApiProperty({
    description: 'Local onde a partida será realizada',
    example: 'Estádio Pinheirão',
  })
  @IsString({ message: 'O local deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O local é obrigatório.' })
  location: string;

  @ApiProperty({
    description: 'Placar do time da casa (La Resenha FC)',
    example: 3,
    minimum: 0,
  })
  @IsInt({ message: 'O placar do time da casa deve ser um número inteiro.' })
  @Min(0, { message: 'O placar do time da casa não pode ser negativo.' })
  @Type(() => Number)
  homeScore: number;

  @ApiProperty({
    description: 'Placar do time visitante (Adversário)',
    example: 1,
    minimum: 0,
  })
  @IsInt({ message: 'O placar do adversário deve ser um número inteiro.' })
  @Min(0, { message: 'O placar do adversário não pode ser negativo.' })
  @Type(() => Number)
  awayScore: number;

  @ApiProperty({
    description: 'ID do campeonato associado',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'O ID do campeonato deve ser um número inteiro.' })
  @Type(() => Number)
  championshipId?: number;
}
