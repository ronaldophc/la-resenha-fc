import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TIEBREAKER_CRITERIA } from '../../standings/standings-calculator';

export class CreateChampionshipDto {
  @ApiProperty({
    description: 'Nome do campeonato',
    example: 'Copa Várzea Curitiba 2026',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome do campeonato é obrigatório.' })
  name: string;

  @ApiProperty({
    description: 'URL do logo do campeonato',
    example: 'https://exemplo.com/logo-champ.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({
    description: 'Pontos por vitória',
    example: 3,
    default: 3,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Pontos por vitória deve ser um número inteiro.' })
  @Min(0, { message: 'Pontos por vitória não pode ser negativo.' })
  @Type(() => Number)
  pointsPerWin?: number;

  @ApiProperty({
    description: 'Pontos por empate',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Pontos por empate deve ser um número inteiro.' })
  @Min(0, { message: 'Pontos por empate não pode ser negativo.' })
  @Type(() => Number)
  pointsPerDraw?: number;

  @ApiProperty({
    description: 'Pontos por derrota',
    example: 0,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Pontos por derrota deve ser um número inteiro.' })
  @Min(0, { message: 'Pontos por derrota não pode ser negativo.' })
  @Type(() => Number)
  pointsPerLoss?: number;

  @ApiProperty({
    description:
      'Critérios de desempate, em ordem de aplicação (pontos é sempre o primeiro critério, implícito).',
    example: ['wins', 'goalDiff', 'goalsFor', 'headToHead'],
    enum: TIEBREAKER_CRITERIA,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Os critérios de desempate devem ser uma lista.' })
  @IsIn(TIEBREAKER_CRITERIA as unknown as string[], {
    each: true,
    message: `Critério de desempate inválido. Válidos: ${TIEBREAKER_CRITERIA.join(', ')}.`,
  })
  tiebreakers?: string[];
}
