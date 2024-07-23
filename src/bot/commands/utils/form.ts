import { Context as TelegrafContext, Scenes, Markup } from 'telegraf';
import { CommandsService } from '../commands.service';
import { parseTextToMarkdownV2 } from '.';

type FormConfig = {
  commandsService: CommandsService;
  formName: string;
  adminRequired?: boolean;
};

interface Field {
  key: string;
  name: string;
  message: string;
  type?: 'options' | 'text' | 'percentage' | 'currency';
  keyboardColumns?: number;
  options?: {
    key: string;
    name: string;
  }[];
}

type Context = TelegrafContext & {
  message?: {
    text?: string;
  };
  [key: string]: any;
};

const checkCancel = async (context: Context) => {
  if (context?.message?.text && context.message.text === '/cancelar') {
    context.reply('Operação cancelada com sucesso!');

    if (context?.scene) context.scene?.leave();

    return true;
  }

  return false;
};

const currencyValidator = (text: string) => {
  const regex = /^(\d{1,3}(\.\d{3})*|\d+),\d{2}$/;
  return regex.test(text);
};

const percentageValidator = (text: string) => {
  const regex = /^\d{1,2}(,\d{1,2})?%$/;
  return regex.test(text);
};

const isInvalidText = async (text: string, context: Context) => {
  const boldLength = text.split('<negrito>').length - 1;
  const italicLength = text.split('<italico>').length - 1;

  if (!(boldLength % 2 === 0)) {
    await context.reply(
      `⚠️ *Parece que há um problema com a formatação em negrito\\. Lembre\\-se de que, para deixar um texto em negrito, é necessário usar "\\<negrito\\>" no início e no final da frase ou palavra\\. Tente novamente\\!*`,
      { parse_mode: 'MarkdownV2' },
    );

    return true;
  } else if (!(italicLength % 2 === 0)) {
    await context.reply(
      `⚠️ *Parece que há um problema com a formatação em itálico\\. Lembre\\-se de que, para deixar um texto em itálico, é necessário usar "\\<italico\\>" no início e no final da frase ou palavra\\. Tente novamente\\!*`,
      { parse_mode: 'MarkdownV2' },
    );

    return true;
  }

  return false;
};

const formatText = (text: string) => {
  text = text.replaceAll('*', `\\*`);
  text = text.replaceAll('_', `\\_`);

  text = text.replaceAll('<negrito>', '*');
  text = text.replaceAll('<italico>', '_');

  return text;
};

const textStep = (formName: string, field: Field) => {
  return [
    async (context: Context) => {
      await context.reply(field.message, { parse_mode: 'MarkdownV2' });
      await context.wizard.next();
    },
    async (context: Context) => {
      if (!context.message?.text) {
        try {
          await context.answerCbQuery();
        } catch {}

        await context.reply('Resposta invalida, tente novamente.');

        return;
      }

      if (await checkCancel(context)) return;
      if (await isInvalidText(context.message.text, context)) return;

      context.message.text = formatText(context.message.text);

      if (
        (field.type === 'currency' &&
          !currencyValidator(context.message.text)) ||
        (field.type === 'percentage' &&
          !percentageValidator(context.message.text))
      ) {
        await context.reply(
          'A resposta não está no formato esperado, tente novamente.',
        );

        return;
      }

      context.wizard.state[formName][field.key] = context.message.text;

      await context.wizard.next();
      const nextStep = context.wizard.steps[context.wizard.cursor];
      await nextStep(context);
    },
  ];
};

const optionsStep = (formName: string, field: Field) => {
  return [
    async (context: Context) => {
      await context.reply(field.message, {
        parse_mode: 'MarkdownV2',
        ...Markup.inlineKeyboard(
          field.options.map((option) =>
            Markup.button.callback(option.name, option.key),
          ),
          { columns: field?.keyboardColumns ?? 1 },
        ),
      });

      return await context.wizard.next();
    },
    async (context: Context) => {
      if (await checkCancel(context)) return;

      if (!context?.callbackQuery)
        return await context.reply('Resposta invalida, tente novamente.');

      await context.answerCbQuery();

      context.wizard.state[formName][field.key] = context.callbackQuery['data'];

      await context.wizard.next();
      const nextStep = context.wizard.steps[context.wizard.cursor];
      await nextStep(context);
    },
  ];
};

const Form = (
  config: FormConfig,
  fields: Field[],
  myFunction: (context: Context, fieldValues: any) => Promise<void>,
) => {
  const fieldSteps = [];

  fieldSteps.push(async (context: Context) => {
    context.wizard.state[config.formName] = {};

    await context.reply(
      'Você pode cancelar a operação a qualquer momento digitando /cancelar.',
    );

    await context.wizard.next();
    const nextStep = context.wizard.steps[context.wizard.cursor];
    await nextStep(context);
  });

  for (let index: number = 0; index < fields.length; index++) {
    const field = fields[index];

    if (field.type === 'options') {
      fieldSteps.push(...optionsStep(config.formName, field));
    } else fieldSteps.push(...textStep(config.formName, field));
  }

  const formWizard = new Scenes.WizardScene(
    config.formName,
    ...fieldSteps,
    async (context: Context) => {
      const fieldValues = Object.entries(context.wizard.state[config.formName]);

      const confirmationMessage = `
${fieldValues
  .map((field) => {
    const fieldConfig = fields.find((f) => f.key == field[0]);

    const value =
      fieldConfig.type === 'options'
        ? fieldConfig.options.find((option) => option.key === field[1]).name
        : field[1];

    return (
      `*${parseTextToMarkdownV2(fieldConfig.name)}:* ` +
      (fieldConfig.type === 'currency' ? 'R$ ' : '') +
      parseTextToMarkdownV2(String(value))
    );
  })
  .join('\n')}
  
Deseja continuar a operação?`;

      await context.reply(confirmationMessage, {
        parse_mode: 'MarkdownV2',
        ...Markup.inlineKeyboard([
          Markup.button.callback('Cancelar', 'cancel'),
          Markup.button.callback('Continuar', 'confirm'),
        ]),
      });

      return await context.wizard.next();
    },
    async (context: Context) => {
      if (await checkCancel(context)) return;

      if (!context?.callbackQuery)
        return await context.reply('Resposta invalida, tente novamente.');

      await context.answerCbQuery();

      const fieldValues = context.wizard.state[config.formName];

      if (
        context?.callbackQuery &&
        context?.callbackQuery['data'] === 'confirm'
      )
        await myFunction(context, fieldValues);
      else await context.reply('Operação cancelada com sucesso!');

      return await context.scene.leave();
    },
  ) as Scenes.WizardScene<any>;

  const stage = new Scenes.Stage([formWizard]);
  config.commandsService.botService.client.use(stage.middleware());
};

export default Form;
