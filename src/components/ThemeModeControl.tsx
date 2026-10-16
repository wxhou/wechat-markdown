import { useState } from 'react';
import { MonitorIcon, MoonIcon, SunIcon } from './icons';
import { readThemeMode, saveThemeMode } from '../lib/theme-mode';
import type { ThemeMode } from '../lib/theme-mode';

const OPTIONS = [
  { value: 'auto', label: '跟随系统', Icon: MonitorIcon },
  { value: 'light', label: '浅色', Icon: SunIcon },
  { value: 'dark', label: '深色', Icon: MoonIcon },
] as const;

/** Header 右侧的外观分段控件（跟随系统 / 浅色 / 深色），选择持久化到 localStorage。 */
export default function ThemeModeControl() {
  const [mode, setMode] = useState<ThemeMode>(readThemeMode);
  const select = (value: ThemeMode) => {
    saveThemeMode(value);
    setMode(value);
  };
  return (
    <div className="theme-mode" role="group" aria-label="外观">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          className={'btn' + (mode === value ? ' active' : '')}
          aria-pressed={mode === value}
          title={label}
          aria-label={label}
          onClick={() => select(value)}
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}