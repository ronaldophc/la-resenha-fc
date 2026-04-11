import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { MatchesModule } from './matches/matches.module';
import { NewsModule } from './news/news.module';
import { StandingsModule } from './standings/standings.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, PlayersModule, MatchesModule, NewsModule, StandingsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
