import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // Utilizamos o Logger nativo do NestJS para mensagens mais bonitas no terminal
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now(); // Marca o relógio quando a requisição entra

    // O evento 'finish' é disparado pela resposta no final de todo o ciclo de vida
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      
      this.logger.log(`${method} ${originalUrl} ${statusCode} - ${duration}ms`);
    });

    next(); // MUITO IMPORTANTE: Manda a requisição seguir em frente!
  }
}