import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UploadsService } from './uploads.service';

// Mock do SDK do Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: { upload_stream: jest.fn() },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v2: cloudinary } = require('cloudinary');

/** ConfigService falso que devolve valores de um mapa. */
const makeConfig = (values: Record<string, string | undefined>) =>
  ({ get: (key: string) => values[key] }) as any;

const imageFile = {
  mimetype: 'image/png',
  buffer: Buffer.from('conteudo-fake'),
} as any;

const FULL_CREDS = {
  CLOUDINARY_CLOUD_NAME: 'demo',
  CLOUDINARY_API_KEY: '123',
  CLOUDINARY_API_SECRET: 'segredo',
};

describe('UploadsService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('configuração', () => {
    it('configura o Cloudinary quando as três credenciais existem', () => {
      new UploadsService(makeConfig(FULL_CREDS));
      expect(cloudinary.config).toHaveBeenCalledWith(
        expect.objectContaining({
          cloud_name: 'demo',
          api_key: '123',
          api_secret: 'segredo',
          secure: true,
        }),
      );
    });

    it('NÃO configura quando falta alguma credencial', () => {
      new UploadsService(makeConfig({ CLOUDINARY_CLOUD_NAME: 'demo' }));
      expect(cloudinary.config).not.toHaveBeenCalled();
    });
  });

  describe('upload', () => {
    it('lança erro 500 quando o servidor não está configurado', async () => {
      const service = new UploadsService(makeConfig({}));
      await expect(service.upload(imageFile)).rejects.toThrow(InternalServerErrorException);
      expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
    });

    it('lança 400 quando nenhum arquivo é enviado', async () => {
      const service = new UploadsService(makeConfig(FULL_CREDS));
      await expect(service.upload(undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('lança 400 quando o arquivo não é imagem', async () => {
      const service = new UploadsService(makeConfig(FULL_CREDS));
      const pdf = { mimetype: 'application/pdf', buffer: Buffer.from('x') } as any;
      await expect(service.upload(pdf)).rejects.toThrow(BadRequestException);
    });

    it('envia a imagem e retorna a URL segura', async () => {
      cloudinary.uploader.upload_stream.mockImplementation((_opts: any, cb: any) => ({
        end: () => cb(null, { secure_url: 'https://res.cloudinary.com/demo/img.png' }),
      }));

      const service = new UploadsService(makeConfig(FULL_CREDS));
      const result = await service.upload(imageFile);

      expect(result).toEqual({ url: 'https://res.cloudinary.com/demo/img.png' });
    });

    it('usa a pasta configurada em CLOUDINARY_FOLDER', async () => {
      cloudinary.uploader.upload_stream.mockImplementation((_opts: any, cb: any) => ({
        end: () => cb(null, { secure_url: 'https://x/y.png' }),
      }));

      const service = new UploadsService(
        makeConfig({ ...FULL_CREDS, CLOUDINARY_FOLDER: 'meu-projeto' }),
      );
      await service.upload(imageFile);

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({ folder: 'meu-projeto', resource_type: 'image' }),
        expect.any(Function),
      );
    });

    it('usa a pasta padrão quando CLOUDINARY_FOLDER não é definida', async () => {
      cloudinary.uploader.upload_stream.mockImplementation((_opts: any, cb: any) => ({
        end: () => cb(null, { secure_url: 'https://x/y.png' }),
      }));

      const service = new UploadsService(makeConfig(FULL_CREDS));
      await service.upload(imageFile);

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({ folder: 'la-resenha-fc' }),
        expect.any(Function),
      );
    });

    it('converte falha do Cloudinary em erro 500', async () => {
      cloudinary.uploader.upload_stream.mockImplementation((_opts: any, cb: any) => ({
        end: () => cb(new Error('403 forbidden'), null),
      }));

      const service = new UploadsService(makeConfig(FULL_CREDS));
      await expect(service.upload(imageFile)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
