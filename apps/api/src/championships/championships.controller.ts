import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ChampionshipsService } from './championships.service';
import { CreateChampionshipDto } from './dto/create-championship.dto';
import { UpdateChampionshipDto } from './dto/update-championship.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('championships')
@Controller('championships')
export class ChampionshipsController {
  constructor(private readonly championshipsService: ChampionshipsService) {}

  @ApiOperation({ summary: 'Retorna todos os campeonatos cadastrados' })
  @ApiResponse({ status: 200, description: 'Lista de campeonatos retornada com sucesso' })
  @Get()
  async findAll() {
    return this.championshipsService.findAll();
  }

  @ApiOperation({ summary: 'Retorna os detalhes de um campeonato específico com classificação por id' })
  @ApiResponse({ status: 200, description: 'Campeonato encontrado' })
  @ApiResponse({ status: 404, description: 'Campeonato não encontrado' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.championshipsService.findOne(id);
  }

  @ApiOperation({ summary: 'Cadastra um novo campeonato (Apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Campeonato cadastrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createChampionshipDto: CreateChampionshipDto) {
    return this.championshipsService.create(createChampionshipDto);
  }

  @ApiOperation({ summary: 'Atualiza parcialmente um campeonato (Apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Campeonato atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Campeonato não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChampionshipDto: UpdateChampionshipDto,
  ) {
    return this.championshipsService.update(id, updateChampionshipDto);
  }

  @ApiOperation({ summary: 'Remove um campeonato por id (Apenas ADMIN)' })
  @ApiResponse({ status: 204, description: 'Campeonato removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Campeonato não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.championshipsService.remove(id);
  }
}
