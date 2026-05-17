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
} from '@nestjs/common';
import { PlayersService } from './players.service';
import * as playersInterface from './interfaces/players.interface';
import { CreatePlayerDto } from './dto/create-player.dto';
import { QueryFilterDto } from './dto/query-filter.dto';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  // GET /players — Público, retorna todos os jogadores
  @Get()
  findAll(@Query() query: QueryFilterDto): playersInterface.Player[] {
    return this.playersService.findAll(query);
  }

  // GET /players/:id — Público, retorna 404 se não encontrado
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): playersInterface.Player {
    return this.playersService.findOne(id);
  }

  // POST /players — Retorna 201 com o objeto criado
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPlayerDto: CreatePlayerDto): playersInterface.Player {
    return this.playersService.create(createPlayerDto);
  }

  // PUT /players/:id — Substitui completamente, retorna 404 se não encontrado
  @Put(':id')
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() replacePlayerDto: CreatePlayerDto,
  ): playersInterface.Player {
    return this.playersService.replace(id, replacePlayerDto);
  }

  // PATCH /players/:id — Atualiza parcialmente, retorna 404 se não encontrado
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlayerDto: Partial<CreatePlayerDto>,
  ): playersInterface.Player {
    return this.playersService.update(id, updatePlayerDto);
  }

  // DELETE /players/:id — Retorna 204 No Content ou 404 se não encontrado
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): void {
    return this.playersService.remove(id);
  }
}
