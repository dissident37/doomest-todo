// Шрифт Inter (DESIGN.md, «Стиль»).
// В APK встроен при сборке плагином expo-font (app.json) — загрузки при запуске нет.
// В Expo Go плагины не работают, поэтому там шрифт грузится при старте.
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { loadAsync } from 'expo-font';
import { useEffect, useState } from 'react';

export const FONT_FAMILY = 'Inter';

const IN_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function useFontsReady(): boolean {
  const [ready, setReady] = useState(!IN_EXPO_GO);

  useEffect(() => {
    if (!IN_EXPO_GO) return;
    loadAsync([
      {
        fontFamily: FONT_FAMILY,
        fontDefinitions: [
          { path: require('../../assets/fonts/Inter-Regular.ttf'), weight: 400 },
          { path: require('../../assets/fonts/Inter-Medium.ttf'), weight: 500 },
          { path: require('../../assets/fonts/Inter-SemiBold.ttf'), weight: 600 },
          { path: require('../../assets/fonts/Inter-Bold.ttf'), weight: 700 },
        ],
      },
    ])
      .catch(() => {
        // Без Inter остаётся системный шрифт — не повод не открывать список.
      })
      .finally(() => setReady(true));
  }, []);

  return ready;
}
