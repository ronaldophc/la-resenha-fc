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
import { SponsorsService } from './sponsors.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('sponsors')
@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  @ApiOperation({ summary: 'Retorna todos os patrocinadores' })
  @ApiResponse({ status: 200, description: 'Lista de patrocinadores retornada com sucesso' })
  @Get()
  async findAll() {
    return this.sponsorsService.findAll();
  }

  @ApiOperation({ summary: 'Retorna um patrocinador específico por id' })
  @ApiResponse({ status: 200, description: 'Patrocinador encontrado' })
  @ApiResponse({ status: 404, description: 'Patrocinador não encontrado' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sponsorsService.findOne(id);
  }

  @ApiOperation({ summary: 'Cadastra um novo patrocinador (Apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Patrocinador cadastrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSponsorDto: CreateSponsorDto) {
    return this.sponsorsService.create(createSponsorDto);
  }

  @ApiOperation({ summary: 'Atualiza parcialmente um patrocinador (Apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Patrocinador atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Patrocinador não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSponsorDto: UpdateSponsorDto,
  ) {
    return this.sponsorsService.update(id, updateSponsorDto);
  }

  @ApiOperation({ summary: 'Remove um patrocinador por id (Apenas ADMIN)' })
  @ApiResponse({ status: 204, description: 'Patrocinador removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Patrocinador não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sponsorsService.remove(id);
  }
}
