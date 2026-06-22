import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './transform/transform.interceptor';
import { HttpExceptionFilter } from './http-exception/http-exception.filter';
import { PlayerNumberAlreadyInUseFilter } from './players/filters/player-number-already-in-use.filter';
import { EmailAlreadyInUseFilter } from './users/filters/email-already-in-use.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PlayerNumberAlreadyInUseFilter(),
    new EmailAlreadyInUseFilter(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API com Swagger')
    .setDescription('Documentação automática da API com Swagger')
    .setVersion('1.0')
    .addBearerAuth() // Para habilitar autenticação JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  writeFileSync('./swagger.json', JSON.stringify(document, null, 2));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
