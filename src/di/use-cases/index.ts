import { StartUseCase } from "../../use-cases/start.use-case.js";
import { StopCheckUseCase } from "../../use-cases/stop-check.use-case.js";
import { ConfirmCreateUseCase } from "../../use-cases/confirm-create.use-case.js";
import { ListPagesUseCase } from "../../use-cases/list-pages.use-case.js";
import { ViewPageUseCase } from "../../use-cases/view-page.use-case.js";
import { DeletePageUseCase } from "../../use-cases/delete-page.use-case.js";
import { repositories } from "../repositories/index.js";
import { CheckPagesUseCase } from "../../use-cases/check-pages.use-case.js";

/**
 * Use Cases с внедрёнными зависимостями
 *
 * Use cases создаются один раз и переиспользуются.
 * Зависимости внедряются через синглтоны репозиториев.
 */

export const useCases = {
  /**
   * Use case для команды /start
   */
  start: new StartUseCase(repositories.user),

  /**
   * Use case для команды /stopCheck
   */
  stopCheck: new StopCheckUseCase(repositories.user),

  /**
   * Use case для подтверждения создания страницы
   */
  confirmCreate: new ConfirmCreateUseCase(repositories.page),

  /**
   * Use case для получения списка страниц пользователя
   */
  listPages: new ListPagesUseCase(repositories.page),

  /**
   * Use case для просмотра страницы по ID
   */
  viewPage: new ViewPageUseCase(repositories.page),

  /**
   * Use case для удаления страницы
   */
  deletePage: new DeletePageUseCase(repositories.page),

  /**
   *
   */
  checkPages: new CheckPagesUseCase(repositories.page),

  // Для добавления новых use cases:
  // help: new HelpUseCase(repositories.user),
  // addPage: new AddPageUseCase(repositories.page, repositories.user),
} as const;

/**
 * Тип для безопасного доступа к use cases
 */
export type UseCases = typeof useCases;
