import { UserRepository } from "../repositories/user.repository.js";

export interface StopCheckUseCaseInput {
  userId: number;
  firstName: string;
}

export class StopCheckUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  run(input: StopCheckUseCaseInput): string {
    // Находим пользователя
    const user = this.userRepo.findById(input.userId);

    if (!user) {
      return `Пользователь не найден. Используйте команду /start для регистрации.`;
    }

    // Проверяем, есть ли опция pagesCheck
    const hasPagesCheck = "pagesCheck" in user.options;

    if (!hasPagesCheck) {
      return (
        `Мониторинг уже отключён, ${input.firstName}. 📭\n\n` +
        `Для включения используйте команду /start`
      );
    }

    // Удаляем опцию pagesCheck
    this.userRepo.deleteOption(input.userId, "pagesCheck");

    return (
      `Мониторинг страниц отключён, ${input.firstName}. 🔕\n\n` +
      `Для повторного включения используйте команду /start`
    );
  }
}
