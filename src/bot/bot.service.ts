import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf, session } from 'telegraf';
import { CommandsService } from './commands/commands.service';
import environment from 'src/environment';
import { WindolarApiService } from 'src/windolar-api/windolar-api.service';

@Injectable()
export class BotService {
  private logger: Logger;

  public token: string;
  public client: Telegraf;

  private commands: CommandsService;

  private userInteractionTimestamps: {
    [userId: number]: number;
  } = {};

  constructor(public windolarApiService: WindolarApiService) {
    this.start();
  }

  private handleError() {
    this.client.catch(async (error, context: any) => {
      if (context?.scene?.leave) context?.scene?.leave();

      try {
        await context.answerCbQuery();
      } catch {}

      this.logger.error(error);

      if (['channel', 'group', 'supergroup'].includes(context.chat?.type))
        return;

      try {
        await context.reply(
          `🐞 *Ops\\! Algo deu errado\\. Tente novamente mais tarde\\.* 🐞

_Se o problema continuar, entre em contato com o suporte\\._`,
          { parse_mode: 'MarkdownV2' },
        );
      } catch {}
    });
  }

  async userInteractionLimitRate(context: Context, next: () => Promise<void>) {
    const userId = context.from?.id;

    if (
      !userId ||
      ['channel', 'group', 'supergroup'].includes(context.chat?.type)
    )
      await next();

    const now = Date.now();
    const userLastInteraction = this.userInteractionTimestamps[userId];

    if (userLastInteraction && now - userLastInteraction < 500) {
      await context.reply(
        `😬 *Você está executando comandos muito rapidamente\\! Por favor, aguarde um momento antes de tentar novamente\\.*`,
        { parse_mode: 'MarkdownV2' },
      );

      await new Promise((resolve) => setTimeout(resolve, 4000));
    } else {
      this.userInteractionTimestamps[userId] = now;
      await next();
    }
  }

  private async setupTelegramClient() {
    this.client = new Telegraf(this.token);
    this.client.use(session());
    this.client.use(this.userInteractionLimitRate.bind(this));

    this.handleError();

    this.commands = new CommandsService();
    this.commands.configure(this);

    await this.commands.user();

    await this.commands.registryCommands();

    await this.client.launch();
  }

  async start() {
    this.token = environment.botToken;
    this.logger = new Logger(BotService.name);

    try {
      this.logger.log('Starting bot...');
      await this.setupTelegramClient();
      // this.logger.log('Bot started as successfully!');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async stop() {
    try {
      await this.client.telegram.deleteWebhook();
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async isRunning() {
    try {
      await this.client.telegram.getMe();
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
