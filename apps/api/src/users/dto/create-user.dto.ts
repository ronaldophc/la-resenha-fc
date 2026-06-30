import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Endereço de e-mail do usuário',
    example: 'joao@email.com',
  })
  @IsEmail({}, { message: 'O e-mail deve ser um endereço válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @ApiProperty({
    description: 'Senha de acesso do usuário (mínimo 6 caracteres)',
    example: 'senha123',
    minLength: 6,
  })
  @IsString({ message: 'A senha deve ser uma string válida.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  password: string;

  @ApiProperty({
    description: 'Papel do usuário no sistema (ex: ADMIN)',
    example: 'ADMIN',
    required: false,
  })
  @IsString({ message: 'O papel (role) deve ser uma string válida.' })
  @IsOptional()
  role?: string;
}
