// Простые линейные иконки из View (stroke 2), чтобы пока не тянуть библиотеку иконок.
import { StyleSheet, View } from 'react-native';

export function CheckIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.45,
          height: size * 0.85,
          marginTop: -size * 0.2,
          borderRightWidth: 2,
          borderBottomWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function ChevronLeftIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.5,
          height: size * 0.5,
          marginLeft: size * 0.2,
          borderLeftWidth: 2,
          borderBottomWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function PlusIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.bar, { backgroundColor: color, width: size, height: 2.5, top: (size - 2.5) / 2 }]} />
      <View style={[styles.bar, { backgroundColor: color, width: 2.5, height: size, left: (size - 2.5) / 2 }]} />
    </View>
  );
}

// Временная замена «круговых стрелок» у ежедневных дел: незамкнутый круг.
export function RepeatIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color,
        borderTopColor: 'transparent',
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', borderRadius: 2 },
});
