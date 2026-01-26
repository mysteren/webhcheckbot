import { Context, InlineKeyboard, type CallbackQueryContext } from "grammy";
import { DI } from "../../../di/index.js";
import type { MyContext } from "../context.js";

export const deletePageHandler = async (
  ctx: CallbackQueryContext<MyContext>,
) => {
  await ctx.answerCallbackQuery();
  const recordId = ctx.match[1];

  if (!recordId) {
    await ctx.editMessageText("❌ ID записи не найден.");
    return;
  }

  // Вызываем бизнес-логику для удаления страницы
  const result = DI.useCases.deletePage.run({ pageId: recordId });

  // Кнопка для возврата к списку
  const backButton = new InlineKeyboard().text("◀️ Назад к списку", "menu");

  await ctx.editMessageText(result.message, {
    reply_markup: backButton,
  });
};
