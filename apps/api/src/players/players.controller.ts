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
} from '@nestjs/common';
import { PlayersService } from './players.service';
import * as playersInterface from './interfaces/players.interface';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  // GET /players — Público, retorna todos os jogadores
  @Get()
  findAll(): playersInterface.Player[] {
    return this.playersService.findAll();
  }

  // GET /players/:id — Público, retorna 404 se não encontrado
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): playersInterface.Player {
    return this.playersService.findOne(id);
  }

  // POST /players — Retorna 201 com o objeto criado
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body()
    body: {
      name: string;
      number: number;
      position: playersInterface.PlayerPosition;
      photoUrl?: string;
    },
  ): playersInterface.Player {
    return this.playersService.create(body);
  }

  // PUT /players/:id — Substitui completamente, retorna 404 se não encontrado
  @Put(':id')
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: Pick<playersInterface.Player, 'name' | 'number' | 'position' | 'photoUrl'>,
  ): playersInterface.Player {
    return this.playersService.replace(id, body);
  }

  // PATCH /players/:id — Atualiza parcialmente, retorna 404 se não encontrado
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<playersInterface.Player>,
  ): playersInterface.Player {
    return this.playersService.update(id, body);
  }

  // DELETE /players/:id — Retorna 204 No Content ou 404 se não encontrado
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): void {
    return this.playersService.remove(id);
  }
}
