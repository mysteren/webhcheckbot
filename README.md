# Web Health Check Bot

Telegram-бот для мониторинга доступности веб-ресурсов и проверки содержимого страниц.

## 📋 Описание

Бот позволяет пользователям:
- Отслеживать доступность веб-сайтов и сервисов
- Проверять наличие определённого текста на странице
- Получать уведомления о статусах проверок
- Управлять списком отслеживаемых ресурсов

## 🚀 Возможности

- ✅ Регистрация пользователей через Telegram
- ✅ Добавление страниц в мониторинг
- ✅ Просмотр списка всех отслеживаемых страниц
- ✅ Просмотр детальной информации о странице
- ✅ Удаление страниц из мониторинга
- ✅ Включение/отключение мониторинга
- ✅ Поиск значения на странице
- ✅ UUID для идентификации страниц
- ✅ Планирование проверок через интервалы времени

## 🛠️ Технологии

- **Node.js** + **TypeScript** — типизированная runtime среда
- **Grammy** — современный Telegram Bot API framework
- **Better-SQLite3** — синхронная SQLite база данных с WAL режимом
- **Zod** — валидация конфигурации
- **Crypto** — нативная генерация UUID (Node.js 15.6.0+)

## 📁 Структура проекта

```
webhcheckbot/
├── src/
│   ├── adapters/              # Адаптеры для Telegram бота
│   │   └── bot/
│   │       ├── handlers/      # Хендлеры команд
│   │       ├── context.ts     # Расширение контекста
│   │       └── index.ts       # Инициализация бота
│   ├── app/                   # Точка входа приложения
│   │   └── index.ts
│   ├── di/                    # Dependency Injection
│   │   ├── repositories/      # Синглтоны репозиториев
│   │   ├── use-cases/         # Use cases с зависимостями
│   │   └── index.ts           # Главный DI контейнер
│   ├── entities/              # Сущности (модели данных)
│   │   ├── user.entity.ts
│   │   └── page.entity.ts
│   ├── infrastructure/        # Инфраструктурный слой
│   │   ├── config/            # Конфигурация
│   │   └── db/                # Инициализация БД
│   ├── repositories/          # Репозитории (доступ к данным)
│   │   ├── user.repository.ts
│   │   └── page.repository.ts
│   ├── shared/                # Общая утилиты
│   └── use-cases/             # Use cases (бизнес-логика)
│       ├── start.use-case.ts
│       ├── stop-check.use-case.ts
│       ├── confirm-create.use-case.ts
│       ├── list-pages.use-case.ts
│       ├── view-page.use-case.ts
│       └── delete-page.use-case.ts
├── .env                       # Переменные окружения
├── package.json
└── tsconfig.json
```

## 🏗️ Архитектура

Проект использует **Clean Architecture** с чётким разделением слоёв:

```
Adapters → Handlers → Use Cases → Repositories → Database
                 ↓            ↓
              Session       Entities
```

### Dependency Injection

Используется кастомный DI-контейнер без сторонних библиотек:

```ts
src/di/
├── repositories/   # Синглтоны репозиториев
├── use-cases/      # Use cases с внедрёнными зависимостями
└── index.ts        # Главный контейнер
```

**Преимущества:**
- ✅ Производительность — синглтоны создаются один раз
- ✅ Гибкость — легко тестировать и подменять зависимости
- ✅ Простота — без тяжёлых DI-фреймворков
- ✅ Типизация — полная поддержка TypeScript

## 📦 Установка

```bash
# Клонирование репозитория
git clone https://github.com/mysteren/webhcheckbot.git
cd webhcheckbot

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env с вашим токеном бота
```

## ⚙️ Конфигурация

Создайте файл `.env` в корне проекта:

```env
# Токен бота от @BotFather
BOT_TOKEN=your_bot_token_here

# Окружение
NODE_ENV=development

# Путь к базе данных SQLite
DB_PATH=./data.sqlite

# Порт HTTP сервера (опционально)
PORT=3000

# Уровень логирования
LOG_LEVEL=info
```

## 🎯 Использование

### Запуск в режиме разработки

```bash
npm run dev
```

### Сборка для продакшна

```bash
npm run build
npm start
```

## 📝 Команды бота

| Команда | Описание |
|---------|----------|
| `/start` | Регистрация пользователя и приветствие |
| `/menu` | Показать главное меню |
| `/add` | Добавить страницу в мониторинг |
| `/stopCheck` | Отключить мониторинг страниц |

## 💾 База данных

### Таблица `users`

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT,
  options TEXT,           -- JSON: настройки пользователя
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Таблица `pages`

```sql
CREATE TABLE pages (
  id TEXT PRIMARY KEY,     -- UUID страницы
  user_id INTEGER NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id)
  url TEXT NOT NULL,
  check_time INTEGER NOT NULL,  -- Timestamp следующей проверки
  last_status TEXT NOT NULL,    -- 'ok', 'error', 'pending'
  find_value TEXT NOT NULL,     -- Строка для поиска на странице
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**Индексы:**
- `idx_pages_user_id` — для быстрого поиска страниц пользователя
- `idx_pages_last_status` — для поиска по статусу

## 🔧 Разработка

### Добавление новой команды

1. **Создать Use Case** (`src/use-cases/new-command.use-case.ts`):

```ts
export class NewCommandUseCase {
  constructor(private readonly repo: SomeRepository) {}
  
  run(input: NewCommandInput): string {
    // Бизнес-логика
  }
}
```

2. **Добавить в DI** (`src/di/use-cases/index.ts`):

```ts
newCommand: new NewCommandUseCase(repositories.some),
```

3. **Создать Handler** (`src/adapters/bot/handlers/new-command.handler.ts`):

```ts
export const newCommandHandler = async (ctx: Context) => {
  const result = DI.useCases.newCommand.run({...});
  await ctx.reply(result);
};
```

4. **Зарегистрировать** (`src/adapters/bot/index.ts`):

```ts
bot.command("newCommand", newCommandHandler);
```

### Тестирование

```bash
npm test
```

## 📊 Поток работы

```
1. Пользователь: /start
   → Регистрация в базе данных
   → Установка User.options.pagesCheck = true

2. Пользователь: /add
   → Сохранение URL в сессии
   → Ожидание ввода значения для поиска

3. Пользователь: подтверждение (callback)
   → Генерация UUID для страницы
   → Расчёт check_time (Date.now() + 5 минут)
   → Сохранение в базу

4. Пользователь: /menu
   → Показ списка страниц
   → Кнопки для просмотра/удаления

5. Пользователь: /stopCheck
   → Удаление User.options.pagesCheck
```

## 🤝 Вклад

1. Fork проект
2. Создайте ветку для фичи (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

ISC

## 👤 Автор

**TimofeyC** — [@mysteren](https://github.com/mysteren)

## 🙏 Благодарности

- [Grammy](https://grammy.dev/) — отличный Telegram Bot фреймворк
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — быстрая SQLite библиотека
- [Zod](https://zod.dev/) — TypeScript-first schema validation

---

📞 Поддержка: Если нашли баг или есть предложение, откройте [Issue](https://github.com/mysteren/webhcheckbot/issues)