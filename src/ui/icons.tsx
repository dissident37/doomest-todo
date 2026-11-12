// Линейные иконки (DESIGN.md: stroke 2px, без эмодзи). Сетка 24×24.
import Svg, { Circle, Path } from 'react-native-svg';

type IconProps = { color: string; size?: number };

function Stroke({ color, size = 24, d }: IconProps & { d: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CheckIcon({ color, size = 20 }: IconProps) {
  return <Stroke color={color} size={size} d="M4.5 12.5l5 5L19.5 7" />;
}

export function PlusIcon({ color, size = 28 }: IconProps) {
  return <Stroke color={color} size={size} d="M12 5v14M5 12h14" />;
}

export function ChevronLeftIcon({ color, size = 22 }: IconProps) {
  return <Stroke color={color} size={size} d="M15 5l-7 7 7 7" />;
}

// «Круговые стрелки» у ежедневных дел.
export function RepeatIcon({ color, size = 18 }: IconProps) {
  return (
    <Stroke
      color={color}
      size={size}
      d={
        'M19.05 9.43A7.5 7.5 0 0 0 4.95 9.43M4 5.9l.95 3.53 2.95-2.07' +
        'M4.95 14.57a7.5 7.5 0 0 0 14.1 0M20 18.1l-.95-3.53-2.95 2.07'
      }
    />
  );
}

// ⋮ — кнопка меню.
export function DotsIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={5} r={1.8} fill={color} />
      <Circle cx={12} cy={12} r={1.8} fill={color} />
      <Circle cx={12} cy={19} r={1.8} fill={color} />
    </Svg>
  );
}
