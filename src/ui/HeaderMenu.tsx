// Меню по кнопке ⋮ (DESIGN.md, экран 4): затемнение и выпадающее меню.
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type Props = {
  visible: boolean;
  // Отступ меню от верха экрана — под кнопкой ⋮.
  top: number;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
};

export function HeaderMenu({ visible, top, onClose, onExport, onImport }: Props) {
  const { colors, sizes } = useTheme();

  const item = (label: string, onPress: () => void) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="menuitem"
      style={({ pressed }) => [
        styles.item,
        { minHeight: sizes.minTouch + 4, backgroundColor: pressed ? colors.background : 'transparent' },
      ]}
    >
      <Text style={[styles.itemText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <Pressable style={[StyleSheet.absoluteFill, styles.backdrop]} onPress={onClose} accessibilityLabel="Закрыть меню" />
      <View
        style={[
          styles.menu,
          { top, right: sizes.listPadding, backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        {item('Экспорт в файл', onExport)}
        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
        {item('Импорт из файла', onImport)}
        <Text style={[styles.hint, { color: colors.textSecondary, borderTopColor: colors.cardBorder }]}>
          Весь список в один JSON-файл. Импорт заменяет текущий список.
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0, 0, 0, 0.35)' },
  menu: {
    position: 'absolute',
    width: 264,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 8,
  },
  item: { justifyContent: 'center', paddingHorizontal: 16 },
  itemText: { fontSize: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
