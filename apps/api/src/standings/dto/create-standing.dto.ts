import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Inscrição de um time em um campeonato. As estatísticas (pontos, jogos,
 * vitórias etc.) não são cadastradas: são calculadas a partir das partidas.
 */
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
    description: 'Ajuste manual de pontos (punições/W.O.), somado ao total calculado. Pode ser negativo.',
    example: -3,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'O ajuste de pontos deve ser um número inteiro.' })
  @Type(() => Number)
  pointsAdjustment?: number;
}
