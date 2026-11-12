/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isVisible } from './day';
import { initialPositions, positionAtEnd, repositionTask, upsertSorted } from './order';
import { makeTask, type Task } from './task';

const now = '2026-11-11T10:00:00.000Z';
const today = '2026-11-11';

function list(...specs: [id: string, hidden?: boolean][]): Task[] {
  const positions = initialPositions(specs.length);
  return specs.map(([id, hidden], i) => ({
    ...makeTask({ id, title: id, position: positions[i]!, now }),
    hiddenUntil: hidden ? '2099-01-01' : null,
  }));
}

function ids(tasks: readonly Task[]) {
  return tasks.map((t) => t.id);
}

function moveVisible(all: Task[], from: number, to: number): Task[] {
  const visible = all.filter((t) => isVisible(t, today));
  const moved = repositionTask(all, visible, from, to, now);
  assert.ok(moved);
  return upsertSorted(all, moved);
}

test('перенос между видимыми не совпадает с ключом скрытого дела', () => {
  const all = list(['A'], ['H', true], ['B'], ['C']);
  const next = moveVisible(all, 2, 1); // C между A и B
  assert.deepEqual(ids(next), ['A', 'C', 'H', 'B']);
  assert.equal(new Set(next.map((t) => t.position)).size, next.length);
});

test('перенос в начало и в конец', () => {
  let all = list(['A'], ['B'], ['C']);
  all = moveVisible(all, 2, 0);
  assert.deepEqual(ids(all), ['C', 'A', 'B']);
  all = moveVisible(all, 0, 2);
  assert.deepEqual(ids(all), ['A', 'B', 'C']);
});

test('много переносов подряд — ключи остаются уникальными и упорядоченными', () => {
  let all = list(['A'], ['H1', true], ['B'], ['C'], ['H2', true], ['D']);
  for (let i = 0; i < 50; i++) {
    const visibleCount = all.filter((t) => isVisible(t, today)).length;
    const from = i % visibleCount;
    const to = (i * 7 + 1) % visibleCount;
    if (from !== to) all = moveVisible(all, from, to);
  }
  const positions = all.map((t) => t.position);
  assert.deepEqual([...positions].sort(), positions);
  assert.equal(new Set(positions).size, positions.length);
});

test('перенос на то же место ничего не меняет', () => {
  const all = list(['A'], ['B']);
  assert.equal(repositionTask(all, all, 1, 1, now), null);
});

test('upsertSorted: удалённое убирается, отмена возвращает на место', () => {
  const all = list(['A'], ['B'], ['C']);
  const b = all[1]!;
  const without = upsertSorted(all, { ...b, deleted: true });
  assert.deepEqual(ids(without), ['A', 'C']);
  assert.deepEqual(ids(upsertSorted(without, b)), ['A', 'B', 'C']);
});

test('positionAtEnd — после всех, включая скрытые', () => {
  const all = list(['A'], ['H', true]);
  assert.ok(positionAtEnd(all) > all[1]!.position);
  assert.ok(positionAtEnd([]).length > 0);
});
