// Тактильный отклик жестов. На Android — системные типы отклика (без разрешения VIBRATE).
// Ошибки глотаем: отсутствие вибрации не должно ломать жест.
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function android(type: Haptics.AndroidHaptics, fallback: () => Promise<void>) {
  // На S24 в Expo Go вибрация пока не ощущается — не разобрано, отложено.
  const run = Platform.OS === 'android' ? Haptics.performAndroidHapticsAsync(type) : fallback();
  run.catch((e: unknown) => {
    if (__DEV__) console.warn('[haptics] ошибка', e);
  });
}

// Карточка «взялась» для перетаскивания.
export function hapticDragStart() {
  android(Haptics.AndroidHaptics.Long_Press, () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

// Свайп пересёк порог «сделано» (в любую сторону).
export function hapticSwipeThreshold() {
  android(Haptics.AndroidHaptics.Context_Click, () => Haptics.selectionAsync());
}
