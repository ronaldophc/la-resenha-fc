import { Module } from '@nestjs/common';
import { TiesService } from './ties.service';
import { TiesController } from './ties.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TiesController],
  providers: [TiesService],
  exports: [TiesService],
})
export class TiesModule {}
