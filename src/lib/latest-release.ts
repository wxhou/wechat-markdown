/**
 * /latest.json 的解析与分组（生产者为 CI 发版流程，见 openspec/specs/site-delivery）。
 * 站点对不存在的路径回 SPA fallback——HTML 配 200，所以只能按内容判定，不能按状态码。
 */

export type AssetKey =
  | 'macos-arm64'
  | 'macos-x64'
  | 'windows-x64'
  | 'linux-appimage'
  | 'linux-deb'
  | 'linux-rpm';

export type PlatformId = 'macos' | 'windows' | 'linux';

export type DownloadItem = { key: AssetKey; url: string };

export type PlatformDownloads = { id: PlatformId; items: DownloadItem[] };

export type LatestRelease = {
  version: string;
  tag: string;
  releaseUrl: string;
  platforms: PlatformDownloads[];
};

/** 六个 key 归到三个平台；同一平台的多项按此顺序渲染（macOS 双架构、Linux 三格式） */
const PLATFORM_KEYS: ReadonlyArray<{ id: PlatformId; keys: readonly AssetKey[] }> = [
  { id: 'macos', keys: ['macos-arm64', 'macos-x64'] },
  { id: 'windows', keys: ['windows-x64'] },
  { id: 'linux', keys: ['linux-appimage', 'linux-deb', 'linux-rpm'] },
];

/** 只认 http(s)：这些值会直接进 href，挡掉 javascript: 一类的协议 */
function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const protocol = new URL(value).protocol;
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

function nonEmptyText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * 解析版本信息，`raw` 可以是已解析的对象或原始响应文本。
 * 任何缺失或不合法都返回 null——调用方据此整块不渲染，不抛异常、不返回半成品。
 */
export function parseLatestRelease(raw: unknown): LatestRelease | null {
  const data = typeof raw === 'string' ? parseJson(raw) : raw;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const record = data as Record<string, unknown>;

  const version = nonEmptyText(record.version);
  const tag = nonEmptyText(record.tag);
  const releaseUrl = nonEmptyText(record.releaseUrl);
  if (!version || !tag || !releaseUrl || !isHttpUrl(releaseUrl)) return null;

  const assets = record.assets;
  if (!assets || typeof assets !== 'object' || Array.isArray(assets)) return null;
  const assetRecord = assets as Record<string, unknown>;

  const platforms: PlatformDownloads[] = [];
  for (const { id, keys } of PLATFORM_KEYS) {
    const items: DownloadItem[] = [];
    for (const key of keys) {
      if (isHttpUrl(assetRecord[key])) items.push({ key, url: assetRecord[key] });
    }
    if (items.length === 0) return null;
    platforms.push({ id, items });
  }

  return { version, tag, releaseUrl, platforms };
}
