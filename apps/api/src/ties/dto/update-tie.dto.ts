import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TieLegDto {
  @ApiProperty({ description: 'Data e hora do jogo (ISO 8601)', required: false, nullable: true })
  @IsOptional()
  @IsDateString()
  date?: string | null;

  @ApiProperty({ description: 'Local do jogo', required: false, nullable: true })
  @IsOptional()
  @IsString()
  location?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  homeScore?: number | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  awayScore?: number | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  homePenalties?: number | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  awayPenalties?: number | null;
}

export class UpdateTieDto {
  @ApiProperty({ description: 'Time mandante (só na fase inicial)', required: false, nullable: true })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  homeTeamId?: number | null;

  @ApiProperty({ description: 'Time visitante (só na fase inicial)', required: false, nullable: true })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  awayTeamId?: number | null;

  @ApiProperty({ description: 'Placares dos jogos do confronto (1 ou 2, conforme o campeonato)', type: [TieLegDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TieLegDto)
  legs?: TieLegDto[];
}
