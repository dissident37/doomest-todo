import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTasks } from '@/data/TasksProvider';
import { useTheme } from '@/theme/useTheme';
import { ChevronLeftIcon } from '@/ui/icons';
import { NEW_TASK_ID } from '@/ui/routes';
import { useKeyboardVisible } from '@/ui/useKeyboardVisible';

// Карточка дела (DESIGN.md, экран 3). Изменения сохраняются сразу, без кнопки «Сохранить».
// Для нового дела (id = NEW_TASK_ID) запись в базе появляется с первой буквой заголовка.
export default function TaskScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { colors, sizes } = useTheme();
  const insets = useSafeAreaInsets();
  const { findTask, add, update, remove } = useTasks();
  // Пока открыта клавиатура, нижние блоки прячем — всё место отдаём описанию.
  const keyboardVisible = useKeyboardVisible();

  const [taskId, setTaskId] = useState<string | null>(params.id === NEW_TASK_ID ? null : params.id);
  const task = taskId ? findTask(taskId) : undefined;

  // Поля ввода — локальные: пустой заголовок показываем, но в базу не пишем.
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [isRecurring, setIsRecurring] = useState(task?.isRecurring ?? false);
  const descriptionRef = useRef<TextInputInstance>(null);
  const deletingRef = useRef(false);

  const back = (
    <Pressable
      onPress={() => router.back()}
      hitSlop={8}
      style={[styles.back, { minHeight: sizes.minTouch }]}
      accessibilityRole="button"
    >
      <ChevronLeftIcon color={colors.accent} />
      <Text style={[styles.backText, { color: colors.accent }]}>Назад</Text>
    </Pressable>
  );

  if (taskId && !task) {
    if (deletingRef.current) return null;
    return (
      <SafeAreaView style={[styles.root, { paddingHorizontal: sizes.listPadding }]}>
        {back}
        <Text style={[styles.notFound, { color: colors.textSecondary }]}>Дело не найдено</Text>
      </SafeAreaView>
    );
  }

  const handleTitle = (text: string) => {
    // Заголовок — одна строка: переносы из вставки или диктовки заменяем пробелом.
    const clean = text.replace(/\s*\n\s*/g, ' ');
    setTitle(clean);
    const trimmed = clean.trim();
    if (!trimmed) return;
    if (taskId) {
      update(taskId, { title: trimmed });
    } else {
      const created = add(trimmed, { description, isRecurring });
      setTaskId(created.id);
      router.setParams({ id: created.id });
    }
  };

  const handleDescription = (text: string) => {
    setDescription(text);
    if (taskId) update(taskId, { description: text });
  };

  const handleRecurring = (value: boolean) => {
    setIsRecurring(value);
    if (taskId) update(taskId, { isRecurring: value });
  };

  const handleDelete = () => {
    if (!taskId) return;
    const name = title.trim() || task?.title || '';
    Alert.alert('Удалить насовсем?', `«${name}» пропадёт из списка. Отменить будет нельзя.`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          deletingRef.current = true;
          remove(taskId);
          router.back();
        },
      },
    ]);
  };

  const titleEmpty = title.trim() === '';

  // Переключатель «Ежедневное», «Удалить насовсем» и подпись — видны, когда клавиатура закрыта.
  const bottom = (
    <>
      <View style={[styles.recurringBlock, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.recurringRow}>
          <Text style={[styles.recurringLabel, { color: colors.text }]}>Ежедневное</Text>
          <Switch
            value={isRecurring}
            onValueChange={handleRecurring}
            trackColor={{ true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
        <Text style={[styles.recurringHint, { color: colors.textSecondary }]}>
          После «сделано» вернётся на следующий день
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {taskId ? (
          <Pressable
            onPress={handleDelete}
            style={[styles.delete, { minHeight: sizes.minTouch }]}
            accessibilityRole="button"
          >
            <Text style={[styles.deleteText, { color: colors.danger }]}>Удалить насовсем</Text>
          </Pressable>
        ) : null}
        <Text style={[styles.caption, { color: colors.textSecondary }]}>Изменения сохраняются сами</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.root} behavior="padding">
        <View style={[styles.content, { paddingHorizontal: sizes.listPadding }]}>
          {back}

          <TextInput
            value={title}
            onChangeText={handleTitle}
            placeholder="Заголовок"
            placeholderTextColor={colors.textSecondary}
            autoFocus={!taskId}
            multiline
            submitBehavior="submit"
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
            style={[styles.title, sizes.taskTitleInput, { color: colors.text }]}
          />
          {titleEmpty ? (
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              {taskId ? 'Пустой заголовок не сохранится — останется прежний' : 'Дело появится, когда введёшь заголовок'}
            </Text>
          ) : null}

          <TextInput
            ref={descriptionRef}
            value={description}
            onChangeText={handleDescription}
            placeholder="Описание"
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
            style={[styles.description, { color: colors.text }]}
          />

          {keyboardVisible ? <View style={styles.keyboardGap} /> : bottom}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, marginLeft: -4 },
  backText: { fontSize: 16 },
  notFound: { fontSize: 16, marginTop: 16 },
  title: { fontWeight: '700', marginTop: 8, paddingVertical: 4 },
  hint: { fontSize: 13, marginTop: 2 },
  description: { flex: 1, fontSize: 16, lineHeight: 22, marginTop: 12, paddingVertical: 4 },
  recurringBlock: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginTop: 12 },
  recurringRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recurringLabel: { fontSize: 16, fontWeight: '500' },
  recurringHint: { fontSize: 13, marginTop: 2 },
  footer: { alignItems: 'center', paddingTop: 8 },
  keyboardGap: { height: 8 },
  delete: { justifyContent: 'center', paddingHorizontal: 12 },
  deleteText: { fontSize: 16, fontWeight: '600' },
  caption: { fontSize: 13 },
});
