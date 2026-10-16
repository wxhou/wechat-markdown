/**
 * 外观三态（auto/light/dark）解析。键名、取值与解析规则以本文件为锚定——
 * index.html 头部有一段按同规则先于 bundle 执行的内联防闪烁脚本，两处需保持一致。
 *
 * 存储键 md2gzh.v1.theme：'auto' | 'light' | 'dark'；缺省与非法取值一律回落 'auto'。
 */
export type ThemeMode = 'auto' | 'light' | 'dark';

export const THEME_MODE_KEY = 'md2gzh.v1.theme';

const THEME_QUERY = '(prefers-color-scheme: dark)';

export function normalizeThemeMode(raw: unknown): ThemeMode {
  return raw === 'light' || raw === 'dark' || raw === 'auto' ? raw : 'auto';
}

export function resolveThemeAppearance(
  mode: ThemeMode,
  systemDark: boolean,
): 'light' | 'dark' {
  if (mode === 'auto') return systemDark ? 'dark' : 'light';
  return mode;
}

export function readThemeMode(): ThemeMode {
  try {
    return normalizeThemeMode(localStorage.getItem(THEME_MODE_KEY));
  } catch {
    // 隐私模式等 localStorage 不可用时按跟随系统处理
    return 'auto';
  }
}

export function saveThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_MODE_KEY, mode);
  } catch {
    // 持久化失败只影响下次刷新的恢复
  }
  applyThemeAppearance(resolveThemeAppearance(mode, window.matchMedia(THEME_QUERY).matches));
}

export function applyThemeAppearance(appearance: 'light' | 'dark'): void {
  document.documentElement.dataset.theme = appearance;
}

/** App 装载：落属性并订阅系统亮暗变化（手动档下决议与系统无关，属幂等空写）。返回清理函数。 */
export function bootThemeMode(): () => void {
  const media = window.matchMedia(THEME_QUERY);
  const apply = () => applyThemeAppearance(resolveThemeAppearance(readThemeMode(), media.matches));
  apply();
  media.addEventListener('change', apply);
  return () => media.removeEventListener('change', apply);
}