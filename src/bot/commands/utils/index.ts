import { Context } from 'telegraf';
import { CommandsService } from '../commands.service';
import Form from './form';

const floatToBRL = (value: number) => {
  return isNaN(value)
    ? '-'
    : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const parseTextToMarkdownV2 = (text: string) => {
  if (!text || typeof text !== typeof '') return text;

  text = text.replaceAll('.', '\\.');
  text = text.replaceAll('-', '\\-');
  text = text.replaceAll('!', '\\!');
  text = text.replaceAll('=', '\\=');
  text = text.replaceAll('(', '\\(');
  text = text.replaceAll(')', '\\)');
  text = text.replaceAll('+', '\\+');
  text = text.replaceAll('#', '\\#');
  text = text.replaceAll('{', '\\{');
  text = text.replaceAll('}', '\\}');
  text = text.replaceAll('|', '\\|');
  text = text.replaceAll('>', '\\>');

  return text;
};

type CommandConfig = {
  commandsService: CommandsService;
  command: string;
  description: string;
};

type ActionConfig = {
  commandsService: CommandsService;
  actionName: string;
};

const Command = (
  config: CommandConfig,
  myFunction: (context: Context) => Promise<void>,
) => {
  config.commandsService.client.command(
    config.command,
    async (context: Context) => {
      try {
        await myFunction(context);
      } catch (error) {
        config.commandsService.logger.error(error);
        throw error;
      }
    },
  );

  config.commandsService.registryCommand(config.command, config.description);
};

const Action = (
  config: ActionConfig,
  myFunction: (context: Context) => Promise<void>,
) => {
  config.commandsService.client.action(
    config.actionName,
    async (context: Context) => {
      try {
        await myFunction(context);
        await context.answerCbQuery();
      } catch (error) {
        config.commandsService.logger.error(error);
        throw error;
      }
    },
  );
};

export { Command, Action, Form, parseTextToMarkdownV2, floatToBRL };
