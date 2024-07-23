import { Injectable, Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { BotService } from '../bot.service';
import UserCommands from './user';

@Injectable()
export class CommandsService {
  public logger: Logger;
  public botService: BotService;
  public client: Telegraf;

  private commands: { command: string; description: string }[] = [];

  async configure(botService: BotService) {
    this.client = botService.client;
    this.logger = new Logger(
      `${CommandsService.name}: ${this.client.telegram.token}`,
    );
    this.botService = botService;
  }

  registryCommand(command: string, description: string) {
    this.commands.push({ command, description });
  }

  async registryCommands() {
    let attempt = 0;
    while (attempt < 3) {
      try {
        const registredCommands = await this.client.telegram.getMyCommands();

        if (String(registredCommands) !== String(this.commands))
          await this.client.telegram.setMyCommands(this.commands);

        break;
      } catch (error) {
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, 1200));

        this.logger.error(error);
        throw error;
      }
    }
  }

  async user() {
    await UserCommands({ commandsService: this });
  }
}
