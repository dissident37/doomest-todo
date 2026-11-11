// Переходы между экранами.
import { router } from 'expo-router';

// id в адресе карточки, когда дело ещё не создано (кнопка «+»).
export const NEW_TASK_ID = 'new';

export function openTask(id: string) {
  router.push({ pathname: '/task/[id]', params: { id } });
}

export function openNewTask() {
  openTask(NEW_TASK_ID);
}
