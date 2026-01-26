import { Context, InlineKeyboard } from "grammy";
import { DI } from "../../../di/index.js";

export const menuHandler = async (ctx: Context) => {
  const userId = ctx.from!.id;

  const records = DI.useCases.listPages.run({ userId });

  // Предположим, records - массив ваших записей
  if (records.length === 0) {
    await ctx.reply("Записей пока нет", {
      reply_markup: new InlineKeyboard().text("◀️ Главное меню", "main"),
    });
    return;
  }

  const keyboard = new InlineKeyboard();
  records.forEach((record, index) => {
    keyboard.text(`${index + 1}. ${record.url}`, `view_${record.id}`).row();
  });
  keyboard.text("➕ Создать запись", "create");

  await ctx.editMessageText("Выберите запись:", {
    reply_markup: keyboard,
  });
};

export const menuHandlerFirst = async (ctx: Context) => {
  const userId = ctx.from!.id;

  const records = DI.useCases.listPages.run({ userId });

  // Предположим, records - массив ваших записей
  if (records.length === 0) {
    await ctx.reply("Записей пока нет", {
      reply_markup: new InlineKeyboard().text("◀️ Главное меню", "main"),
    });
    return;
  }

  const keyboard = new InlineKeyboard();
  records.forEach((record, index) => {
    keyboard.text(`${index + 1}. ${record.url}`, `view_${record.id}`).row();
  });
  keyboard.text("➕ Создать запись", "create");

  await ctx.reply("Выберите запись:", {
    reply_markup: keyboard,
  });
};
