// Локальная база SQLite — источник правды (SPEC.md, «Архитектура: local-first»).
// Открывается синхронно, чтобы список показывался сразу, без спиннера.
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import { createSampleTasks } from '@/domain/sampleTasks';
import { nowIso } from '@/domain/day';

import { saveTask } from './taskRepo';

export type Db = SQLiteDatabase;

const DB_NAME = 'doomest.db';

export function openDb(): Db {
  const db = openDatabaseSync(DB_NAME);
  db.execSync('PRAGMA journal_mode = WAL;');
  migrate(db);
  return db;
}

// Миграции по PRAGMA user_version. Новые шаги — только добавлять в конец.
function migrate(db: Db) {
  const version = db.getFirstSync<{ user_version: number }>('PRAGMA user_version')?.user_version ?? 0;

  if (version < 1) {
    db.withTransactionSync(() => {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS tasks (
          id           TEXT PRIMARY KEY NOT NULL,
          title        TEXT NOT NULL,
          description  TEXT NOT NULL DEFAULT '',
          is_recurring INTEGER NOT NULL DEFAULT 0,
          position     TEXT NOT NULL,
          hidden_until TEXT,
          deleted      INTEGER NOT NULL DEFAULT 0,
          created_at   TEXT NOT NULL,
          updated_at   TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS tasks_position ON tasks (position);
      `);
      // Тестовые дела — только в разработке (Expo Go), один раз при создании базы.
      if (__DEV__) {
        for (const task of createSampleTasks(nowIso())) saveTask(db, task);
      }
      db.execSync('PRAGMA user_version = 1;');
    });
  }
}
