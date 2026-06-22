import { IsString, IsInt, Min, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMatchDto {
  @IsDateString({}, { message: 'A data deve ser uma string de data válida (ISO 8601).' })
  @IsNotEmpty({ message: 'A data é obrigatória.' })
  date: string;

  @IsString({ message: 'O adversário deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O adversário é obrigatório.' })
  opponent: string;

  @IsString({ message: 'O local deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O local é obrigatório.' })
  location: string;

  @IsInt({ message: 'O placar do time da casa deve ser um número inteiro.' })
  @Min(0, { message: 'O placar do time da casa não pode ser negativo.' })
  @Type(() => Number)
  homeScore: number;

  @IsInt({ message: 'O placar do adversário deve ser um número inteiro.' })
  @Min(0, { message: 'O placar do adversário não pode ser negativo.' })
  @Type(() => Number)
  awayScore: number;

  @IsOptional()
  @IsString({ message: 'O campeonato deve ser uma string válida.' })
  championship?: string;
}
