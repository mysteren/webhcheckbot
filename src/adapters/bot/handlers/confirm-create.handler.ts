import { InlineKeyboard, type CallbackQueryContext } from "grammy";
import type { MyContext } from "../context.js";
import { DI } from "../../../di/index.js";

export const confirmCreateHandler = async (
  ctx: CallbackQueryContext<MyContext>,
) => {
  await ctx.answerCallbackQuery();

  // Проверяем, есть ли данные в сессии
  if (!ctx.session.newRecord) {
    await ctx.reply(
      "❌ Ошибка: данные не найдены. Пожалуйста, начните сначала с команды /add",
    );
    return;
  }

  // Извлекаем данные из сессии
  const userId = ctx.from!.id;
  const url = ctx.session.newRecord.url;
  const findValue = ctx.session.newRecord.find_value;

  // Вызываем бизнес-логику для создания страницы
  const responseMessage = DI.useCases.confirmCreate.run({
    userId,
    url,
    findValue,
  });

  // Очищаем сессию после успешного создания
  ctx.session.newRecord = { url: "", find_value: "" };

  // Создаём клавиатуру с кнопкой на главное меню
  const keyboard = new InlineKeyboard().text("◀️ Главное меню", "menu");

  // Отправляем ответ обратно в Telegram
  await ctx.editMessageText(responseMessage, {
    parse_mode: "Markdown",
    reply_markup: keyboard,
  });
};
