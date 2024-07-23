import { Context, Markup } from 'telegraf';
import { Command, parseTextToMarkdownV2 } from '../utils';
import { CommandsService } from '../commands.service';
import RegisterAction from './register';

const UserCommands = async ({
  commandsService,
}: {
  commandsService: CommandsService;
}) => {
  RegisterAction(commandsService);

  Command(
    {
      commandsService,
      command: 'start',
      description: '🚀 Iniciar',
    },
    async (context: Context) => {
      context.reply(
        parseTextToMarkdownV2(`🤖 *Sejam bem-vindos ao bot Win Dólar* 🤖

Clique no botão "Cadastrar" abaixo para criar uma conta na corretora.`),
        {
          parse_mode: 'MarkdownV2',
          ...Markup.inlineKeyboard(
            [
              Markup.button.callback('🔑 Cadastrar', 'register'),
              Markup.button.url(
                '📊 Acessar Plataforma',
                'https://windolar.jarvis-bot.com/trade',
              ),
              Markup.button.url(
                '💬 Acessar Grupo',
                'https://t.me/Windolarcopy',
              ),
              Markup.button.url(
                '📞 Suporte',
                'https://api.whatsapp.com/send?phone=5511959047560&text=',
              ),
            ],
            { columns: 1 },
          ),
        },
      );
    },
  );

  Command(
    {
      commandsService,
      command: 'ajuda',
      description: '❓ Ajuda',
    },
    async (context: Context) => {
      await context.sendMessage(
        '*Para entrar em contato com o suporte, basta clicar no botão abaixo* 👇',
        {
          parse_mode: 'MarkdownV2',
          ...Markup.inlineKeyboard(
            [
              Markup.button.url(
                '💬 Entrar em contato',
                'https://api.whatsapp.com/send?phone=5511959047560&text=',
              ),
            ],
            { columns: 1 },
          ),
        },
      );
    },
  );
};

export default UserCommands;
