import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({ description: 'Nome do clube', example: 'La Resenha FC', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'O nome do clube não pode ficar vazio.' })
  @MaxLength(80)
  clubName?: string;

  @ApiProperty({ description: 'URL do logo do clube', required: false, nullable: true })
  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @ApiProperty({ description: 'URL da imagem do banner da home', required: false, nullable: true })
  @IsOptional()
  @IsString()
  bannerUrl?: string | null;

  @ApiProperty({ description: 'Título da seção de redes sociais da home', required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  socialTitle?: string | null;

  @ApiProperty({ description: 'Subtítulo da seção de redes sociais da home', required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  socialSubtitle?: string | null;

  @ApiProperty({ description: 'Link do Instagram', required: false, nullable: true })
  @IsOptional()
  @IsString()
  instagramUrl?: string | null;

  @ApiProperty({ description: 'Número do WhatsApp com DDI e DDD, somente dígitos (ex: 5541999999999)', required: false, nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,15}$/, { message: 'O WhatsApp deve conter somente números, com DDI e DDD (ex: 5541999999999).' })
  whatsappNumber?: string | null;

  @ApiProperty({ description: 'Link do YouTube', required: false, nullable: true })
  @IsOptional()
  @IsString()
  youtubeUrl?: string | null;

  @ApiProperty({ description: 'Link do Facebook', required: false, nullable: true })
  @IsOptional()
  @IsString()
  facebookUrl?: string | null;
}
