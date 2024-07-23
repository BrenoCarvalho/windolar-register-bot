import { Telegraf } from 'telegraf';

const sendMessage = async (
  client: Telegraf,
  chatId: number,
  text: string,
  extra?: any,
  retryCount = 3,
  delay = 1000,
) => {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      return await client.telegram.sendMessage(chatId, text, extra);
    } catch (error) {
      if (attempt < retryCount) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

export { sendMessage };
