import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TiesService } from './ties.service';
import { GenerateBracketDto } from './dto/generate-bracket.dto';
import { UpdateTieDto } from './dto/update-tie.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('ties')
@Controller('ties')
export class TiesController {
  constructor(private readonly tiesService: TiesService) {}

  @ApiOperation({ summary: 'Retorna o chaveamento (confrontos) de um campeonato' })
  @ApiQuery({ name: 'championshipId', required: true })
  @ApiResponse({ status: 200, description: 'Chaveamento retornado com sucesso' })
  @Get()
  async getBracket(@Query('championshipId', ParseIntPipe) championshipId: number) {
    return this.tiesService.getBracket(championshipId);
  }

  @ApiOperation({ summary: 'Gera (ou regenera) o chaveamento do mata-mata (Apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Chaveamento gerado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async generate(@Body() dto: GenerateBracketDto) {
    return this.tiesService.generate(dto);
  }

  @ApiOperation({ summary: 'Define times/placares de um confronto e recalcula o avanço (Apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Confronto atualizado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateTie(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTieDto) {
    return this.tiesService.updateTie(id, dto);
  }
}
