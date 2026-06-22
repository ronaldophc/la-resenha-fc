import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @ApiOperation({ summary: 'Registra um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Email já cadastrado' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.role,
    );
  }

  @ApiOperation({
    summary: 'Autenticar usuário',
    description: 'Realiza a autenticação com e-mail e senha, retornando o token de acesso JWT.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', description: 'E-mail cadastrado.' },
        password: { type: 'string', description: 'Senha do usuário.' },
      },
      required: ['email', 'password'],
    },
    examples: {
      valido: {
        summary: 'Exemplo válido',
        value: {
          email: 'usuario@email.com',
          password: 'SenhaSegura123',
        },
      },
      invalido: {
        summary: 'Exemplo inválido',
        value: {
          email: 'email-invalido',
          password: '',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
  @ApiResponse({ status: 201, description: 'Sessão criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada malformados ou inválidos.' })
  @ApiResponse({ status: 401, description: 'Credenciais incorretas.' })
  @ApiResponse({ status: 403, description: 'Acesso recusado ou conta suspensa.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiResponse({ status: 409, description: 'Conflito na autenticação ou múltiplas sessões ativas.' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @
    @Get('profile')
    async getProfile(@Req() request) {
      return request.user;
    }
}