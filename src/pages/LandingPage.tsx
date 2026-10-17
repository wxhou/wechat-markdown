import { useEffect, useRef, useState } from 'react';
import { ArrowRightIcon, LogoSvg } from '../components/icons';
import DownloadSection from '../components/DownloadSection';
import ThemeModeControl from '../components/ThemeModeControl';

/** 主页背景候选（本地副本，assets/ 下随构建分发；来源与许可见 HERO_CREDITS） */
const HERO_BACKGROUNDS = [
  { id: 'clouds', src: 'assets/hero-cloud-sea.jpg', label: '云海' },
  { id: 'alpine', src: 'assets/mountains-hero.jpg', label: '雪山' },
  { id: 'lake', src: 'assets/hero-lake.jpg', label: '湖光' },
  { id: 'forest', src: 'assets/hero-forest.jpg', label: '森林' },
] as const;

type HeroBgId = (typeof HERO_BACKGROUNDS)[number]['id'];

/** 需署名的背景（CC BY-SA 要求署名）：只在选中它时展示。
    其余三张是 Commons 上的 CC0 实拍（湖光 纳木错乡 Unsplash / 云海 庐山含鄱口 / 森林 Fog descending on a pine forest），无需署名。
    雪山 = 祁连山脉东段岗什卡雪峰（Commons `File:岗什卡雪峰.jpg`），只取原图上 58%（裁掉下方农田）后压到 2400px 宽，故署名里标注裁切 */
