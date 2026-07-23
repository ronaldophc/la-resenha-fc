import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);

    // Silencia os logs e torna o atraso entre tentativas instantâneo
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(global, 'setTimeout').mockImplementation(((fn: any) => {
      fn();
      return 0 as any;
    }) as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('conecta na primeira tentativa quando o banco está disponível', async () => {
    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue(undefined);
    await service.onModuleInit();
    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it('tenta novamente e conecta quando o banco demora a responder (Neon acordando)', async () => {
    const connectSpy = jest
      .spyOn(service, '$connect')
      .mockRejectedValueOnce(new Error('P1001'))
      .mockRejectedValueOnce(new Error('P1001'))
      .mockResolvedValueOnce(undefined);

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledTimes(3);
  });

  it('NÃO derruba a aplicação após esgotar as tentativas (sobe mesmo assim)', async () => {
    const connectSpy = jest.spyOn(service, '$connect').mockRejectedValue(new Error('P1001'));

    // Ponto central da resiliência: onModuleInit não deve lançar exceção
    await expect(service.onModuleInit()).resolves.toBeUndefined();
    expect(connectSpy).toHaveBeenCalledTimes(5);
  });

  it('should call $disconnect on destroy', async () => {
    const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue(undefined);
    await service.onModuleDestroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
