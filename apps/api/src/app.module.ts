import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { MatchesModule } from './matches/matches.module';
import { NewsModule } from './news/news.module';
import { StandingsModule } from './standings/standings.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { ChampionshipsModule } from './championships/championships.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_EXPIRATION'];
        const missing = required.filter((key) => !config[key]);
        if (missing.length > 0) {
          throw new Error(`Missing mandatory environment variables: ${missing.join(', ')}`);
        }
        return config;
      },
    }),
    AuthModule,
    PlayersModule,
    MatchesModule,
    NewsModule,
    StandingsModule,
    PrismaModule,
    UsersModule,
    TeamsModule,
    ChampionshipsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
