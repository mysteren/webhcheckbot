import type { MyContext } from "../context.js";
import { InlineKeyboard, type Filter } from "grammy";

// Обработка ввода URL
export const messageHandler = async (ctx: Filter<MyContext, "message">) => {
  const data = ctx.message.text ?? "";

  if (ctx.session.state === "awaiting_url") {
    ctx.session.newRecord.url = data;
    ctx.session.state = "awaiting_find_value";
    await ctx.reply("URL сохранен. Теперь введите значение для поиска:");
  } else if (ctx.session.state === "awaiting_find_value") {
    ctx.session.newRecord.find_value = data;

    const text = `
✅ Проверьте данные:

🔗 URL: ${ctx.session.newRecord!.url}
🔍 Значение: ${ctx.session.newRecord!.find_value}
    `;

    const keyboard = new InlineKeyboard()
      .text("✅ Сохранить", "confirm_create")
      .text("❌ Отменить", "menu");

    await ctx.reply(text, { reply_markup: keyboard });
    ctx.session.state = "confirming";
  } else if (ctx.session.state === "editing_url") {
    // const recordId = ctx.session.editingRecordId!;
    // // Обновление URL записи
    // records[recordId].url = ctx.message.text;
    // ctx.session.state = undefined;
    // ctx.session.editingRecordId = undefined;
    // await ctx.reply("URL обновлен!", {
    //   reply_markup: getMainMenu(),
    // });
  }
};
