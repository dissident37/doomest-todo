// Тестовые дела для прототипа списка (до подключения SQLite).
import { initialPositions } from './order';
import { makeTask, type Task } from './task';

const SAMPLES: readonly [title: string, isRecurring: boolean][] = [
  ['Купить люстру в детскую', false],
  ['Спорт', true],
  ['Английский', true],
  ['Купить стол в детскую', false],
  ['Разобрать подвал', false],
  ['Разобрать балкон', false],
  ['Очень длинное название дела, которое не помещается в одну строку и обрезается', false],
  ['Записаться к стоматологу', false],
  ['Повесить полку в коридоре', false],
  ['Растяжка', true],
  ['Починить велосипед', false],
  ['Отсканировать старые фото', false],
  ['Продать ненужное на Авито', false],
  ['Перебрать зимние вещи', false],
  ['Почитать 20 минут', true],
];

export function createSampleTasks(now: string): Task[] {
  const positions = initialPositions(SAMPLES.length);
  return SAMPLES.map(([title, isRecurring], i) =>
    makeTask({ id: `sample-${i + 1}`, title, isRecurring, position: positions[i]!, now }),
  );
}
