import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { EmailAlreadyInUseException } from '../exceptions/email-already-in-use.exception';

@Catch(EmailAlreadyInUseException)
export class EmailAlreadyInUseFilter implements ExceptionFilter {
  catch(exception: EmailAlreadyInUseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
