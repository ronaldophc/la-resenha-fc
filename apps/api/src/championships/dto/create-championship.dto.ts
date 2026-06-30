import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
