import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { CommandsModule } from './commands/commands.module';
import { WindolarApiModule } from 'src/windolar-api/windolar-api.module';

@Module({
  imports: [WindolarApiModule, CommandsModule],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
