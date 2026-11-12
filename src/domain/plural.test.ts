/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tasksCountLabel } from './plural';

test('склонение «дело»', () => {
  const cases: [number, string][] = [
    [0, '0 дел'], [1, '1 дело'], [2, '2 дела'], [4, '4 дела'], [5, '5 дел'], [11, '11 дел'],
    [12, '12 дел'], [14, '14 дел'], [21, '21 дело'], [22, '22 дела'], [25, '25 дел'], [111, '111 дел'], [101, '101 дело'],
  ];
  for (const [n, label] of cases) assert.equal(tasksCountLabel(n), label);
});
