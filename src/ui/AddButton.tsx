// Круглая кнопка «+» внизу справа. Поднимается над плашкой «Отменить».
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/theme/useTheme';

import { PlusIcon } from './icons';

type Props = {
  bottom: number;
  onPress: () => void;
};

export function AddButton({ bottom, onPress }: Props) {
  const { colors, sizes } = useTheme();
  const animatedStyle = useAnimatedStyle(() => ({ bottom: withTiming(bottom, { duration: 180 }) }), [bottom]);

  return (
    <Animated.View style={[styles.wrap, { right: sizes.fab.right }, animatedStyle]}>
      <Pressable
        onPress={onPress}
        accessibilityLabel="Добавить дело"
        style={({ pressed }) => [
          styles.button,
          {
            width: sizes.fab.size,
            height: sizes.fab.size,
            borderRadius: sizes.fab.size / 2,
            backgroundColor: colors.accent,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <PlusIcon color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
