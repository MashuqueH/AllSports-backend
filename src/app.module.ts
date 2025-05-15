import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FootballModule } from './football/football.module';

@Module({
  imports: [FootballModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
