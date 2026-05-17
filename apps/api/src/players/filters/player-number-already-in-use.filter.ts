import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { PlayerNumberAlreadyInUseException } from '../exceptions/player-number-already-in-use.exception';

@Catch(PlayerNumberAlreadyInUseException)
export class PlayerNumberAlreadyInUseFilter implements ExceptionFilter {
  catch(exception: PlayerNumberAlreadyInUseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      success: false,
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      path: request.url,
      message: exception.message,
      error: 'Unprocessable Entity',
    });
  }
}
