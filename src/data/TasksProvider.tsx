// Состояние дел для всех экранов: в памяти — копия базы, каждое действие сразу пишется в SQLite.
import { randomUUID } from 'expo-crypto';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { completeTask, isVisible, localDate, nowIso } from '@/domain/day';
import { positionAtEnd, repositionTask, upsertSorted } from '@/domain/order';
import { makeTask, type Task } from '@/domain/task';

import { openDb } from './db';
import { loadActiveTasks, saveTask } from './taskRepo';

type TasksContextValue = {
  // Дела, видимые сегодня, по порядку.
  tasks: Task[];
  findTask: (id: string) => Task | undefined;
  add: (title: string) => Task;
  // «Сделано». Возвращает прежнюю версию дела — для «Отменить».
  complete: (id: string) => Task | null;
  restore: (previous: Task) => void;
  // Перенос в видимом списке.
  move: (from: number, to: number) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [db] = useState(openDb);
  const [all, setAll] = useState<Task[]>(() => loadActiveTasks(db));
  const [today, setToday] = useState(() => localDate());

  // Актуальные значения для действий, вызванных подряд до перерисовки.
  const allRef = useRef(all);
  const todayRef = useRef(today);

  const commit = useCallback((next: Task[]) => {
    allRef.current = next;
    setAll(next);
  }, []);

  // Новый день пересчитывается при каждом возврате в приложение (SPEC.md, «Что учесть на Android»).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const date = localDate();
      todayRef.current = date;
      setToday(date);
    });
    return () => sub.remove();
  }, []);

  const tasks = useMemo(() => all.filter((t) => isVisible(t, today)), [all, today]);

  const findTask = useCallback((id: string) => allRef.current.find((t) => t.id === id), []);

  const add = useCallback(
    (title: string) => {
      const task = makeTask({ id: randomUUID(), title, position: positionAtEnd(allRef.current), now: nowIso() });
      saveTask(db, task);
      commit(upsertSorted(allRef.current, task));
      return task;
    },
    [db, commit],
  );

  const complete = useCallback(
    (id: string) => {
      const previous = allRef.current.find((t) => t.id === id);
      if (!previous) return null;
      const done = completeTask(previous, localDate(), nowIso());
      saveTask(db, done);
      commit(upsertSorted(allRef.current, done));
      return previous;
    },
    [db, commit],
  );

  const restore = useCallback(
    (previous: Task) => {
      const restored = { ...previous, updatedAt: nowIso() };
      saveTask(db, restored);
      commit(upsertSorted(allRef.current, restored));
    },
    [db, commit],
  );

  const move = useCallback(
    (from: number, to: number) => {
      const current = allRef.current;
      const visible = current.filter((t) => isVisible(t, todayRef.current));
      const moved = repositionTask(current, visible, from, to, nowIso());
      if (!moved) return;
      saveTask(db, moved);
      commit(upsertSorted(current, moved));
    },
    [db, commit],
  );

  const value = useMemo(
    () => ({ tasks, findTask, add, complete, restore, move }),
    [tasks, findTask, add, complete, restore, move],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const value = useContext(TasksContext);
  if (!value) throw new Error('useTasks вне TasksProvider');
  return value;
}
