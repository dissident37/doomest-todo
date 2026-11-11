// Сущность «Дело» из SPEC.md, раздел «Данные и хранение».
export type Task = {
  id: string; // UUID
  title: string; // обязателен
  description: string; // пустая строка, если описания нет
  isRecurring: boolean; // ежедневное дело
  position: string; // ключ порядка (fractional-indexing)
  hiddenUntil: string | null; // локальная дата YYYY-MM-DD, до которой скрыто ежедневное дело
  deleted: boolean; // мягкое удаление
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};

export function makeTask(fields: {
  id: string;
  title: string;
  position: string;
  now: string;
  isRecurring?: boolean;
}): Task {
  return {
    id: fields.id,
    title: fields.title,
    description: '',
    isRecurring: fields.isRecurring ?? false,
    position: fields.position,
    hiddenUntil: null,
    deleted: false,
    createdAt: fields.now,
    updatedAt: fields.now,
  };
}
