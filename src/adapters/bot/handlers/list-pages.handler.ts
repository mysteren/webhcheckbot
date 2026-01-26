import { InlineKeyboard, type CallbackQueryContext } from "grammy";
import type { MyContext } from "../context.js";
import { DI } from "../../../di/index.js";

export const listPagesHandler = async (
  ctx: CallbackQueryContext<MyContext>,
) => {
  await ctx.answerCallbackQuery();

  const userId = ctx.from!.id;

  const records = DI.useCases.listPages.run({ userId });

  // Предположим, records - массив ваших записей
  if (records.length === 0) {
    await ctx.editMessageText("Записей пока нет", {
      reply_markup: new InlineKeyboard().text("◀️ Главное меню", "main"),
    });
    return;
  }

  const keyboard = new InlineKeyboard();
  records.forEach((record, index) => {
    keyboard.text(`${index + 1}. ${record.url}`, `view_${record.id}`).row();
  });
  keyboard.text("◀️ Главное меню", "menu");

  await ctx.editMessageText("Выберите запись:", {
    reply_markup: keyboard,
  });
};
