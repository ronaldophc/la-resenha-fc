import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @ApiOperation({ summary: 'Retorna todas as notícias ordenadas por data de publicação decrescente' })
  @ApiResponse({ status: 200, description: 'Lista de notícias retornada com sucesso' })
  @Get()
  async findAll() {
    return this.newsService.findAll();
  }

  @ApiOperation({ summary: 'Retorna os detalhes de uma notícia específica por id' })
  @ApiResponse({ status: 200, description: 'Notícia encontrada' })
  @ApiResponse({ status: 404, description: 'Notícia não encontrada' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOne(id);
  }

  @ApiOperation({ summary: 'Cadastra uma nova notícia (Apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Notícia cadastrada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada malformados ou inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createNewsDto: CreateNewsDto, @Req() req: any) {
    const authorId = req.user.id;
    return this.newsService.create(createNewsDto, authorId);
  }

  @ApiOperation({ summary: 'Atualiza parcialmente uma notícia (Apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Notícia atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada malformados ou inválidos' })
  @ApiResponse({ status: 404, description: 'Notícia não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNewsDto: Partial<CreateNewsDto>,
  ) {
    return this.newsService.update(id, updateNewsDto);
  }

  @ApiOperation({ summary: 'Remove uma notícia por id (Apenas ADMIN)' })
  @ApiResponse({ status: 204, description: 'Notícia removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Notícia não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.newsService.remove(id);
  }
}
