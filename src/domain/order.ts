// Порядок дел: строковые ключи fractional-indexing.
// Массивы дел всегда отсортированы по position (сравнение строк как в SQLite BINARY).
import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing';

import type { Task } from './task';

export function initialPositions(count: number): string[] {
  return generateNKeysBetween(null, null, count);
}

export function positionAtEnd(tasks: readonly Task[]): string {
  const last = tasks[tasks.length - 1];
  return generateKeyBetween(last ? last.position : null, null);
}

// Перенос в видимом списке с индекса from на индекс to (индекс в итоговом списке).
// all — все неудалённые дела, включая скрытые до завтра; visible — то, что на экране.
// Новый ключ берётся между видимым соседом сверху и следующим делом в полном списке,
// чтобы не совпасть с ключом скрытого дела. Возвращает дело с новой позицией.
export function repositionTask(
  all: readonly Task[],
  visible: readonly Task[],
  from: number,
  to: number,
  now: string,
): Task | null {
  const moved = visible[from];
  if (!moved || from === to) return null;

  const restVisible = visible.filter((_, i) => i !== from);
  const restAll = all.filter((t) => t.id !== moved.id);
  const above = restVisible[to - 1];

  let before: string | null = null;
  let after: string | null;
  if (above) {
    before = above.position;
    const i = restAll.findIndex((t) => t.id === above.id);
    after = restAll[i + 1]?.position ?? null;
  } else {
    after = restAll[0]?.position ?? null;
  }

  return { ...moved, position: generateKeyBetween(before, after), updatedAt: now };
}

// Кладёт дело на место по position (или убирает, если оно удалено).
export function upsertSorted(tasks: readonly Task[], task: Task): Task[] {
  const rest = tasks.filter((t) => t.id !== task.id);
  if (task.deleted) return rest;
  const index = rest.findIndex((t) => t.position > task.position);
  if (index === -1) return [...rest, task];
  return [...rest.slice(0, index), task, ...rest.slice(index)];
}
