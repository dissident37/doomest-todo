import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/useTheme';

// Заглушка главного экрана: проверка темы и навигации на телефоне.
export default function ListScreen() {
  const { colors, sizes } = useTheme();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={{ paddingHorizontal: sizes.listPadding }}>
        <Text style={[styles.title, sizes.screenTitle, { color: colors.text }]}>Дела</Text>
        <Text style={[sizes.counter, { color: colors.textSecondary }]}>Скелет проекта</Text>

        <Pressable
          onPress={() => router.push({ pathname: '/task/[id]', params: { id: 'demo' } })}
          style={[
            styles.card,
            {
              marginTop: sizes.cardGap * 2,
              height: sizes.card.height,
              borderRadius: sizes.card.radius,
              paddingHorizontal: sizes.card.paddingHorizontal,
              borderWidth: sizes.card.borderWidth,
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text numberOfLines={1} style={[styles.cardText, sizes.taskText, { color: colors.text }]}>
            Открыть карточку дела
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { fontWeight: '700' },
  card: { justifyContent: 'center' },
  cardText: { fontWeight: '500' },
});
