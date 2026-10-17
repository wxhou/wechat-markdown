import { useEffect, useState } from 'react';
import { ArrowLeftIcon } from './icons';
import { parseLatestRelease } from '../lib/latest-release';
import type { AssetKey, LatestRelease, PlatformId } from '../lib/latest-release';

const PLATFORM_TITLE: Record<PlatformId, string> = {
  macos: 'macOS',
  windows: 'Windows',
  linux: 'Linux',
};

/** 资产 key 对应界面上的格式代码与说明（打包产物原始文件名不进 UI） */
const ITEM_META: Record<AssetKey, { ext: string; label: string }> = {
  'macos-arm64': { ext: '.dmg', label: 'Apple 芯片' },
  'macos-x64': { ext: '.dmg', label: 'Intel 芯片' },
  'windows-x64': { ext: '.exe', label: '安装程序 · x64' },
  'linux-appimage': { ext: '.AppImage', label: '免安装' },
  'linux-deb': { ext: '.deb', label: 'Debian / Ubuntu' },
  'linux-rpm': { ext: '.rpm', label: 'Fedora / openSUSE' },
};

const FIRST_RUN_HINT: Record<PlatformId, string> = {
  macos: '未签名，首次打开请右键点图标 → 打开',
  windows: 'SmartScreen 提示时选「更多信息」→「仍要运行」',
  linux: 'AppImage 需先 chmod +x 再运行',
};

export default function DownloadSection() {
  const [release, setRelease] = useState<LatestRelease | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch('/latest.json', { signal: controller.signal });
        const parsed = parseLatestRelease(await res.text());
        if (controller.signal.aborted) return;
        // 区块没有 UI 兜底，不可用时只会整块消失，失败必须留痕
        if (!parsed) console.warn('latest.json 缺失或内容不合法，桌面版下载区块不渲染');
        setRelease(parsed);
      } catch (error) {
        // 中止是离开页面的正常路径，不算失败
        if (!controller.signal.aborted) {
          console.warn('latest.json 读取失败，桌面版下载区块不渲染', error);
        }
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  // 拿不到版本信息就没有可指的安装包，整块不渲染：不留空壳，也不留指向未知文件的链接
  if (!release) return null;

  return (
    <section className="download" aria-labelledby="download-title">
      <div className="download-inner">
        <p className="eyebrow">Desktop</p>
        <h2 id="download-title">装到本机，离线也能排版</h2>
        <p className="download-lead">编辑器、主题与导出都在本机完成，内容不上传。</p>
        <p className="download-meta">
          <span>
            版本 <b>v{release.version}</b>
          </span>
          <span>macOS / Windows / Linux</span>
          <span>安装包托管于 GitHub Releases</span>
        </p>

        <div className="download-columns">
          {release.platforms.map((platform) => (
            <div className="download-col" key={platform.id}>
              <h3>{PLATFORM_TITLE[platform.id]}</h3>
              <ul className="download-formats">
                {platform.items.map((item) => (
                  <li key={item.key}>
                    <a
                      className="download-format"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="download-ext">{ITEM_META[item.key].ext}</span>
                      <span className="download-label">{ITEM_META[item.key].label}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="download-hint">{FIRST_RUN_HINT[platform.id]}</p>
            </div>
          ))}
        </div>

        <div className="download-foot">
          <a href={release.releaseUrl} target="_blank" rel="noopener noreferrer">
            全部安装包与更新日志
          </a>
          <a className="download-back" href="/studio">
            <ArrowLeftIcon />
            返回工坊
          </a>
        </div>
      </div>
    </section>
  );
}
