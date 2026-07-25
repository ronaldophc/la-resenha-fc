import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateBracketDto {
  @ApiProperty({ description: 'ID do campeonato', example: 1 })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  championshipId: number;

  @ApiProperty({
    description: 'Número de times na fase inicial (potência de 2)',
    enum: [2, 4, 8, 16, 32],
    example: 8,
  })
  @IsIn([2, 4, 8, 16, 32], { message: 'O tamanho do chaveamento deve ser 2, 4, 8, 16 ou 32.' })
  @Type(() => Number)
  teams: number;
}
