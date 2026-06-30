import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse) {
        message = (exceptionResponse as any).message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      if (exception.name === 'PlayerNumberAlreadyInUseException' || exception.name === 'EmailAlreadyInUseException') {
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        message = exception.message;
      } else {
        console.error('Unexpected exception captured by global exception filter:', exception);
      }
    } else {
      console.error('Non-Error exception captured by global exception filter:', exception);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}