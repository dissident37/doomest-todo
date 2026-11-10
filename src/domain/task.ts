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
