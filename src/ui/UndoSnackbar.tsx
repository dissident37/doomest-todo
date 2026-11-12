// Плашка после свайпа: «Название» — сделано, кнопка «Отменить».
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { useTheme } from '@/theme/useTheme';
import { Text } from '@/ui/AppText';

type Props = {
  title: string;
  bottom: number;
  onUndo: () => void;
};

export function UndoSnackbar({ title, bottom, onUndo }: Props) {
  const { colors, sizes } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(180)}
      exiting={FadeOutDown.duration(180)}
      style={[
        styles.bar,
        {
          left: sizes.snackbar.sideInset,
          right: sizes.snackbar.sideInset,
          bottom,
          minHeight: sizes.snackbar.minHeight,
          borderRadius: sizes.snackbar.radius,
          backgroundColor: colors.snackbarBackground,
        },
      ]}
    >
      <Text numberOfLines={1} style={styles.text}>
        «{title}» — сделано
      </Text>
      <Pressable onPress={onUndo} hitSlop={8} style={[styles.button, { minHeight: sizes.minTouch }]}>
        <Text style={[styles.buttonText, { color: colors.snackbarAction }]}>Отменить</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    gap: 8,
  },
  text: { flex: 1, color: '#F1F2F4', fontSize: 15 },
  button: { justifyContent: 'center', paddingHorizontal: 8 },
  buttonText: { fontSize: 15, fontWeight: '600' },
});
