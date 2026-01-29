import { InitBot } from "../adapters/bot/index.js";
import { NotificationAdapter } from "../adapters/bot/notification.js";
import { RunSystemTasks, SystemTaskInit } from "../adapters/system/index.js";
import { Config } from "../infrastructure/config/index.js";
import { Scheduler } from "../infrastructure/scheduler/index.js";

// Функция запуска
const run = async () => {
  const schedulerInterval = Config.SCHEDULER_INTERVAL * 1000;
  const bot = InitBot(Config.BOT_TOKEN);
  const notificationService = new NotificationAdapter(bot);
  const systemTasks = SystemTaskInit(notificationService);
  const scheduler = new Scheduler(systemTasks, schedulerInterval);

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
