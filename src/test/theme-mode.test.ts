import { describe, expect, it } from 'vitest';
import { normalizeThemeMode, resolveThemeAppearance } from '../lib/theme-mode';

describe('normalizeThemeMode', () => {
  it('合法取值原样通过', () => {
    expect(normalizeThemeMode('auto')).toBe('auto');
    expect(normalizeThemeMode('light')).toBe('light');
    expect(normalizeThemeMode('dark')).toBe('dark');
  });

  it('缺省与非法取值一律回落 auto', () => {
    expect(normalizeThemeMode(null)).toBe('auto');
    expect(normalizeThemeMode(undefined)).toBe('auto');
    expect(normalizeThemeMode('')).toBe('auto');
    expect(normalizeThemeMode('LIGHT')).toBe('auto');
    expect(normalizeThemeMode('<script>')).toBe('auto');
    expect(normalizeThemeMode(0)).toBe('auto');
  });
});

describe('resolveThemeAppearance', () => {
  it('auto 跟随系统亮暗', () => {
    expect(resolveThemeAppearance('auto', true)).toBe('dark');
    expect(resolveThemeAppearance('auto', false)).toBe('light');
  });

  it('手动档不问系统态', () => {
    expect(resolveThemeAppearance('light', true)).toBe('light');
    expect(resolveThemeAppearance('dark', false)).toBe('dark');
  });
});