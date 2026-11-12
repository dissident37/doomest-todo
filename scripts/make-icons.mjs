// Генерирует иконку приложения и картинку заставки: белая галочка на синем (акцент из DESIGN.md).
// Без зависимостей: растеризация с суперсэмплингом 4×4 и PNG через zlib.
// Запуск: node scripts/make-icons.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const ASSETS = path.resolve(fileURLToPath(new URL('../assets', import.meta.url)));
const SIZE = 1024;
const ACCENT = [0x2f, 0x5b, 0xd3];
const WHITE = [0xff, 0xff, 0xff];

// Галочка из src/ui/icons.tsx (сетка 24×24).
const CHECK = [
  [4.5, 12.5],
  [9.5, 17.5],
  [19.5, 7],
];
const CHECK_CENTER = [12, 12.25];

function checkSegments(scale, strokeUnits) {
  const pts = CHECK.map(([x, y]) => [
    SIZE / 2 + (x - CHECK_CENTER[0]) * scale,
    SIZE / 2 + (y - CHECK_CENTER[1]) * scale,
  ]);
  return { segments: [[pts[0], pts[1]], [pts[1], pts[2]]], halfWidth: (strokeUnits * scale) / 2 };
}

function distToSegment(px, py, [[ax, ay], [bx, by]]) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// layers: [{ color, inside(x, y) => boolean }], рисуются по порядку поверх прозрачного фона.
function render(layers) {
  const data = new Uint8Array(SIZE * SIZE * 4);
  const N = 4;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < N; sy++) {
        for (let sx = 0; sx < N; sx++) {
          const px = x + (sx + 0.5) / N;
          const py = y + (sy + 0.5) / N;
          let color = null;
          for (const layer of layers) if (layer.inside(px, py)) color = layer.color;
          if (color) {
            r += color[0]; g += color[1]; b += color[2]; a += 1;
          }
        }
      }
      const i = (y * SIZE + x) * 4;
      if (a > 0) {
        data[i] = Math.round(r / a);
        data[i + 1] = Math.round(g / a);
        data[i + 2] = Math.round(b / a);
      }
      data[i + 3] = Math.round((a / (N * N)) * 255);
    }
  }
  return data;
}

const fullSquare = () => true;
const circle = (r) => (x, y) => Math.hypot(x - SIZE / 2, y - SIZE / 2) <= r;
const check = (scale, strokeUnits) => {
  const { segments, halfWidth } = checkSegments(scale, strokeUnits);
  return (x, y) => segments.some((s) => distToSegment(x, y, s) <= halfWidth);
};

// --- PNG ---
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(SIZE, 0);
  header.writeUInt32BE(SIZE, 4);
  header[8] = 8; // бит на канал
  header[9] = 6; // RGBA
  const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE);
  for (let y = 0; y < SIZE; y++) {
    raw[y * (SIZE * 4 + 1)] = 0; // без фильтра
    Buffer.from(rgba.buffer, y * SIZE * 4, SIZE * 4).copy(raw, y * (SIZE * 4 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function save(name, layers) {
  writeFileSync(path.join(ASSETS, name), png(render(layers)));
  console.log('ok', name);
}

// Иконка для iOS и запасная: синий квадрат на весь холст (углы скругляет система).
save('icon.png', [
  { color: ACCENT, inside: fullSquare },
  { color: WHITE, inside: check(36, 2.4) },
]);
// Адаптивная иконка Android: галочка внутри безопасной зоны (центральные 66%), фон — backgroundColor в app.json.
save('android-icon-foreground.png', [{ color: WHITE, inside: check(28, 2.4) }]);
// Тематическая (монохромная) иконка Android 13+: та же форма, цвет задаёт система.
save('android-icon-monochrome.png', [{ color: WHITE, inside: check(28, 2.4) }]);
// Заставка: синий круг с галочкой на фоне цвета приложения.
save('splash-icon.png', [
  { color: ACCENT, inside: circle(SIZE * 0.42) },
  { color: WHITE, inside: check(26, 2.4) },
]);
