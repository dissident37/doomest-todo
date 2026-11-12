import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, type FlatList } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { LinearTransition, useSharedValue } from 'react-native-reanimated';
import ReorderableList, { type ReorderableListReorderEvent } from 'react-native-reorderable-list';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { pickBackupText, shareBackup } from '@/data/backupFile';
import { useTasks } from '@/data/TasksProvider';
import { parseBackup } from '@/domain/backup';
import { nowIso } from '@/domain/day';
import { tasksCountLabel } from '@/domain/plural';
import type { Task } from '@/domain/task';
import { useTheme } from '@/theme/useTheme';
import { AddButton } from '@/ui/AddButton';
import { HeaderMenu } from '@/ui/HeaderMenu';
import { DotsIcon } from '@/ui/icons';
import { openNewTask, openTask } from '@/ui/routes';
import { TaskRow } from '@/ui/TaskRow';
import { UndoSnackbar } from '@/ui/UndoSnackbar';

// Сколько висит плашка «Отменить».
const UNDO_MS = 5000;

export default function ListScreen() {
  const { colors, sizes } = useTheme();
  const insets = useSafeAreaInsets();
  const { tasks, complete, restore, move, allTasks, replaceAll } = useTasks();

  // Прежняя версия последнего сделанного дела — для «Отменить».
  const [lastDone, setLastDone] = useState<Task | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const listRef = useRef<FlatList<Task>>(null);

  const isDragging = useSharedValue(false);
  const listPan = useMemo(() => Gesture.Pan(), []);

  useEffect(() => {
    if (!lastDone) return;
    const timer = setTimeout(() => setLastDone(null), UNDO_MS);
    return () => clearTimeout(timer);
  }, [lastDone]);

  const handleOpen = useCallback((id: string) => openTask(id), []);

  // После «+» новое дело в конце списка — при возврате прокручиваем к нему.
  const countBeforeAdd = useRef<number | null>(null);
  useFocusEffect(
    useCallback(() => {
      const before = countBeforeAdd.current;
      countBeforeAdd.current = null;
      if (before !== null && tasks.length > before) {
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      }
    }, [tasks.length]),
  );

  const handleDone = useCallback(
    (id: string) => {
      const previous = complete(id);
      if (previous) setLastDone(previous);
    },
    [complete],
  );

  const handleUndo = useCallback(() => {
    if (!lastDone) return;
    restore(lastDone);
    setLastDone(null);
  }, [lastDone, restore]);

  const handleReorder = useCallback(({ from, to }: ReorderableListReorderEvent) => move(from, to), [move]);

  const handleAdd = useCallback(() => {
    countBeforeAdd.current = tasks.length;
    openNewTask();
  }, [tasks.length]);

  const handleExport = async () => {
    setMenuOpen(false);
    try {
      await shareBackup(allTasks());
    } catch (e) {
      Alert.alert('Не удалось экспортировать', errorText(e));
    }
  };

  const handleImport = async () => {
    setMenuOpen(false);
    let text: string | null;
    try {
      text = await pickBackupText();
    } catch (e) {
      Alert.alert('Не удалось открыть файл', errorText(e));
      return;
    }
    if (text === null) return;

    const parsed = parseBackup(text, nowIso());
    if (!parsed.ok) {
      Alert.alert('Не удалось импортировать', parsed.error);
      return;
    }
    Alert.alert(
      'Заменить список?',
      `Сейчас: ${tasksCountLabel(allTasks().length)}. В файле: ${tasksCountLabel(parsed.tasks.length)}.\n` +
        'Текущий список заменится списком из файла.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Заменить',
          style: 'destructive',
          onPress: () => {
            setLastDone(null);
            replaceAll(parsed.tasks);
          },
        },
      ],
    );
  };

  const snackbarBottom = insets.bottom + sizes.snackbar.bottom;
  const fabBottom = lastDone
    ? snackbarBottom + sizes.snackbar.minHeight + 16
    : insets.bottom + sizes.fab.bottom;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { paddingHorizontal: sizes.listPadding }]}>
        <View style={styles.headerText}>
          <Text style={[styles.title, sizes.screenTitle, { color: colors.text }]}>Дела</Text>
          <Text style={[sizes.counter, { color: colors.textSecondary }]}>{tasksCountLabel(tasks.length)}</Text>
        </View>
        <Pressable
          onPress={() => setMenuOpen(true)}
          accessibilityLabel="Меню"
          hitSlop={8}
          style={[styles.menuButton, { width: sizes.minTouch, height: sizes.minTouch }]}
        >
          <DotsIcon color={colors.text} />
        </Pressable>
      </View>

      <HeaderMenu
        visible={menuOpen}
        top={insets.top + 8 + sizes.minTouch}
        onClose={() => setMenuOpen(false)}
        onExport={handleExport}
        onImport={handleImport}
      />

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
  header: { paddingTop: 8, flexDirection: 'row', alignItems: 'flex-start' },
  headerText: { flex: 1 },
  menuButton: { alignItems: 'center', justifyContent: 'center', marginRight: -8 },
  title: { fontWeight: '700' },
});

function errorText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
