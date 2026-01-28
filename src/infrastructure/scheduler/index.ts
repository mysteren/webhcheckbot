export class Scheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isExecuting = false;
  private abortController: AbortController | null = null;

  constructor(
    private readonly task: (signal: AbortSignal) => Promise<void>,
    private readonly intervalMs: number,
  ) {}

  start(): void {
    console.info(`[Scheduler] Запуск (интервал: ${this.intervalMs}ms)`);
    this.run();
    this.intervalId = setInterval(() => this.run(), this.intervalMs);
  }

  stop(): void {
    console.info("[Scheduler] Остановка...");
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  private async run(): Promise<void> {
    if (this.isExecuting) {
      console.warn("[Scheduler] Пропуск - предыдущая задача ещё выполняется");
      return;
    }

    this.isExecuting = true;
    const startTime = Date.now();
    this.abortController = new AbortController();

    try {
      const timeLeft = this.intervalMs - 100; // Оставляем 100ms запас

      // Запускаем задачу с таймаутом
      await Promise.race([
        this.task(this.abortController.signal),
        this.timeout(timeLeft),
      ]);

      const duration = Date.now() - startTime;
      console.log(`[Scheduler] Выполнено за ${duration}ms`);
    } catch (error) {
      if (error instanceof Error && error.message === "Timeout") {
        console.warn("[Scheduler] Таймаут - задача прервана");
      } else {
        console.error("[Scheduler] Ошибка:", error);
      }
    } finally {
      this.isExecuting = false;
      this.abortController = null;
    }
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => {
        this.abortController?.abort(); // ← ПРЕРЫВАЕМ ЗАДАЧУ
        reject(new Error("Timeout"));
      }, ms),
    );
  }
}
