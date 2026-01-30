import { PageRepository } from "../repositories/page.repository.js";
import type { Page } from "../entities/page.entity.js";
import { Config } from "../infrastructure/config/index.js";
import type { INotificationService } from "../shared/interfaces/notification.interface.js";

export interface CheckPagesResult {
  totalChecked: number;
  successful: number;
  failed: number;
  details: Array<{ pageId: string; url: string; status: string }>;
}

export class CheckPagesUseCase {
  constructor(
    private readonly pageRepo: PageRepository,
    // private readonly userRepo: UserRepository,
  ) {}

  /**
   * Проверяет все страницы, у которых пришло время
   */
  async run(
    notificationService: INotificationService,
    signal: AbortSignal,
  ): Promise<CheckPagesResult> {
    const result: CheckPagesResult = {
      totalChecked: 0,
      successful: 0,
      failed: 0,
      details: [],
    };

    // массив результатов
    const checkResults: Array<{ page: Page; status: string }> = [];

    try {
      const now = Date.now();

      // 1. Находим все страницы, у которых check_time <= текущего времени
      const pagesToCheck = this.pageRepo.findPagesNeedingCheck(now);
      result.totalChecked = pagesToCheck.length;

      // 2. Последовательно проверяем каждую страницу
      for (const page of pagesToCheck) {
        // Проверяем сигнал прерывания
        if (signal?.aborted) {
          console.warn("[PagesCheckUseCase] Прервано через AbortSignal");
          break;
        }

        try {
          const status = await this.checkPage(page, signal);
          result.successful++;
          result.details.push({
            pageId: page.id,
            url: page.url,
            status,
          });
          checkResults.push({ page, status });
        } catch (error) {
          result.failed++;
          console.error(
            `[PagesCheckUseCase] Ошибка при проверке страницы ${page.id}:`,
            error,
          );
        }
      }

      // Отправляем отчеты пользователям
      if (notificationService && checkResults.length > 0) {
        await this.sendReportsToUsers(checkResults, notificationService);
      }
    } catch (error) {
      console.error("[PagesCheckUseCase] Критическая ошибка:", error);
    }

    return result;
  }

  /**
   * Группирует результаты по пользователям и отправляет отчеты только при ошибках
   */
  private async sendReportsToUsers(
    checkResults: Array<{ page: Page; status: string }>,
    notificationService: INotificationService,
  ): Promise<void> {
    // Группируем по user_id
    const resultsByUser = new Map<
      number,
      Array<{ page: Page; status: string }>
    >();

    for (const result of checkResults) {
      const userId = result.page.user_id;
      if (!resultsByUser.has(userId)) {
        resultsByUser.set(userId, []);
      }
      resultsByUser.get(userId)!.push(result);
    }

    // Отправляем отчет каждому пользователю, только если есть ошибки
    for (const [userId, pages] of resultsByUser.entries()) {
      // Проверяем, есть ли у пользователя страницы с ошибками (статус не "ok")
      const hasErrors = pages.some((p) => p.status !== "ok");

      if (!hasErrors) {
        continue;
      }

      try {
        await notificationService.sendCheckReport(userId, pages);
      } catch (error) {
        console.error(
          `[CheckPagesUseCase] Ошибка отправки отчета пользователю ${userId}:`,
          error,
        );
      }
    }
  }

  /**
   * Проверяет одну страницу
   */
  private async checkPage(page: Page, signal: AbortSignal): Promise<string> {
    let lastStatus: string;
    const nextCheckTime =
      Date.now() + Config.CHECK_MINUTES_INTERVAL * 60 * 1000;

    try {
      // 3. Выполняем HTTP запрос (signal для прерывания)
      // Создаем AbortController для таймаута (15 секунд)
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => {
        timeoutController.abort();
      }, 15000);

      // Объединяем сигналы для обработки и таймаута, и внешнего прерывания
      const combinedSignal = signal
        ? AbortSignal.any([signal, timeoutController.signal])
        : timeoutController.signal;

      const response = await fetch(page.url, {
        method: "GET",
        headers: {
          "User-Agent":
            "WebHCheckBot/1.0 (+https://github.com/mysteren/webhcheckbot)",
        },
        signal: combinedSignal,
      });

      // Очищаем таймер после успешного ответа
      clearTimeout(timeoutId);

      // 4. Проверяем код ответа
      if (response.status !== 200) {
        lastStatus = `error_${response.status}`;
      } else {
        // 5. Проверяем find_value в содержимом
        const text = await response.text();

        if (text.includes(page.find_value)) {
          lastStatus = "ok";
        } else {
          lastStatus = "error_value_not_found";
        }
      }
    } catch (error) {
      // Обработка ошибок сети или таймаута
      if (error instanceof Error && error.name === "AbortError") {
        // Если прервано через внешний сигнал
        if (signal?.aborted) {
          lastStatus = "aborted";
        } else {
          // Прервано по таймауту
          lastStatus = "error_timeout";
        }
      } else {
        lastStatus = "error_network";
      }
    }

    // 6. Обновляем страницу в БД
    this.pageRepo.update(page.id, {
      last_status: lastStatus,
      check_time: nextCheckTime,
    });

    return lastStatus;
  }
}
