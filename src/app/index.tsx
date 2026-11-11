import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, type FlatList } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { LinearTransition, useSharedValue } from 'react-native-reanimated';
import ReorderableList, {
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { insertByPosition, moveTask, positionAtEnd } from '@/domain/order';
import { tasksCountLabel } from '@/domain/plural';
import { createSampleTasks } from '@/domain/sampleTasks';
import { makeTask, type Task } from '@/domain/task';
import { useTheme } from '@/theme/useTheme';
import { AddButton } from '@/ui/AddButton';
import { TaskRow } from '@/ui/TaskRow';
import { UndoSnackbar } from '@/ui/UndoSnackbar';

// Сколько висит плашка «Отменить».
const UNDO_MS = 5000;

// Прототип главного экрана: тестовые дела в памяти, без SQLite.
export default function ListScreen() {
  const { colors, sizes } = useTheme();
  const insets = useSafeAreaInsets();

  const [tasks, setTasks] = useState<Task[]>(() => createSampleTasks(new Date().toISOString()));
  const [lastDone, setLastDone] = useState<Task | null>(null);
  const addedCount = useRef(0);
  const listRef = useRef<FlatList<Task>>(null);

  const isDragging = useSharedValue(false);
  const listPan = useMemo(() => Gesture.Pan(), []);

  useEffect(() => {
    if (!lastDone) return;
    const timer = setTimeout(() => setLastDone(null), UNDO_MS);
    return () => clearTimeout(timer);
  }, [lastDone]);

  const handleOpen = useCallback((id: string) => {
    router.push({ pathname: '/task/[id]', params: { id } });
  }, []);

  const handleDone = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setLastDone(task);
    },
    [tasks],
  );

  const handleUndo = useCallback(() => {
    if (!lastDone) return;
    setTasks((prev) => insertByPosition(prev, lastDone));
    setLastDone(null);
  }, [lastDone]);

  const handleReorder = useCallback(({ from, to }: ReorderableListReorderEvent) => {
    setTasks((prev) => moveTask(prev, from, to, new Date().toISOString()));
  }, []);

  const handleAdd = useCallback(() => {
    addedCount.current += 1;
    const title = `Новое дело ${addedCount.current}`;
    setTasks((prev) =>
      [...prev, makeTask({ id: randomUUID(), title, position: positionAtEnd(prev), now: new Date().toISOString() })],
    );
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const snackbarBottom = insets.bottom + sizes.snackbar.bottom;
  const fabBottom = lastDone
    ? snackbarBottom + sizes.snackbar.minHeight + 16
    : insets.bottom + sizes.fab.bottom;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { paddingHorizontal: sizes.listPadding }]}>
        <Text style={[styles.title, sizes.screenTitle, { color: colors.text }]}>Дела</Text>
        <Text style={[sizes.counter, { color: colors.textSecondary }]}>{tasksCountLabel(tasks.length)}</Text>
      </View>

      <ReorderableList
        ref={listRef}
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskRow task={item} listPan={listPan} isDragging={isDragging} onOpen={handleOpen} onDone={handleDone} />
        )}
        onReorder={handleReorder}
        onDragStart={() => {
          'worklet';
          isDragging.value = true;
        }}
        onDragEnd={() => {
          'worklet';
          isDragging.value = false;
        }}
        // Библиотека в рантайме работает со старым API Gesture.Pan(), а в типах ссылается на
        // PanGesture, который в Gesture Handler 3 стал другим типом. Приведение — только для TS.
        panGesture={listPan as never}
        itemLayoutAnimation={LinearTransition.duration(200)}
        contentContainerStyle={{
          paddingHorizontal: sizes.listPadding,
          paddingTop: sizes.cardGap * 2,
          paddingBottom: insets.bottom + sizes.fab.bottom + sizes.fab.size + 16,
        }}
      />

      {lastDone ? (
        <UndoSnackbar key={lastDone.id} title={lastDone.title} bottom={snackbarBottom} onUndo={handleUndo} />
      ) : null}
      <AddButton bottom={fabBottom} onPress={handleAdd} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 8 },
  title: { fontWeight: '700' },
});
