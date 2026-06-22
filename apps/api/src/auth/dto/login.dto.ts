import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'O e-mail deve ser um endereço válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @ApiProperty({
    example: 'joao@email.com', 
    description: 'Email do usuário cadastrado' 
  })
  email: string;

  @IsString({ message: 'A senha deve ser uma string válida.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @ApiProperty({ 
    example: '123456', 
    description: 'Senha do usuário cadastrado' 
  })
  password: string;
}
