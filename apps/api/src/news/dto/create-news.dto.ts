import { IsString, IsNotEmpty, MaxLength, MinLength, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({
    description: 'Título da notícia',
    example: 'La Resenha FC vence o clássico local por 3x1!',
    maxLength: 200,
  })
  @IsString({ message: 'O título deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @MaxLength(200, { message: 'O título deve ter no máximo 200 caracteres.' })
  title: string;

  @ApiProperty({
    description: 'Conteúdo principal da notícia',
    example: 'Em um jogo eletrizante na noite de ontem, o time jogou muito bem...',
    minLength: 10,
  })
  @IsString({ message: 'O conteúdo deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O conteúdo é obrigatório.' })
  @MinLength(10, { message: 'O conteúdo deve ter no mínimo 10 caracteres.' })
  content: string;

  @ApiProperty({
    description: 'URL da imagem de destaque da notícia',
    example: 'https://exemplo.com/imagens/vitoria.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A URL da imagem deve ser uma string válida.' })
  imageUrl?: string;

  @ApiProperty({
    description: 'Data de publicação da notícia (padrão é agora)',
    example: '2026-06-22T21:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'A data de publicação deve ser uma data válida.' })
  publishedAt?: string;
}
