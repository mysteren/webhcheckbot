import { PageRepository } from "../repositories/page.repository.js";
import type { Page } from "../entities/page.entity.js";

export interface ViewPageUseCaseInput {
  pageId: string;
}

export class ViewPageUseCase {
  constructor(private readonly pageRepo: PageRepository) {}

  run(input: ViewPageUseCaseInput): Page | null {
    const page = this.pageRepo.findById(input.pageId);

    if (!page) {
      return null;
    }

    return page;
  }
}
