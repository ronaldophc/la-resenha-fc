import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { News } from './interfaces/news.interface';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNewsDto, authorId: number): Promise<News> {
    const newNews = await this.prisma.news.create({
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl ?? null,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        authorId: authorId,
      },
    });
    return newNews as News;
  }

  async findAll(): Promise<News[]> {
    const newsList = await this.prisma.news.findMany({
      orderBy: { publishedAt: 'desc' },
    });
    return newsList as News[];
  }

  async findOne(id: number): Promise<News> {
    const news = await this.prisma.news.findUnique({
      where: { id },
    });
    if (!news) {
      throw new NotFoundException(`Notícia com id ${id} não encontrada.`);
    }
    return news as News;
  }

  async update(id: number, data: Partial<CreateNewsDto>): Promise<News> {
    await this.findOne(id);

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl ?? null;
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date();
    }

    const updatedNews = await this.prisma.news.update({
      where: { id },
      data: updateData,
    });
    return updatedNews as News;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.news.delete({
      where: { id },
    });
  }
}
