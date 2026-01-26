import { PageRepository } from "../repositories/page.repository.js";

export interface DeletePageUseCaseInput {
  pageId: string;
}

export class DeletePageUseCase {
  constructor(private readonly pageRepo: PageRepository) {}

  run(input: DeletePageUseCaseInput): { success: boolean; message: string } {
    const page = this.pageRepo.findById(input.pageId);

    if (!page) {
      return {
        success: false,
        message: "❌ Запись не найдена или уже была удалена.",
      };
    }

    const deleted = this.pageRepo.delete(input.pageId);

    if (deleted) {
      return {
        success: true,
        message: "✅ Запись успешно удалена из мониторинга.",
      };
    }

    return {
      success: false,
      message: "❌ Не удалось удалить запись.",
    };
  }
}
