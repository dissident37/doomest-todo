import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { TasksProvider } from '@/data/TasksProvider';
import { useFontsReady } from '@/theme/fonts';
import { useTheme } from '@/theme/useTheme';

export default function RootLayout() {
  const { colors } = useTheme();
  // В APK всегда true сразу; ждём только в Expo Go, пока грузится Inter.
  const fontsReady = useFontsReady();
  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <TasksProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </TasksProvider>
    </GestureHandlerRootView>
  );
}
