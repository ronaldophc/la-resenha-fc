import { IsString, IsInt, Min, IsNotEmpty, IsOptional, IsDateString, MaxLength } from 'class-validator';
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
    description: 'ID do time mandante. Obrigatório em partidas de campeonato.',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'O ID do time mandante deve ser um número inteiro.' })
  @Type(() => Number)
  homeTeamId?: number;

  @ApiProperty({
    description: 'ID do time visitante. Obrigatório em partidas de campeonato.',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'O ID do time visitante deve ser um número inteiro.' })
  @Type(() => Number)
  awayTeamId?: number;

  @ApiProperty({
    description:
      'Nome textual do adversário (legado/amistosos sem time cadastrado). Ignorado quando os times são informados por ID.',
    example: 'Tabajara FC',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O adversário deve ser uma string válida.' })
  opponent?: string;

  @ApiProperty({
    description: 'Local onde a partida será realizada',
    example: 'Estádio Pinheirão',
  })
  @IsString({ message: 'O local deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O local é obrigatório.' })
  location: string;

  @ApiProperty({
    description: 'Gols do mandante. Omitir (ou null) para partida ainda não realizada.',
    example: 3,
    minimum: 0,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'O placar do mandante deve ser um número inteiro.' })
  @Min(0, { message: 'O placar do mandante não pode ser negativo.' })
  @Type(() => Number)
  homeScore?: number | null;

  @ApiProperty({
    description: 'Gols do visitante. Omitir (ou null) para partida ainda não realizada.',
    example: 1,
    minimum: 0,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'O placar do visitante deve ser um número inteiro.' })
  @Min(0, { message: 'O placar do visitante não pode ser negativo.' })
  @Type(() => Number)
  awayScore?: number | null;

  @ApiProperty({
    description: 'ID do campeonato associado (omitir para amistoso)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'O ID do campeonato deve ser um número inteiro.' })
  @Type(() => Number)
  championshipId?: number | null;

  @ApiProperty({
    description: 'Pênaltis do mandante (preencher só quando houve disputa)',
    example: 4,
    minimum: 0,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'Os pênaltis do mandante devem ser um número inteiro.' })
  @Min(0, { message: 'Os pênaltis do mandante não podem ser negativos.' })
  @Type(() => Number)
  homePenalties?: number | null;

  @ApiProperty({
    description: 'Pênaltis do visitante (preencher só quando houve disputa)',
    example: 2,
    minimum: 0,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'Os pênaltis do visitante devem ser um número inteiro.' })
  @Min(0, { message: 'Os pênaltis do visitante não podem ser negativos.' })
  @Type(() => Number)
  awayPenalties?: number | null;

  @ApiProperty({
    description: 'Fase do mata-mata (texto livre): "Final", "Semifinal", "Oitavas"...',
    example: 'Semifinal',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'A fase deve ser um texto.' })
  @MaxLength(60)
  phase?: string | null;

  @ApiProperty({
    description: 'Grupo da fase de grupos (ex: "A"). Só em campeonatos com grupos.',
    example: 'A',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'O grupo deve ser um texto.' })
  @MaxLength(30)
  groupName?: string | null;
}
