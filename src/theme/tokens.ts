// Токены из DESIGN.md.

export type ColorTokens = {
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  accent: string;
  danger: string;
  snackbarBackground: string;
  snackbarAction: string;
};

export const lightColors: ColorTokens = {
  background: '#F2F3F5',
  card: '#FFFFFF',
  cardBorder: '#E3E5E9',
  text: '#15171A',
  textSecondary: '#5F6672',
  accent: '#2F5BD3',
  danger: '#B42318',
  snackbarBackground: '#24262B',
  snackbarAction: '#A9C0FF',
};

export const darkColors: ColorTokens = {
  background: '#111214',
  card: '#1C1E22',
  cardBorder: '#2A2D33',
  text: '#F1F2F4',
  textSecondary: '#A3A9B3',
  accent: '#2F5BD3',
  // В DESIGN.md для тёмной темы не заданы — пока как в светлой.
  danger: '#B42318',
  snackbarBackground: '#24262B',
  snackbarAction: '#A9C0FF',
};

export const sizes = {
  minTouch: 44,
  listPadding: 16,
  cardGap: 10,
  card: { height: 60, radius: 30, paddingHorizontal: 22, borderWidth: 1 },
  screenTitle: { fontSize: 34, lineHeight: 40 },
  counter: { fontSize: 14, lineHeight: 20 },
  taskText: { fontSize: 16 },
  taskTitleInput: { fontSize: 26 },
  fab: { size: 64, right: 24, bottom: 32 },
  snackbar: { bottom: 24, sideInset: 16, minHeight: 56, radius: 16 },
} as const;
