import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail({}, { message: 'O e-mail deve ser um endereço válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @ApiProperty({
    example: 'joao@email.com',
    description: 'Email do usuário a ser cadastrado'
  })
  email: string;

  @IsString({ message: 'A senha deve ser uma string válida.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @ApiProperty({
    example: '123456',
    description: 'Senha do usuário a ser cadastrado'
  })
  password: string;

  @IsString({ message: 'O papel (role) deve ser uma string válida.' })
  @IsOptional()
  @ApiProperty({
    example: 'admin',
    description: 'Papel (role) do usuário a ser cadastrado'
  })
  role?: string;
}
