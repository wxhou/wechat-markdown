/**
 * Load the original site's renderer stack (AGPL-3.0) as plain scripts and
 * expose the globals the React layer needs. The files are verbatim copies
 * served from /public.
 *
 * html2canvas is NOT part of this chain — it is only needed for long-image
 * export and is injected on demand via ensureHtml2canvas().
 */
export interface StudioGlobals {
  Md2GZHThemes: {
    SPECS: Array<Record<string, unknown> & { id: string; name: string; group: string; desc: string; swatch: string }>;
    GROUPS: Array<{ id: string; name: string }>;
    LIBRARIES: Array<{ id: string; name: string; shortName: string; en: string; groups: string[] }>;
    getSpec: (id: string) => Record<string, unknown> & { id: string; name: string; group: string; desc: string; swatch: string };
    render: (tokens: unknown, spec: unknown, opt: unknown) => string;
    esc: (s: string) => string;
    plainText?: (md: string) => string;
  };
  Md2GZHConverter: {
    parse: (md: string) => Array<Record<string, unknown>>;
    plainText: (md: string) => string;
  };
  Md2GZHValidator: {
    validate: (html: string) => { errors: string[]; warnings: string[]; ok: boolean };
  };
  Md2GZHOriginalVisuals: {
    render: (
      tokens: unknown,
      spec: unknown,
      opt: Record<string, unknown>,
      assets: Record<string, string>,
      manifest: unknown,
    ) => string;
    assetRequirements: (
      themeId: string,
      levelId: string,
      motionEnabled: boolean,
      manifest: unknown,
    ) => Array<{ sourcePath: string; sitePath: string; role: string; mode: string }>;
    LEVELS: unknown;
    PROFILES: unknown;
  };
  Md2GZHOriginalData: {
    LEVELS: Array<{ id: string; order: number; name: string; short: string; description: string; motion: string }>;
    colorwaysForTheme: (themeId: string) => Array<Record<string, unknown>> | null;
    profileForTheme: (themeId: string, colorId?: string) => Record<string, unknown> | null;
    level: (id: string) => { id: string; order: number; name: string; short: string; description: string; motion: string };
  };
}

declare global {
  interface Window {
    Md2GZHThemes?: unknown;
    Md2GZHConverter?: unknown;
    Md2GZHValidator?: unknown;
    Md2GZHOriginalVisuals?: unknown;
    Md2GZHOriginalData?: unknown;
    html2canvas?: (el: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
  }
}

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded (e.g. StrictMode double-effect) — skip.
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`脚本加载失败：${src}`));
    document.head.appendChild(s);
  });
}

let globalsPromise: Promise<StudioGlobals> | null = null;

const RENDERER_SCRIPTS = [
  '/vendor/marked.min.js',
  '/themes.js',
  '/converter.js',
  '/validator.js',
  '/original-visuals-data.js',
  '/original-visuals.js',
] as const;

/** Hint the browser to fetch renderer scripts in parallel before the
 *  sequential injection starts. Called on /studio entry only, so the
 *  landing page never pays for them. */
function preloadRendererScripts(): void {
  for (const src of RENDERER_SCRIPTS) {
    if (document.querySelector(`link[rel="preload"][href="${src}"]`)) continue;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
  }
}

export function loadStudioGlobals(): Promise<StudioGlobals> {
  if (globalsPromise) return globalsPromise;
  globalsPromise = (async () => {
    preloadRendererScripts();
    // Execution order matters (converter.js reads window.Md2GZHThemes at
    // factory time); parallel downloads are primed by preloadRendererScripts,
    // so sequential awaits only serialize tiny executions.
    for (const src of RENDERER_SCRIPTS) {
      await injectScript(src);
    }
    const w = window as unknown as StudioGlobals & Window;
    if (!w.Md2GZHThemes || !w.Md2GZHConverter || !w.Md2GZHValidator || !w.Md2GZHOriginalVisuals || !w.Md2GZHOriginalData) {
      throw new Error('渲染器脚本加载不完整');
    }
    return w as unknown as StudioGlobals;
  })();
  return globalsPromise;
}

let html2canvasPromise: Promise<void> | null = null;

/** Lazy-load the vendor html2canvas on first long-image export. */
export function ensureHtml2canvas(): Promise<void> {
  if (typeof window.html2canvas === 'function') return Promise.resolve();
  if (!html2canvasPromise) {
    html2canvasPromise = injectScript('/vendor/html2canvas.min.js');
  }
  return html2canvasPromise;
}
