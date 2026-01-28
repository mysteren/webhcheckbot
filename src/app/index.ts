import { bot } from "../adapters/bot/index.js";
import { RunSystemTasks } from "../adapters/system/index.js";
import { Config } from "../infrastructure/config/index.js";
import { Scheduler } from "../infrastructure/scheduler/index.js";

// Функция запуска
const run = async () => {
  const schedulerInterval = Config.SCHEDULER_INTERVAL * 1000;
  const scheduler = new Scheduler(RunSystemTasks, schedulerInterval);
  try {
    console.log("Запускаем планировщика");
    scheduler.start();
    console.log("Планировщик запущен");
    console.log("Запускаем бота");
    // Запускаем long polling (бот начинает слушать сервера Telegram)
    await bot.start();
    console.log("Бот успешно запущен!");
  } catch (error) {
    console.error("Ошибка запуска бота:", error);
    scheduler.stop();
  }
};

// Запускаем
run();
