/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BACKUP_VERSION, backupFileName, parseBackup, serializeBackup } from './backup';
import { initialPositions } from './order';
import { makeTask, type Task } from './task';

const now = '2026-11-11T10:00:00.000Z';

function sample(): Task[] {
  const [p0, p1] = initialPositions(2);
  return [
    makeTask({ id: 'a', title: 'Подвал', position: p0!, now }),
    { ...makeTask({ id: 'b', title: 'Спорт', position: p1!, now, isRecurring: true }), hiddenUntil: '2026-11-12' },
  ];
}

function parseOk(text: string): Task[] {
  const result = parseBackup(text, now);
  assert.ok(result.ok, result.ok ? '' : result.error);
  return result.tasks;
}

test('экспорт → импорт возвращает те же дела', () => {
  const tasks = sample();
  assert.deepEqual(parseOk(serializeBackup(tasks, now)), tasks);
});

test('в файле формат, версия и поля как в SPEC', () => {
  const data = JSON.parse(serializeBackup(sample(), now));
  assert.equal(data.format, 'doomest-todo');
  assert.equal(data.version, BACKUP_VERSION);
  assert.deepEqual(Object.keys(data.tasks[0]).sort(), [
    'created_at', 'deleted', 'description', 'hidden_until', 'id', 'is_recurring', 'position', 'title', 'updated_at',
  ]);
});

test('имя файла с датой', () => {
  assert.equal(backupFileName('2026-11-12'), 'doomest-todo-2026-11-12.json');
});

test('ошибки: не JSON, чужой файл, новая версия, нет списка, битое дело', () => {
  const bad = (text: string) => {
    const result = parseBackup(text, now);
    assert.equal(result.ok, false);
  };
  bad('не json');
  bad('{"hello": 1}');
  bad(JSON.stringify({ format: 'doomest-todo', version: BACKUP_VERSION + 1, tasks: [] }));
  bad(JSON.stringify({ format: 'doomest-todo', version: 1 }));
  bad(JSON.stringify({ format: 'doomest-todo', version: 1, tasks: [{ id: 'x', title: '  ' }] }));
  bad('[]');
});

test('удалённые и повторяющиеся дела пропускаются', () => {
  const tasks = parseOk(
    JSON.stringify({
      format: 'doomest-todo',
      version: 1,
      tasks: [
        { id: 'a', title: 'A', position: 'a0' },
        { id: 'a', title: 'A2', position: 'a1' },
        { id: 'd', title: 'D', position: 'a2', deleted: true },
      ],
    }),
  );
  assert.deepEqual(tasks.map((t) => t.title), ['A']);
});

test('битые или повторяющиеся ключи порядка пересоздаются в порядке файла', () => {
  const tasks = parseOk(
    JSON.stringify({
      format: 'doomest-todo',
      version: 1,
      tasks: [
        { id: 'x', title: 'X', position: 'a0' },
        { id: 'y', title: 'Y', position: 'a0' },
        { id: 'z', title: 'Z', position: '!!!' },
      ],
    }),
  );
  assert.deepEqual(tasks.map((t) => t.id), ['x', 'y', 'z']);
  const positions = tasks.map((t) => t.position);
  assert.deepEqual([...positions].sort(), positions);
  assert.equal(new Set(positions).size, 3);
});

test('недостающие поля заполняются значениями по умолчанию', () => {
  const [task] = parseOk(JSON.stringify({ format: 'doomest-todo', version: 1, tasks: [{ id: 'x', title: ' X ' }] }));
  assert.equal(task!.title, 'X');
  assert.equal(task!.description, '');
  assert.equal(task!.isRecurring, false);
  assert.equal(task!.hiddenUntil, null);
  assert.equal(task!.createdAt, now);
});
