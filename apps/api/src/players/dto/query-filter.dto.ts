import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryFilterDto {
  @ApiProperty({
    description: 'Termo de pesquisa para filtrar jogadores por nome',
    example: 'Silva',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O filtro deve ser uma string válida.' })
  @Transform(({ value }: { value: string }) => value?.trim())
  filter?: string;

  @ApiProperty({
    description: 'Número da página para paginação',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  page?: number;
}