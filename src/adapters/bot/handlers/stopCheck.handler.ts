import { Context } from "grammy";
import { DI } from "../../../di/index.js";

export const stopCheckHandler = async (ctx: Context) => {
  // Извлекаем данные из контекста Telegram
  const userId = ctx.from!.id;
  const firstName = ctx.from?.first_name || "Пользователь";

  // Вызываем бизнес-логику
  const responseMessage = DI.useCases.stopCheck.run({
    userId,
    firstName,
  });

  // Отправляем ответ обратно в Telegram
  await ctx.reply(responseMessage);
};
