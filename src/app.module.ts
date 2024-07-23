import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WindolarApiModule } from './windolar-api/windolar-api.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [WindolarApiModule, BotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
