// «День» по времени телефона: локальная дата YYYY-MM-DD.
// Строки такого вида сравниваются как даты обычным < и >.
import type { Task } from './task';

export function localDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function nextDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  // Полдень — чтобы перевод часов не сдвинул дату.
  return localDate(new Date(y!, m! - 1, d! + 1, 12));
}

export function nowIso(): string {
  return new Date().toISOString();
}

// Видно ли дело в списке сегодня.
export function isVisible(task: Task, today: string): boolean {
  return !task.deleted && (task.hiddenUntil === null || task.hiddenUntil <= today);
}

// «Сделано»: обычное дело удаляется (мягко), ежедневное прячется до завтра.
export function completeTask(task: Task, today: string, now: string): Task {
  if (task.isRecurring) return { ...task, hiddenUntil: nextDay(today), updatedAt: now };
  return { ...task, deleted: true, updatedAt: now };
}
