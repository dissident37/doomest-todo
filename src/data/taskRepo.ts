// Чтение и запись дел. Запросы короткие, поэтому синхронные: порядок записей гарантирован.
import type { SQLiteDatabase } from 'expo-sqlite';

import type { Task } from '@/domain/task';

type TaskRow = {
  id: string;
  title: string;
  description: string;
  is_recurring: number;
  position: string;
  hidden_until: string | null;
  deleted: number;
  created_at: string;
  updated_at: string;
};

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    isRecurring: row.is_recurring === 1,
    position: row.position,
    hiddenUntil: row.hidden_until,
    deleted: row.deleted === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Все неудалённые дела, включая скрытые до завтра, по порядку.
export function loadActiveTasks(db: SQLiteDatabase): Task[] {
  return db
    .getAllSync<TaskRow>('SELECT * FROM tasks WHERE deleted = 0 ORDER BY position, id')
    .map(toTask);
}

// Импорт: текущие дела помечаются удалёнными, дела из файла записываются поверх. Одна транзакция.
export function replaceAllTasks(db: SQLiteDatabase, tasks: readonly Task[], now: string): void {
  db.withTransactionSync(() => {
    db.runSync('UPDATE tasks SET deleted = 1, updated_at = ? WHERE deleted = 0', [now]);
    for (const task of tasks) saveTask(db, { ...task, deleted: false });
  });
}

export function saveTask(db: SQLiteDatabase, task: Task): void {
  db.runSync(
    `INSERT INTO tasks (id, title, description, is_recurring, position, hidden_until, deleted, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (id) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       is_recurring = excluded.is_recurring,
       position = excluded.position,
       hidden_until = excluded.hidden_until,
       deleted = excluded.deleted,
       updated_at = excluded.updated_at`,
    [
      task.id,
      task.title,
      task.description,
      task.isRecurring ? 1 : 0,
      task.position,
      task.hiddenUntil,
      task.deleted ? 1 : 0,
      task.createdAt,
      task.updatedAt,
    ],
  );
}
