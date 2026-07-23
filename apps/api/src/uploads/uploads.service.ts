import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  private configured = false;
  /** Pasta do Cloudinary onde as imagens deste projeto são salvas. */
  private readonly folder: string;

  constructor(private readonly config: ConfigService) {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    // Isola os arquivos deste projeto numa pasta própria (conta pode ser
    // compartilhada com outros sistemas). Configurável via CLOUDINARY_FOLDER.
    this.folder = this.config.get<string>('CLOUDINARY_FOLDER') || 'la-resenha-fc';

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.configured = true;
    }
  }

  /** Envia o buffer da imagem ao Cloudinary e retorna a URL segura (https). */
  async upload(file: Express.Multer.File): Promise<{ url: string }> {
    if (!this.configured) {
      throw new InternalServerErrorException(
        'Upload de imagens não configurado no servidor (credenciais do Cloudinary ausentes).',
      );
    }
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('O arquivo enviado não é uma imagem.');
    }

    try {
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: this.folder, resource_type: 'image' },
          (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
        );
        stream.end(file.buffer);
      });
      return { url: result.secure_url };
    } catch (error) {
      throw new InternalServerErrorException('Falha ao enviar a imagem. Tente novamente.');
    }
  }
}
