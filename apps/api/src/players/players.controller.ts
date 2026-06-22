import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { QueryFilterDto } from './dto/query-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('players')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  // GET /players — Público, retorna todos os jogadores
  @ApiOperation({ summary: 'Retorna todos os jogadores cadastrados no elenco' })
  @ApiResponse({ status: 200, description: 'Lista de jogadores retornada com sucesso' })
  @Get()
  async findAll(@Query() query: QueryFilterDto) {
    return this.playersService.findAll(query);
  }

  // GET /players/:id — Público, retorna 404 se não encontrado
  @ApiOperation({ summary: 'Retorna os detalhes de um jogador específico por id' })
  @ApiResponse({ status: 200, description: 'Jogador encontrado' })
  @ApiResponse({ status: 404, description: 'Jogador não encontrado' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.findOne(id);
  }

  // POST /players — Retorna 201 com o objeto criado
  @ApiOperation({ summary: 'Cadastra um novo jogador (Apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Jogador cadastrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada malformados ou inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playersService.create(createPlayerDto);
  }

  // PUT /players/:id — Substitui completamente, retorna 404 se não encontrado
  @ApiOperation({ summary: 'Substitui completamente os dados de um jogador (Apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Jogador substituído com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada malformados ou inválidos' })
  @ApiResponse({ status: 404, description: 'Jogador não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() replacePlayerDto: CreatePlayerDto,
  ) {
    return this.playersService.replace(id, replacePlayerDto);
  }

  // PATCH /players/:id — Atualiza parcialmente, retorna 404 se não encontrado
  @ApiOperation({ summary: 'Atualiza parcialmente um jogador (Apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Jogador atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada malformados ou inválidos' })
  @ApiResponse({ status: 404, description: 'Jogador não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlayerDto: Partial<CreatePlayerDto>,
  ) {
    return this.playersService.update(id, updatePlayerDto);
  }

  // DELETE /players/:id — Retorna 204 No Content ou 404 se não encontrado
  @ApiOperation({ summary: 'Remove um jogador por id (Apenas ADMIN)' })
  @ApiResponse({ status: 204, description: 'Jogador removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Jogador não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.playersService.remove(id);
  }
}
