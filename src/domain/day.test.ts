/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { completeTask, isVisible, localDate, nextDay } from './day';
import { makeTask } from './task';

const now = '2026-11-11T10:00:00.000Z';

test('nextDay: конец месяца, года, високосный февраль', () => {
  assert.equal(nextDay('2026-11-30'), '2026-12-01');
  assert.equal(nextDay('2026-12-31'), '2027-01-01');
  assert.equal(nextDay('2028-02-28'), '2028-02-29');
  assert.equal(nextDay('2027-02-28'), '2027-03-01');
  assert.equal(nextDay('2026-03-28'), '2026-03-29');
});

test('localDate: локальная дата с нулями', () => {
  assert.equal(localDate(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});

test('«сделано» для ежедневного: скрыто до завтра, завтра снова видно', () => {
  const daily = makeTask({ id: 'd', title: 'Спорт', position: 'a0', now, isRecurring: true });
  const done = completeTask(daily, '2026-11-11', now);
  assert.equal(done.hiddenUntil, '2026-11-12');
  assert.equal(done.deleted, false);
  assert.equal(isVisible(done, '2026-11-11'), false);
  assert.equal(isVisible(done, '2026-11-12'), true);
  assert.equal(isVisible(done, '2026-11-20'), true);
});

test('«сделано» для обычного: мягкое удаление', () => {
  const task = makeTask({ id: 'n', title: 'Подвал', position: 'a0', now });
  const done = completeTask(task, '2026-11-11', now);
  assert.equal(done.deleted, true);
  assert.equal(isVisible(done, '2026-11-11'), false);
});
