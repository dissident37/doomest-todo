// Карточка дела в списке: нажатие — открыть, удержание — перетаскивание,
// свайп влево или вправо — «сделано».
import { memo, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, type LegacyPanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useReorderableDrag } from 'react-native-reorderable-list';
import { scheduleOnRN } from 'react-native-worklets';

import type { Task } from '@/domain/task';
import { useTheme } from '@/theme/useTheme';

import { CheckIcon, RepeatIcon } from './icons';

// Доля ширины экрана, после которой отпущенная карточка засчитывается как «сделано».
const SWIPE_THRESHOLD = 0.35;
// Быстрый бросок засчитывается и на меньшем расстоянии.
const FLING_VELOCITY = 800;
const ANIMATION_MS = 180;
const LONG_PRESS_MS = 300;

type Props = {
  task: Task;
  // Pan-жест списка: свайп карточки должен работать одновременно с ним, иначе список его отменяет.
  listPan: LegacyPanGesture;
  isDragging: SharedValue<boolean>;
  onOpen: (id: string) => void;
  onDone: (id: string) => void;
};

export const TaskRow = memo(function TaskRow({ task, listPan, isDragging, onOpen, onDone }: Props) {
  const { colors, sizes } = useTheme();
  const { width } = useWindowDimensions();
  const drag = useReorderableDrag();
  const translateX = useSharedValue(0);

  const { id } = task;
  const finish = useCallback(() => onDone(id), [onDone, id]);
  const open = useCallback(() => onOpen(id), [onOpen, id]);

  const swipe = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-15, 15])
        .failOffsetY([-10, 10])
        .simultaneousWithExternalGesture(listPan)
        .onUpdate((e) => {
          if (isDragging.value) return;
          translateX.value = e.translationX;
        })
        .onEnd((e) => {
          const tx = translateX.value;
          const fling =
            Math.abs(e.velocityX) > FLING_VELOCITY && Math.sign(e.velocityX) === Math.sign(tx);
          if (!isDragging.value && tx !== 0 && (Math.abs(tx) > width * SWIPE_THRESHOLD || fling)) {
            translateX.value = withTiming(Math.sign(tx) * width, { duration: ANIMATION_MS }, (finished) => {
              if (finished) scheduleOnRN(finish);
            });
          } else {
            translateX.value = withTiming(0, { duration: ANIMATION_MS });
          }
        })
        .onFinalize((_e, success) => {
          if (!success) translateX.value = withTiming(0, { duration: ANIMATION_MS });
        }),
    [listPan, isDragging, translateX, width, finish],
  );

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const underlayStyle = useAnimatedStyle(() => ({ opacity: translateX.value === 0 ? 0 : 1 }));
  const leftLabelStyle = useAnimatedStyle(() => ({ opacity: translateX.value > 0 ? 1 : 0 }));
  const rightLabelStyle = useAnimatedStyle(() => ({ opacity: translateX.value < 0 ? 1 : 0 }));

  const doneLabel = task.isRecurring ? 'До завтра' : 'Сделано';
  const shape = { minHeight: sizes.card.height, borderRadius: sizes.card.radius };

  return (
    <View style={{ marginBottom: sizes.cardGap }}>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.underlay, shape, { backgroundColor: colors.accent }, underlayStyle]}
      >
        <Animated.View style={[styles.label, { left: sizes.card.paddingHorizontal }, leftLabelStyle]}>
          <CheckIcon color="#FFFFFF" />
          <Text style={styles.labelText}>{doneLabel}</Text>
        </Animated.View>
        <Animated.View style={[styles.label, { right: sizes.card.paddingHorizontal }, rightLabelStyle]}>
          <Text style={styles.labelText}>{doneLabel}</Text>
          <CheckIcon color="#FFFFFF" />
        </Animated.View>
      </Animated.View>

      <GestureDetector gesture={swipe}>
        <Animated.View style={cardStyle}>
          <Pressable
            onPress={open}
            onLongPress={drag}
            delayLongPress={LONG_PRESS_MS}
            style={[
              styles.card,
              shape,
              {
                paddingHorizontal: sizes.card.paddingHorizontal,
                borderWidth: sizes.card.borderWidth,
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text numberOfLines={1} style={[styles.title, sizes.taskText, { color: colors.text }]}>
              {task.title}
            </Text>
            {task.isRecurring ? <RepeatIcon color={colors.textSecondary} /> : null}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  underlay: { justifyContent: 'center' },
  label: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 8 },
  labelText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, fontWeight: '500' },
});
