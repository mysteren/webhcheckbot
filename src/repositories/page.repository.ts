import Database from "better-sqlite3";
import { db } from "../infrastructure/db/sqlite.js";
import type { Page } from "../entities/page.entity.js";

export class PageRepository {
  constructor(private readonly database: Database.Database = db) {}

  /**
   * Найти страницу по ID
   */
  findById(id: string): Page | undefined {
    const stmt = this.database.prepare("SELECT * FROM pages WHERE id = ?");
    const row = stmt.get(id) as any;

    if (!row) return undefined;

    return {
      ...row,
    };
  }

  /**
   * Найти все страницы пользователя
   */
  findByUserId(userId: number): Page[] {
    const stmt = this.database.prepare(
      "SELECT * FROM pages WHERE user_id = ? ORDER BY created_at DESC",
    );
    const rows = stmt.all(userId) as any[];

    return rows.map((row) => ({
      ...row,
    }));
  }

  /**
   * Создать новую страницу
   */
  create(page: Omit<Page, "created_at" | "updated_at">): Page {
    const now = new Date().toISOString();

    const stmt = this.database.prepare(`
      INSERT INTO pages (id, user_id, url, check_time, last_status, find_value, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      page.id,
      page.user_id,
      page.url,
      page.check_time,
      page.last_status,
      page.find_value,
      now,
      now,
    );

    return {
      ...page,
      created_at: now,
      updated_at: now,
    };
  }

  /**
   * Обновить страницу
   */
  update(
    id: string,
    updates: Partial<Omit<Page, "id" | "created_at" | "updated_at">>,
  ): Page | undefined {
    const now = new Date().toISOString();
    const existing = this.findById(id);

    if (!existing) {
      return undefined;
    }

    const updatedPage = {
      ...existing,
      ...updates,
      updated_at: now,
    };

    const stmt = this.database.prepare(`
      UPDATE pages
      SET url = ?, check_time = ?, last_status = ?, find_value = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updatedPage.url,
      updatedPage.check_time,
      updatedPage.last_status,
      updatedPage.find_value,
      now,
      id,
    );

    return updatedPage;
  }

  /**
   * Обновить статус страницы
   */
  updateStatus(id: string, status: string): Page | undefined {
    return this.update(id, { last_status: status });
  }

  /**
   * Удалить страницу
   */
  delete(id: string): boolean {
    const stmt = this.database.prepare("DELETE FROM pages WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Удалить все страницы пользователя
   */
  deleteByUserId(userId: number): number {
    const stmt = this.database.prepare("DELETE FROM pages WHERE user_id = ?");
    const result = stmt.run(userId);
    return result.changes;
  }

  /**
   * Найти страницы с конкретным статусом
   */
  findByStatus(status: string): Page[] {
    const stmt = this.database.prepare(
      "SELECT * FROM pages WHERE last_status = ? ORDER BY updated_at DESC",
    );
    const rows = stmt.all(status) as any[];

    return rows.map((row) => ({
      ...row,
    }));
  }
}
