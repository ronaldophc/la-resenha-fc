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
  UseGuards,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @ApiOperation({ summary: 'Retorna todas as partidas ordenadas por data decrescente' })
  @ApiResponse({ status: 200, description: 'Lista de partidas retornada com sucesso' })
  @Get()
  async findAll() {
    return this.matchesService.findAll();
  }

  @ApiOperation({ summary: 'Retorna os detalhes de uma partida específica por id' })
  @ApiResponse({ status: 200, description: 'Partida encontrada' })
  @ApiResponse({ status: 404, description: 'Partida não encontrada' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.findOne(id);
  }

  @ApiOperation({ summary: 'Cadastra uma nova partida (Apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Partida cadastrada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada malformados ou inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  @ApiOperation({ summary: 'Substitui completamente os dados de uma partida (Apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Partida substituída com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada malformados ou inválidos' })
  @ApiResponse({ status: 404, description: 'Partida não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() replaceMatchDto: CreateMatchDto,
  ) {
    return this.matchesService.update(id, replaceMatchDto);
  }

  @ApiOperation({ summary: 'Atualiza parcialmente uma partida (Apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Partida atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada malformados ou inválidos' })
  @ApiResponse({ status: 404, description: 'Partida não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchDto: Partial<CreateMatchDto>,
  ) {
    return this.matchesService.update(id, updateMatchDto);
  }

  @ApiOperation({ summary: 'Remove uma partida por id (Apenas ADMIN)' })
  @ApiResponse({ status: 204, description: 'Partida removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Partida não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.matchesService.remove(id);
  }
}
