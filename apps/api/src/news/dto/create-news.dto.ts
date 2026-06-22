import { IsString, IsNotEmpty, MaxLength, MinLength, IsOptional, IsDateString } from 'class-validator';

export class CreateNewsDto {
  @IsString({ message: 'O título deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @MaxLength(200, { message: 'O título deve ter no máximo 200 caracteres.' })
  title: string;

  @IsString({ message: 'O conteúdo deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O conteúdo é obrigatório.' })
  @MinLength(10, { message: 'O conteúdo deve ter no mínimo 10 caracteres.' })
  content: string;

  @IsOptional()
  @IsString({ message: 'A URL da imagem deve ser uma string válida.' })
  imageUrl?: string;

  @IsOptional()
  @IsDateString({}, { message: 'A data de publicação deve ser uma data válida.' })
  publishedAt?: string;
}
