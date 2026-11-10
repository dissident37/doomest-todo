import { useColorScheme } from 'react-native';

import { darkColors, lightColors, sizes } from './tokens';

export function useTheme() {
  const scheme = useColorScheme();
  return { colors: scheme === 'dark' ? darkColors : lightColors, sizes };
}
