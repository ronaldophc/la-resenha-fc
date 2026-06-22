import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateStandingDto {
  @ApiProperty({
    description: 'Nome do campeonato',
    example: 'Liga Amadora de Futebol 2026',
  })
  @IsString()
  @IsNotEmpty()
  championship: string;

  @ApiProperty({
    description: 'Posição na tabela de classificação',
    example: 1,
  })
  @IsInt()
  @Min(0)
  position: number;

  @ApiProperty({
    description: 'Pontos ganhos',
    example: 15,
  })
  @IsInt()
  @Min(0)
  points: number;

  @ApiProperty({
    description: 'Partidas jogadas',
    example: 6,
  })
  @IsInt()
  @Min(0)
  played: number;

  @ApiProperty({
    description: 'Vitórias',
    example: 5,
  })
  @IsInt()
  @Min(0)
  won: number;

  @ApiProperty({
    description: 'Empates',
    example: 0,
  })
  @IsInt()
  @Min(0)
  drawn: number;

  @ApiProperty({
    description: 'Derrotas',
    example: 1,
  })
  @IsInt()
  @Min(0)
  lost: number;

  @ApiProperty({
    description: 'Gols marcados (pró)',
    example: 18,
  })
  @IsInt()
  @Min(0)
  goalsFor: number;

  @ApiProperty({
    description: 'Gols sofridos (contra)',
    example: 4,
  })
  @IsInt()
  @Min(0)
  goalsAgainst: number;
}
