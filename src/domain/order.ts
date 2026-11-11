// Порядок дел: строковые ключи fractional-indexing.
// Массив дел всегда отсортирован по position.
import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing';

import type { Task } from './task';

export function initialPositions(count: number): string[] {
  return generateNKeysBetween(null, null, count);
}

export function positionAtEnd(tasks: readonly Task[]): string {
  const last = tasks[tasks.length - 1];
  return generateKeyBetween(last ? last.position : null, null);
}

// Переносит дело с индекса from на индекс to (индекс в итоговом массиве).
// Меняется позиция только у перенесённого дела: новый ключ между соседями.
export function moveTask(tasks: readonly Task[], from: number, to: number, now: string): Task[] {
  const moved = tasks[from];
  if (!moved || from === to) return [...tasks];

  const rest = tasks.filter((_, i) => i !== from);
  const before = rest[to - 1]?.position ?? null;
  const after = rest[to]?.position ?? null;
  const updated: Task = { ...moved, position: generateKeyBetween(before, after), updatedAt: now };

  return [...rest.slice(0, to), updated, ...rest.slice(to)];
}

// Возвращает дело на его место по position (для «Отменить»).
export function insertByPosition(tasks: readonly Task[], task: Task): Task[] {
  const index = tasks.findIndex((t) => t.position > task.position);
  if (index === -1) return [...tasks, task];
  return [...tasks.slice(0, index), task, ...tasks.slice(index)];
}
