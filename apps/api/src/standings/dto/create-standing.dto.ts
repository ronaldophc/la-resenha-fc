import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStandingDto {
  @ApiProperty({
    description: 'ID do campeonato associado',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: 'O ID do campeonato é obrigatório.' })
  @Type(() => Number)
  championshipId: number;

  @ApiProperty({
    description: 'ID do time associado',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: 'O ID do time é obrigatório.' })
  @Type(() => Number)
  teamId: number;

  @ApiProperty({
    description: 'Posição na tabela de classificação',
    example: 1,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  position: number;

  @ApiProperty({
    description: 'Pontos ganhos',
    example: 15,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  points: number;

  @ApiProperty({
    description: 'Partidas jogadas',
    example: 6,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  played: number;

  @ApiProperty({
    description: 'Vitórias',
    example: 5,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  won: number;

  @ApiProperty({
    description: 'Empates',
    example: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  drawn: number;

  @ApiProperty({
    description: 'Derrotas',
    example: 1,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  lost: number;

  @ApiProperty({
    description: 'Gols marcados (pró)',
    example: 18,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  goalsFor: number;

  @ApiProperty({
    description: 'Gols sofridos (contra)',
    example: 4,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  goalsAgainst: number;
}