const HERO_CREDITS: Partial<Record<HeroBgId, { name: string; author: string; source: string; license: string; licenseUrl: string }>> = {
  alpine: {
    name: '岗什卡雪峰（裁切）',
    author: 'NoGhost',
    source: 'https://commons.wikimedia.org/wiki/File:%E5%B2%97%E4%BB%80%E5%8D%A1%E9%9B%AA%E5%B3%B0.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
};

const HERO_BG_KEY = 'md2gzh.v1.heroBg';

function loadHeroBg(): HeroBgId {
  try {
    const saved = localStorage.getItem(HERO_BG_KEY);
    if (saved && HERO_BACKGROUNDS.some((bg) => bg.id === saved)) return saved as HeroBgId;
  } catch {
    // 隐私模式等 localStorage 不可用时走默认
  }
  return 'clouds';
}

/**
 * Landing page — faithful port of the original AGPL-3.0 site
 * (https://studio.yituohub.com/). Markup mirrors index.html; parallax and
 * custom-cursor behaviors mirror the site's inline script.
 */
export default function LandingPage() {
  const layersRef = useRef<Array<HTMLElement | null>>([]);
  const [heroBg, setHeroBg] = useState<HeroBgId>(loadHeroBg);
  const [revealed, setRevealed] = useState<ReadonlySet<HeroBgId>>(() => new Set([loadHeroBg()]));
  const credit = HERO_CREDITS[heroBg];

  const selectBg = (id: HeroBgId) => {
    setHeroBg(id);
    setRevealed((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    try {
      localStorage.setItem(HERO_BG_KEY, id);
    } catch {
      // 忽略持久化失败，仅影响下次刷新的恢复
    }
  };

  // 空闲时预载其余背景，保证切换即时淡入
  useEffect(() => {
    let cancelled = false;
    const preload = () => {
      if (!cancelled) setRevealed(new Set(HERO_BACKGROUNDS.map((bg) => bg.id)));
    };
    const dispose =
      'requestIdleCallback' in window
        ? (() => {
            const handle = requestIdleCallback(preload);
            return () => cancelIdleCallback(handle);
          })()
        : (() => {
            const t = setTimeout(preload, 1200);
            return () => clearTimeout(t);
          })();
    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layers = layersRef.current.filter(Boolean) as HTMLElement[];
    const onMouseMove = (e: MouseEvent) => {
      const mx = e.clientX / innerWidth - 0.5;
      const my = e.clientY / innerHeight - 0.5;
      layers.forEach((el) => {
        const d = parseFloat(el.dataset.depth || '0') || 0;
        el.style.transform = `translate3d(${(mx * d * 42).toFixed(1)}px,${(my * d * 16).toFixed(1)}px,0)`;
      });
    };
    addEventListener('mousemove', onMouseMove, { passive: true });
    return () => removeEventListener('mousemove', onMouseMove);
  }, []);

  useEffect(() => {
    if (!(matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      return;
    }
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add('cursor-ready');
    let tx = innerWidth / 2;
    let ty = innerHeight / 2;
    let rx = tx;
    let ry = ty;
    const onMouseMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.left = `${tx}px`;
      dot.style.top = `${ty}px`;
      const t = e.target as Element | null;
      ring.classList.toggle('hover', !!(t?.closest && t.closest('a, button')));
    };
    addEventListener('mousemove', onMouseMove, { passive: true });
    let raf = 0;
    const loop = () => {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf);
      dot.remove();
      ring.remove();
      document.body.classList.remove('cursor-ready');
    };
  }, []);

  useEffect(() => {
    document.title = '公众号排版 · 把 Markdown 排成高级感';
    document.body.className = 'landing';
    return () => {
      document.body.className = '';
    };
  }, []);

  return (
    <>
      <header className="topbar rise">
        <div className="brand">
          <span className="logo">
            <LogoSvg />
          </span>
          <div>
            <h1>公众号排版</h1>
          </div>
        </div>
        <div className="actions">
          <ThemeModeControl />
          <a className="btn ghost" href="/studio">
            进入工坊
          </a>
        </div>
      </header>

      <main className="scene">
        <div className="layer" data-depth="0.3" ref={(el) => { layersRef.current[0] = el; }} role="img" aria-label="主页背景照片">
          {HERO_BACKGROUNDS.map((bg) => (
            <div
              key={bg.id}
              className="hero-photo"
              aria-hidden="true"
              style={
                revealed.has(bg.id)
                  ? { backgroundImage: `url('${bg.src}')`, opacity: bg.id === heroBg ? 1 : 0 }
                  : { opacity: 0 }
              }
            />
          ))}
        </div>
        <div className="hero-veil" />

        <div className="fog fog-a" />
        <div className="fog fog-b" />
        <div className="fog fog-c" />

        <div className="scene-content">
          <p className="eyebrow rise">YI TUO HUB STUDIO · Typeset for WeChat</p>
          <h1 className="rise" style={{ animationDelay: '.15s' }}>
            把 Markdown，<br />排成高级感。
          </h1>
          <p className="tagline rise" style={{ animationDelay: '.3s' }}>
            Markdown → WeChat HTML · 33 Themes · 4 Collections
          </p>
          <div className="cta-row rise" style={{ animationDelay: '.45s' }}>
            <a href="/studio" className="btn primary big">
              开始排版
              <ArrowRightIcon />
            </a>
            <a href="/studio" className="link-caps">
              浏览 33 套主题
            </a>
          </div>
        </div>

        <a href="/studio" className="circle-cta rise" style={{ animationDelay: '.6s' }} aria-label="进入排版工坊">
          <ArrowRightIcon size={18} strokeWidth={1.8} />
        </a>

        <div className="bg-switcher" role="group" aria-label="切换主页背景">
          {HERO_BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              type="button"
              aria-pressed={bg.id === heroBg}
              className={bg.id === heroBg ? 'active' : undefined}
              onClick={() => selectBg(bg.id)}
            >
              {bg.label}
            </button>
          ))}
        </div>

        {credit && (
          <p className="scene-credit">
            背景：
            <a href={credit.source} target="_blank" rel="noopener noreferrer">
              {credit.name}
            </a>
            {' · 摄影 '}
            {credit.author}
            {' · '}
            <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">
              {credit.license}
            </a>
          </p>
        )}
      </main>

      <DownloadSection />
    </>
  );
}
