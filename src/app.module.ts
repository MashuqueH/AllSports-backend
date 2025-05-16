import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FootballModule } from './football/football.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [FootballModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
