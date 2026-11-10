import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/useTheme';

// Заглушка карточки дела.
export default function TaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, sizes } = useTheme();

  return (
    <SafeAreaView style={[styles.root, { paddingHorizontal: sizes.listPadding }]}>
      <Pressable
        onPress={() => router.back()}
        style={[styles.back, { minHeight: sizes.minTouch, minWidth: sizes.minTouch }]}
      >
        <Text style={{ color: colors.accent, fontSize: 16 }}>Назад</Text>
      </Pressable>
      <Text style={[styles.title, sizes.taskTitleInput, { color: colors.text }]}>Карточка дела</Text>
      <Text style={{ color: colors.textSecondary }}>id: {id}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  back: { justifyContent: 'center', alignSelf: 'flex-start' },
  title: { fontWeight: '700', marginTop: 8 },
});
