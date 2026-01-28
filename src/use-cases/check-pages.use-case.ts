import { PageRepository } from "../repositories/page.repository.js";
import type { Page } from "../entities/page.entity.js";
import { Config } from "../infrastructure/config/index.js";

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
  async run(signal?: AbortSignal): Promise<CheckPagesResult> {
    const result: CheckPagesResult = {
      totalChecked: 0,
      successful: 0,
      failed: 0,
      details: [],
    };

    try {
      const now = Date.now();

      // 1. Находим все страницы, у которых check_time <= текущего времени
      const pagesToCheck = this.pageRepo.findPagesNeedingCheck(now);
      result.totalChecked = pagesToCheck.length;

      console.log(
        `[PagesCheckUseCase] Найдено страниц для проверки: ${pagesToCheck.length}`,
      );

      // 2. Последовательно проверяем каждую страницу
      for (const page of pagesToCheck) {
        // Проверяем сигнал прерывания
        if (signal?.aborted) {
          console.log("[PagesCheckUseCase] Прервано через AbortSignal");
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
        } catch (error) {
          result.failed++;
          console.error(
            `[PagesCheckUseCase] Ошибка при проверке страницы ${page.id}:`,
            error,
          );
        }
      }

      console.log(
        `[PagesCheckUseCase] Проверка завершена. Успешно: ${result.successful}, Ошибок: ${result.failed}`,
      );
    } catch (error) {
      console.error("[PagesCheckUseCase] Критическая ошибка:", error);
    }

    return result;
  }

  /**
   * Проверяет одну страницу
   */
  private async checkPage(page: Page, signal?: AbortSignal): Promise<string> {
    console.log(`[PagesCheckUseCase] Проверка страницы: ${page.url}`);

    let lastStatus: string;
    const nextCheckTime =
      Date.now() + Config.CHECK_MINUTES_INTERVAL * 60 * 1000;

    try {
      // 3. Выполняем HTTP запрос (signal для прерывания)
      const response = await fetch(page.url, {
        method: "GET",
        headers: {
          "User-Agent":
            "WebHCheckBot/1.0 (+https://github.com/mysteren/webhcheckbot)",
        },
        signal: signal ?? null,
      });

      // 4. Проверяем код ответа
      if (response.status !== 200) {
        lastStatus = `error_${response.status}`;
        console.log(`[PagesCheckUseCase] Статус ответа: ${response.status}`);
      } else {
        // 5. Проверяем find_value в содержимом
        const text = await response.text();

        if (text.includes(page.find_value)) {
          lastStatus = "ok";
          console.log(
            `[PagesCheckUseCase] Значение найдено: ${page.find_value}`,
          );
        } else {
          lastStatus = "error_value_not_found";
          console.log(
            `[PagesCheckUseCase] Значение не найдено: ${page.find_value}`,
          );
        }
      }
    } catch (error) {
      // Обработка ошибок сети или таймаута
      if (error instanceof Error && error.name === "AbortError") {
        lastStatus = "aborted";
        console.log(`[PagesCheckUseCase] Запрос прерван: ${page.url}`);
      } else {
        lastStatus = "error_network";
        console.error(`[PagesCheckUseCase] Сетевая ошибка:`, error);
      }
    }

    // 6. Обновляем страницу в БД
    this.pageRepo.update(page.id, {
      last_status: lastStatus,
      check_time: nextCheckTime,
    });

    console.log(
      `[PagesCheckUseCase] Обновлено: ${page.url}, статус: ${lastStatus}, следующая проверка: ${new Date(
        nextCheckTime,
      ).toISOString()}`,
    );

    return lastStatus;
  }
}
