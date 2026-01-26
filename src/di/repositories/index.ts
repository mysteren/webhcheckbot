import { UserRepository } from "../../repositories/user.repository.js";
import { PageRepository } from "../../repositories/page.repository.js";

/**
 * Синглтоны репозиториев
 *
 * Создаются один раз при запуске приложения для оптимизации производительности.
 * Используют одно подключение к базе данных.
 */

// === РЕПОЗИТОРИИ ===

export const repositories = {
  /**
   * Репозиторий пользователей
   */
  user: new UserRepository(),

  /**
   * Репозиторий страниц
   */
  page: new PageRepository(),
} as const;

/**
 * Тип для безопасного доступа к репозиториям
 */
export type Repositories = typeof repositories;
