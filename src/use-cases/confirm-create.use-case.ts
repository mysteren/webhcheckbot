import { PageRepository } from "../repositories/page.repository.js";

export interface ConfirmCreateUseCaseInput {
  userId: number;
  url: string;
  findValue: string;
}

export class ConfirmCreateUseCase {
  constructor(private readonly pageRepo: PageRepository) {}

  run(input: ConfirmCreateUseCaseInput): string {
    // Генерируем UUID для id (нативный метод Node.js)
    const id = crypto.randomUUID();

    // check_time: текущее время + 5 минут (в миллисекундах)
    const checkTime = Date.now() + 5 * 60 * 1000;

    // Создаём страницу
    const page = this.pageRepo.create({
      id,
      user_id: input.userId,
      url: input.url,
      check_time: checkTime,
      last_status: "pending",
      find_value: input.findValue,
    });

    return (
      `✅ Страница успешно добавлена в мониторинг!\n\n` +
      `📋 Детали:\n` +
      `• URL: ${page.url}\n` +
      `• Статус: ${page.last_status}\n` +
      `• Следующая проверка: ${new Date(page.check_time).toLocaleString("ru-RU")}\n\n` +
      `ID страницы: \`${page.id}\``
    );
  }
}
