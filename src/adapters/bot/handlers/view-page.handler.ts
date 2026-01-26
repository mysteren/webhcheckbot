import { Context, InlineKeyboard, type CallbackQueryContext } from "grammy";
import { DI } from "../../../di/index.js";
import type { MyContext } from "../context.js";

// Меню для работы с конкретной записью
function getRecordMenu(recordId: string) {
  return (
    new InlineKeyboard()
      // .text("✏️ Редактировать", `edit_${recordId}`)
      .text("🗑 Удалить", `delete_${recordId}`)
      .row()
      .text("◀️ Назад", "menu")
  );
}

export const viewPageHandler = async (ctx: CallbackQueryContext<MyContext>) => {
  await ctx.answerCallbackQuery();
  const recordId = ctx.match[1];
  if (!recordId) {
    await ctx.editMessageText("❌ ID записи не найден.");
    return;
  }

  const record = DI.useCases.viewPage.run({ pageId: recordId });

  if (!record) {
    await ctx.editMessageText("❌ Запись не найдена или была удалена.", {
      reply_markup: getRecordMenu(""),
    });
    return;
  }

  const statusEmoji =
    record.last_status === "ok"
      ? "✅"
      : record.last_status === "error"
        ? "❌"
        : "⏳";
  const nextCheck = new Date(record.check_time).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const text = `
📝 Запись:

🆔 ID: \`${record.id}\`
🔗 URL: ${record.url}
🔍 Значение для поиска: \`${record.find_value}\`
📊 Статус: ${statusEmoji} \`${record.last_status}\`
⏰ Следующая проверка: ${nextCheck}
  `;

  await ctx
    .editMessageText(text, {
      reply_markup: getRecordMenu(recordId),
      parse_mode: "Markdown",
    })
    .catch((err) => {
      console.error("Error editing message:", err);
    });
};
