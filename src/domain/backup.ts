// Бэкап: весь список в один JSON-файл (SPEC.md, «Экспорт и импорт»).
// Поля дел — как в таблице SPEC (snake_case). Номер версии формата — чтобы новые версии
// приложения читали старые бэкапы.
import { generateKeyBetween } from 'fractional-indexing';

import { initialPositions } from './order';
import type { Task } from './task';

export const BACKUP_FORMAT = 'doomest-todo';
export const BACKUP_VERSION = 1;

type BackupTaskV1 = {
  id: string;
  title: string;
  description: string;
  is_recurring: boolean;
  position: string;
  hidden_until: string | null;
  deleted: boolean;
  created_at: string;
  updated_at: string;
};

type BackupFileV1 = {
  format: typeof BACKUP_FORMAT;
  version: 1;
  exported_at: string;
  tasks: BackupTaskV1[];
};

export function backupFileName(date: string): string {
  return `doomest-todo-${date}.json`;
}

export function serializeBackup(tasks: readonly Task[], now: string): string {
  const file: BackupFileV1 = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exported_at: now,
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      is_recurring: t.isRecurring,
      position: t.position,
      hidden_until: t.hiddenUntil,
      deleted: t.deleted,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
    })),
  };
  return JSON.stringify(file, null, 2);
}

export type ParseBackupResult = { ok: true; tasks: Task[] } | { ok: false; error: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Разбор и проверка файла. Удалённые дела из файла пропускаются.
// Если ключи порядка в файле битые или повторяются — порядок берётся из файла и ключи создаются заново.
export function parseBackup(text: string, now: string): ParseBackupResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Это не JSON-файл.' };
  }

  if (!isObject(data) || data.format !== BACKUP_FORMAT) {
    return { ok: false, error: 'Это не бэкап списка дел.' };
  }
  if (typeof data.version !== 'number' || !Number.isInteger(data.version) || data.version < 1) {
    return { ok: false, error: 'В файле нет номера версии формата.' };
  }
  if (data.version > BACKUP_VERSION) {
    return { ok: false, error: 'Файл сделан более новой версией приложения. Обнови приложение.' };
  }
  if (!Array.isArray(data.tasks)) {
    return { ok: false, error: 'В файле нет списка дел.' };
  }

  const tasks: Task[] = [];
  const seenIds = new Set<string>();
  for (const [i, raw] of data.tasks.entries()) {
    const task = readTaskV1(raw, now);
    if (!task) return { ok: false, error: `Дело №${i + 1} в файле повреждено.` };
    if (task.deleted || seenIds.has(task.id)) continue;
    seenIds.add(task.id);
    tasks.push(task);
  }

  return { ok: true, tasks: normalizeOrder(tasks) };
}

function readTaskV1(raw: unknown, now: string): Task | null {
  if (!isObject(raw)) return null;
  const { id, title, description, is_recurring, position, hidden_until, deleted, created_at, updated_at } = raw;

  if (typeof id !== 'string' || id.trim() === '') return null;
  if (typeof title !== 'string' || title.trim() === '') return null;

  return {
    id,
    title: title.trim(),
    description: typeof description === 'string' ? description : '',
    isRecurring: is_recurring === true || is_recurring === 1,
    position: typeof position === 'string' ? position : '',
    hiddenUntil: typeof hidden_until === 'string' && DATE_RE.test(hidden_until) ? hidden_until : null,
    deleted: deleted === true || deleted === 1,
    createdAt: typeof created_at === 'string' ? created_at : now,
    updatedAt: typeof updated_at === 'string' ? updated_at : now,
  };
}

// Сортирует по position; если ключи невалидны или повторяются — пересоздаёт их в порядке файла.
function normalizeOrder(tasks: Task[]): Task[] {
  const sorted = [...tasks].sort((a, b) => (a.position < b.position ? -1 : a.position > b.position ? 1 : 0));
  const keysOk = sorted.every(
    (t, i) => isValidKey(t.position) && (i === 0 || sorted[i - 1]!.position < t.position),
  );
  if (keysOk) return sorted;

  const positions = initialPositions(tasks.length);
  return tasks.map((t, i) => ({ ...t, position: positions[i]! }));
}

function isValidKey(key: string): boolean {
  if (key === '') return false;
  try {
    generateKeyBetween(key, null);
    return true;
  } catch {
    return false;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
