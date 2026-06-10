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
import * as playersInterface from './interfaces/players.interface';
import { CreatePlayerDto } from './dto/create-player.dto';
import { QueryFilterDto } from './dto/query-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  // GET /players — Público, retorna todos os jogadores
  @Get()
  async findAll(@Query() query: QueryFilterDto) {
    return this.playersService.findAll(query);
  }

  // GET /players/:id — Público, retorna 404 se não encontrado
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.findOne(id);
  }

  // POST /players — Retorna 201 com o objeto criado
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playersService.create(createPlayerDto);
  }

  // PUT /players/:id — Substitui completamente, retorna 404 se não encontrado
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
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.playersService.remove(id);
  }
}
