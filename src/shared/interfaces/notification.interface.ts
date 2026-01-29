import type { Page } from "../../entities/page.entity.js";

export interface INotificationService {
  sendCheckReport(
    userId: number,
    pages: Array<{ page: Page; status: string }>,
  ): Promise<void>;
}
