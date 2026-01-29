import type { Bot } from "grammy";
import type { Page } from "../../entities/page.entity.js";
import type { INotificationService } from "../../shared/interfaces/notification.interface.js";
import type { MyContext } from "./context.js";

/**
 * Адаптер для отправки уведомлений через Telegram
 */
export class NotificationAdapter implements INotificationService {
  constructor(private readonly bot: Bot<MyContext>) {}

  async sendCheckReport(
    userId: number,
    pages: Array<{
      page: Page;
      status: string;
    }>,
  ): Promise<void> {
    if (pages.length === 0) {
      return;
    }

    const report = this.formatReport(pages);
    await this.bot.api.sendMessage(userId, report, { parse_mode: "HTML" });
  }

  private formatReport(pages: Array<{ page: Page; status: string }>): string {
    const successful = pages.filter((p) => p.status === "ok").length;
    const failed = pages.length - successful;

    let message = `📊 <b>Отчет о проверке страниц</b>\n\n`;
    message += `Всего проверено: <b>${pages.length}</b>\n`;
    message += `✅ Успешно: <b>${successful}</b>\n`;
    message += `❌ Ошибок: <b>${failed}</b>\n\n`;

    message += `<b>Детали:</b>\n`;
    for (const item of pages) {
      const icon = item.status === "ok" ? "✅" : "❌";
      message += `${icon} ${item.page.url}\n`;
      message += `   Статус: ${item.status}\n\n`;
    }

    return message;
  }
}
