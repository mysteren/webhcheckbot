import {
  Bot,
  Context,
  InlineKeyboard,
  session,
  type SessionFlavor,
} from "grammy";
import { Config } from "../../infrastructure/config/index.js";
import { startHandler } from "./handlers/start.handler.js";
import { stopCheckHandler } from "./handlers/stopCheck.handler.js";
import { menuHandler, menuHandlerFirst } from "./handlers/menu.handler.js";
import type { MyContext } from "./context.js";
import { createHandler } from "./handlers/create.handler.js";
import { messageHandler } from "./handlers/message.handler.js";
import { confirmCreateHandler } from "./handlers/confirm-create.handler.js";
import { listPagesHandler } from "./handlers/list-pages.handler.js";
import { viewPageHandler } from "./handlers/view-page.handler.js";
import { deletePageHandler } from "./handlers/delete-page.handler.js";

export const bot = new Bot<MyContext>(Config.BOT_TOKEN);

function initial() {
  return { state: "", newRecord: { url: "", find_value: "" } };
}

bot.use(session({ initial }));

// Команда /start
bot.command("start", startHandler);

// Команда /stopCheck
bot.command("stopCheck", stopCheckHandler);

//
bot.command("menu", menuHandlerFirst);

bot.callbackQuery("menu", menuHandler);

//
bot.callbackQuery("create", createHandler);

//
bot.callbackQuery("confirm_create", confirmCreateHandler);

//
bot.callbackQuery("list_pages", listPagesHandler);

// Просмотр конкретной записи
bot.callbackQuery(/^view_([a-zA-Z0-9-]+)$/, viewPageHandler);

// Просмотр конкретной записи
bot.callbackQuery(/^delete_([a-zA-Z0-9-]+)$/, deletePageHandler);

// Обработка ввода
bot.on("message:text", messageHandler);

// Обработка ошибок
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(
    `Error while handling update ${ctx.update.update_id}:`,
    err.error,
  );
});
