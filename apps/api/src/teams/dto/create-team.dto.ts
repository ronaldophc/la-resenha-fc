import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({
    description: 'Nome do time',
    example: 'La Resenha FC',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome do time é obrigatório.' })
  name: string;

  @ApiProperty({
    description: 'URL do logo/escudo do time',
    example: 'https://exemplo.com/escudo.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
