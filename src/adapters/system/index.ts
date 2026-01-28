import { DI } from "../../di/index.js";

export const RunSystemTasks = async (signal: AbortSignal) => {
  if (signal.aborted) {
    return;
  }

  await DI.useCases.checkPages.run(signal);
};
