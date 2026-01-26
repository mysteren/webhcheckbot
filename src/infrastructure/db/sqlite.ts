import BetterSqlite from "better-sqlite3";
import type { Database } from "better-sqlite3";
import { Config } from "../config/index.js";
import path from "path";
import fs from "fs";

// Создаём директорию для базы данных, если она не существует
const dbDir = path.dirname(Config.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Инициализируем подключение к базе данных
export const db: Database = new BetterSqlite(Config.DB_PATH);

// Включаем WAL режим для лучшей производительности
db.pragma("journal_mode = WAL");

// Создаём таблицу пользователей
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    options TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

// Создаём таблицу страниц
db.exec(`
  CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    check_time INTEGER NOT NULL,
    last_status TEXT NOT NULL,
    find_value TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Создаём индекс для связи страниц с пользователями
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id)
`);

// Создаём индекс для last_status для быстрого поиска проблемных страниц
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_pages_last_status ON pages(last_status)
`);
