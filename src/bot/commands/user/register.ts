import { Context, Markup } from 'telegraf';
import { CommandsService } from '../commands.service';
import { Action, Form, parseTextToMarkdownV2 } from '../utils';

const RegisterForm = (commandsService: CommandsService) => {
  Form(
    { commandsService, formName: 'register_form' },
    [
      { key: 'name', name: 'Nome', message: '*Digite seu nome:*' },
      { key: 'email', name: 'E-mail', message: '*Digite seu e\\-mail:*' },
      { key: 'password', name: 'Senha', message: '*Digite sua senha:*' },
    ],
    async (context: Context, fieldValues: any) => {
      const feedbackMessage = await context.sendMessage(
        `⏳ *Seu cadastro está sendo realizado\\.\\.\\.*`,
        { parse_mode: 'MarkdownV2' },
      );

      const response = await commandsService.botService.windolarApiService.post(
        {
          route: '/admin/customers',
          data: {
            name: fieldValues['name'],
            email: fieldValues['email'],
            password: fieldValues['password'],
            role: 'customer',
            status: '',
          },
          additionalHeaders: {
            'content-type': 'application/json',
            'x-requested-with': 'XMLHttpRequest',
          },
        },
      );

      try {
        await context.deleteMessage(feedbackMessage?.message_id);
      } catch {}

      if (response?.status !== 200) {
        await context.sendMessage(
          parseTextToMarkdownV2(`⚠️ *Falha ao realizar cadastro* ⚠️

${response?.['response']?.data?.message?.length > 1 ? response?.['response']?.data?.message : '_Verifique os dados e tente novamente! Se o problema persistir entre em contato com o suporte._'}`),
          {
            parse_mode: 'MarkdownV2',
            ...Markup.inlineKeyboard([
              Markup.button.callback('Tentar Novamente', 'register'),
            ]),
          },
        );

        return;
      }

      await context.sendMessage(`✅ *Cadastro realizado com sucesso\\!* ✅`, {
        parse_mode: 'MarkdownV2',
        ...Markup.inlineKeyboard([
          Markup.button.url(
            '📊 Acessar Plataforma',
            'https://windolar.jarvis-bot.com/trade',
          ),
        ]),
      });
    },
  );
};

const RegisterAction = (commandsService: CommandsService) => {
  RegisterForm(commandsService),
    Action(
      {
        commandsService,
        actionName: 'register',
      },
      async (context: Context) =>
        await context['scene']?.enter('register_form'),
    );
};

export default RegisterAction;
