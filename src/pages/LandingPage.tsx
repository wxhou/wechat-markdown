import { useEffect, useRef } from 'react';
import { ArrowRightIcon, LogoSvg } from '../components/icons';

/**
 * Landing page — faithful port of the original AGPL-3.0 site
 * (https://studio.yituohub.com/). Markup mirrors index.html; parallax and
 * custom-cursor behaviors mirror the site's inline script.
 */
export default function LandingPage() {
  const layersRef = useRef<Array<HTMLElement | null>>([]);

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
    document.title = 'YI TUO HUB STUDIO · 把 Markdown 排成高级感';
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
            <p>Markdown → WeChat HTML Studio</p>
          </div>
        </div>
        <div className="actions">
          <a className="btn ghost" href="/studio">
            进入工坊
          </a>
        </div>
      </header>

      <main className="scene">
        <div className="layer" data-depth="0.3" ref={(el) => { layersRef.current[0] = el; }}>
          <div className="hero-photo" role="img" aria-label="云海之上的层叠雪山" />
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
      </main>
    </>
  );
}
