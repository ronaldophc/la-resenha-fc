import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateSponsorDto {
  @ApiProperty({
    description: 'Nome do patrocinador',
    example: 'Padaria do Bairro',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome do patrocinador é obrigatório.' })
  @MaxLength(120)
  name: string;

  @ApiProperty({
    description: 'URL do logo do patrocinador',
    example: 'https://exemplo.com/logo-patrocinador.png',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @ApiProperty({
    description: 'Descrição do patrocinador',
    example: 'Apoiador oficial do time desde 2024.',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @ApiProperty({ description: 'Link do Instagram do patrocinador', required: false, nullable: true })
  @IsOptional()
  @IsString()
  instagramUrl?: string | null;

  @ApiProperty({
    description: 'WhatsApp do patrocinador — só dígitos, com DDI e DDD (ex: 5541999999999)',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,15}$/, { message: 'O WhatsApp deve conter somente números, com DDI e DDD (ex: 5541999999999).' })
  whatsappNumber?: string | null;

  @ApiProperty({ description: 'Link do YouTube do patrocinador', required: false, nullable: true })
  @IsOptional()
  @IsString()
  youtubeUrl?: string | null;

  @ApiProperty({ description: 'Link do Facebook do patrocinador', required: false, nullable: true })
  @IsOptional()
  @IsString()
  facebookUrl?: string | null;
}
