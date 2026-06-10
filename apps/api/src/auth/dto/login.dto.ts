import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'O e-mail deve ser um endereço válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @IsString({ message: 'A senha deve ser uma string válida.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  password: string;
}
