import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @ApiOperation({ summary: 'Retorna todos os times cadastrados' })
  @ApiResponse({ status: 200, description: 'Lista de times retornada com sucesso' })
  @Get()
  async findAll(@Query('filter') filter?: string) {
    return this.teamsService.findAll(filter);
  }

  @ApiOperation({ summary: 'Retorna os detalhes de um time específico por id' })
  @ApiResponse({ status: 200, description: 'Time encontrado' })
  @ApiResponse({ status: 404, description: 'Time não encontrado' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.findOne(id);
  }

  @ApiOperation({ summary: 'Cadastra um novo time (Apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Time cadastrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @ApiOperation({ summary: 'Atualiza parcialmente um time (Apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Time atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Time não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @ApiOperation({ summary: 'Remove um time por id (Apenas ADMIN)' })
  @ApiResponse({ status: 204, description: 'Time removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Time não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.teamsService.remove(id);
  }
}
