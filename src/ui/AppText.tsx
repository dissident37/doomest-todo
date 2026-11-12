// Text и TextInput со шрифтом Inter по умолчанию. В приложении использовать их, а не из react-native.
import type { ComponentProps } from 'react';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';

import { FONT_FAMILY } from '@/theme/fonts';

const base = { fontFamily: FONT_FAMILY };

export function Text({ style, ...rest }: ComponentProps<typeof RNText>) {
  return <RNText {...rest} style={[base, style]} />;
}

export function TextInput({ style, ...rest }: ComponentProps<typeof RNTextInput>) {
  return <RNTextInput {...rest} style={[base, style]} />;
}
