// Файл бэкапа: экспорт через системное окно «Поделиться», импорт через системный выбор файла.
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { backupFileName, serializeBackup } from '@/domain/backup';
import { localDate, nowIso } from '@/domain/day';
import type { Task } from '@/domain/task';

export async function shareBackup(tasks: readonly Task[]): Promise<void> {
  const file = new File(Paths.cache, backupFileName(localDate()));
  file.create({ overwrite: true });
  await file.write(serializeBackup(tasks, nowIso()));
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Экспорт дел' });
}

// Текст выбранного файла или null, если выбор отменён.
// Фильтр по типу не ставим: мессенджеры часто отдают JSON как application/octet-stream.
export async function pickBackupText(): Promise<string | null> {
  const picked = await File.pickFileAsync();
  if (picked.canceled) return null;
  return picked.result.text();
}
