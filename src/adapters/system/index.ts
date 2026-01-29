import { DI } from "../../di/index.js";
import type { INotificationService } from "../../shared/interfaces/notification.interface.js";

export const RunSystemTasks = async (
  signal: AbortSignal,
  notificationService: INotificationService,
) => {
  if (signal.aborted) {
    return;
  }

  await DI.useCases.checkPages.run(notificationService, signal);
};

export const SystemTaskInit = (notificationService: INotificationService) => {
  return async (signal: AbortSignal) => {
    await RunSystemTasks(signal, notificationService);
  };
};
