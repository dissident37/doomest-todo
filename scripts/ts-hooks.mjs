// Хук для `node --test`: Node 24 сам запускает TypeScript, но не понимает импорты
// без расширения и алиас `@/` из tsconfig. Дописываем `.ts` и раскрываем `@/` → `src/`.
import { registerHooks } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const srcDir = path.resolve(fileURLToPath(new URL('../src', import.meta.url)));

registerHooks({
  resolve(specifier, context, nextResolve) {
    let target = specifier;
    if (target.startsWith('@/')) target = pathToFileURL(path.join(srcDir, target.slice(2))).href;

    const relative = target.startsWith('.') || target.startsWith('file:');
    if (relative && !path.extname(target)) {
      for (const ext of ['.ts', '.tsx']) {
        try {
          return nextResolve(target + ext, context);
        } catch {
          // пробуем следующее расширение
        }
      }
    }
    return nextResolve(target, context);
  },
});
