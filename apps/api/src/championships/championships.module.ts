import { Module } from '@nestjs/common';
import { ChampionshipsService } from './championships.service';
import { ChampionshipsController } from './championships.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StandingsModule } from '../standings/standings.module';

@Module({
  imports: [PrismaModule, StandingsModule],
  controllers: [ChampionshipsController],
  providers: [ChampionshipsService],
  exports: [ChampionshipsService],
})
export class ChampionshipsModule {}
