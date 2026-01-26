import { bot } from "../adapters/bot/index.js";
import "../infrastructure/db/sqlite.js"; // Инициализация базы данных
import "../di/index.js"; // Инициализация DI (создаёт синглтоны)

// Функция запуска
const run = async () => {
  try {
    // Запускаем long polling (бот начинает слушать сервера Telegram)
    await bot.start();
    console.info("Бот успешно запущен!");
  } catch (error) {
    console.error("Ошибка запуска бота:", error);
  }
};

// Запускаем
run();
