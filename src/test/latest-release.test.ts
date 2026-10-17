import { describe, expect, it } from 'vitest';
import { parseLatestRelease } from '../lib/latest-release';

/** 线上 https://wechat-markdown.pages.dev/latest.json 的真实响应（v0.2.1），非编造 */
const REAL = JSON.stringify({
  version: '0.2.1',
  tag: 'v0.2.1',
  releaseUrl: 'https://github.com/wxhou/wechat-markdown/releases/tag/v0.2.1',
  assets: {
    'macos-arm64': 'https://github.com/wxhou/wechat-markdown/releases/download/v0.2.1/_0.2.1_aarch64.dmg',
    'macos-x64': 'https://github.com/wxhou/wechat-markdown/releases/download/v0.2.1/_0.2.1_x64.dmg',
    'windows-x64': 'https://github.com/wxhou/wechat-markdown/releases/download/v0.2.1/_0.2.1_x64-setup.exe',
    'linux-appimage': 'https://github.com/wxhou/wechat-markdown/releases/download/v0.2.1/_0.2.1_amd64.AppImage',
    'linux-deb': 'https://github.com/wxhou/wechat-markdown/releases/download/v0.2.1/_0.2.1_amd64.deb',
    'linux-rpm': 'https://github.com/wxhou/wechat-markdown/releases/download/v0.2.1/-0.2.1-1.x86_64.rpm',
  },
});

function parseOrThrow(raw: unknown) {
  const release = parseLatestRelease(raw);
  if (!release) throw new Error('本应解析成功的输入返回了 null');
  return release;
}

describe('完整数据 → 三平台模型', () => {
  it('按平台分组，并保留各平台的全部条目', () => {
    const release = parseOrThrow(REAL);
    expect(release.version).toBe('0.2.1');
    expect(release.tag).toBe('v0.2.1');
    expect(release.platforms.map((p) => p.id)).toEqual(['macos', 'windows', 'linux']);
    expect(release.platforms.map((p) => p.items.length)).toEqual([2, 1, 3]);
  });

  it('下载地址与 releaseUrl 原样透传给渲染层', () => {
    const release = parseOrThrow(REAL);
    expect(release.releaseUrl).toBe('https://github.com/wxhou/wechat-markdown/releases/tag/v0.2.1');
    expect(release.platforms[0]?.items[0]).toEqual({
      key: 'macos-arm64',
      url: 'https://github.com/wxhou/wechat-markdown/releases/download/v0.2.1/_0.2.1_aarch64.dmg',
    });
  });
});

describe('macOS 两个架构同时保留', () => {
  it('Apple 芯片与 Intel 并存，不替用户择一', () => {
    const release = parseOrThrow(REAL);
    const macos = release.platforms.find((p) => p.id === 'macos');
    expect(macos?.items.map((i) => i.key)).toEqual(['macos-arm64', 'macos-x64']);
  });
});

describe('缺失或不合法 → null', () => {
  it('缺必要字段', () => {
    const { version: _version, ...noVersion } = JSON.parse(REAL) as Record<string, unknown>;
    expect(parseLatestRelease(noVersion)).toBeNull();
    const { assets: _assets, ...noAssets } = JSON.parse(REAL) as Record<string, unknown>;
    expect(parseLatestRelease(noAssets)).toBeNull();
  });

  it('空对象与空字符串一律 null', () => {
    expect(parseLatestRelease({})).toBeNull();
    expect(parseLatestRelease({ version: '', tag: '', releaseUrl: '', assets: {} })).toBeNull();
  });

  it('非法 JSON、SPA fallback 的 HTML、非对象一律 null', () => {
    expect(parseLatestRelease('{ not json')).toBeNull();
    expect(parseLatestRelease('<!doctype html><html></html>')).toBeNull();
    expect(parseLatestRelease(null)).toBeNull();
    expect(parseLatestRelease([])).toBeNull();
  });

  it('某个平台整组缺失时整体降级', () => {
    const assets = (JSON.parse(REAL) as { assets: Record<string, string> }).assets;
    delete assets['windows-x64'];
    expect(parseLatestRelease({ ...JSON.parse(REAL), assets })).toBeNull();
  });

  it('非 http(s) 的地址不计入平台', () => {
    const data = JSON.parse(REAL) as { assets: Record<string, string> };
    const hijacked = { ...data, assets: { ...data.assets, 'windows-x64': 'javascript:alert(1)' } };
    expect(parseLatestRelease(hijacked)).toBeNull();
  });
});
