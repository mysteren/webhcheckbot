import { PageRepository } from "../repositories/page.repository.js";
import type { Page } from "../entities/page.entity.js";

export interface ListPagesUseCaseInput {
  userId: number;
}

export class ListPagesUseCase {
  constructor(private readonly pageRepo: PageRepository) {}

  run(input: ListPagesUseCaseInput) {
    // Получаем все страницы пользователя
    const pages = this.pageRepo.findByUserId(input.userId);

    return pages;
  }
}
