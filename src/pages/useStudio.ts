import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  loadStudioGlobals,
  ensureHtml2canvas,
  type StudioGlobals,
} from '../lib/studio-globals';

/* ---------- sample markdown — verbatim from the original app.js ---------- */
const SAMPLE_MD = [
  '# 一条信息如何变成行动 / 402 标准屏长文压力测试',
  '',
  '> 信息真正产生价值，不是在它被看到的时候，而是在它被理解、被选择、被执行的时候。',
  '',
  '一篇长文真正开始之前，作者面对的通常不是一个完整答案，而是一批来源不同、重要程度也不同的材料。它们可能来自采访记录、公开资料、数据表格，也可能只是一次讨论里留下的零散判断。',
  '',
  '稳定的版式首先要容纳这种不整齐。段落有长有短，句子有快有慢，但阅读宽度、行距和段间距必须保持一致，读者才不会因为内容变长而失去方向。',
  '',
  '## 看见信号',
  '',
  '当材料被整理成问题，文章才会出现一条可阅读的路径。每个章节只承担一个推进动作：提出问题、补充证据、解释变化，最后回到读者真正需要的结论。',
  '',
  '移动端最容易出现的错误，是为了塞入更多信息而不断缩小文字。这样虽然一屏能看到更多内容，却会让读者在真实手机上频繁放大或跳读。',
  '',
  '因此这里让正文保持可辨识的字号，同时限制文字栏宽度。较长句子自然换成两到三行，短句则保留停顿，不用人为把所有段落拉成同样的高度。',
  '',
  '![横图测试：图像进入正文节奏，但不挤压相邻段落](placeholder://16-9)',
  '',
  '### 三级标题与行内效果',
  '',
  '同一段内集中检查 **关键词强调**、*斜体补充*、~~删除内容~~、==荧光高亮==、`行内代码`，以及 [链接文字](https://example.com)。',
  '',
  '- 无序列表支持关键词强调与自然换行',
  '- 行内代码不会抬高整行，也不会突破正文宽度',
  '- 较长列表项换行后仍与正文起点保持对齐',
  '',
  '1. 先整理材料与章节关系',
  '2. 再验证图片、引用和数据组件',
  '3. 最后检查公众号复制后的可编辑性',
  '',
  '---',
  '',
  '## 形成路径',
  '',
  '图片不应该只是插在段落之间。它需要明确的上下间隔、稳定的圆角和图注位置，才能成为论证的一部分，而不是突然打断阅读的广告位。',
  '',
  '正文模板的目标不是让每一页都一样，而是让不同长度的内容都遵守同一套阅读节奏。连续滚动几屏之后，字号、行距和左右边界不能发生变化。',
  '',
  '![第二张图片：连续多图与长图注测试](placeholder://4-5)',
  '',
  '> 装饰应该退到正确的位置：读者先看见标题，再进入正文，需要证据时遇到图片，需要停顿时遇到引用。',
  '',
  '## 验证过程',
  '',
  '版式是否可靠，不能只看一篇短样张。需要把多段文字、连续图片、引用和列表同时放进来，观察它们在真实宽度下是否发生重叠、截断或不合理的大空洞。',
  '',
  '这次压力测试保留原画廊的视觉骨架，只把文字独立为阅读层。左右装饰仍然存在，但它们不再占用正文的有效宽度，也不会抢走章节标题的视觉中心。',
  '',
  '![第三张图片：超宽信息图位置测试](placeholder://2.35-1)',
  '',
  '```javascript',
  'function layout(article) {',
  '  return article.sections.map(renderSection);',
  '}',
  '```',
  '',
  '| 项目 | 基础排版 | 高级排版 |',
  '|------|---------|---------|',
  '| 正文 | 稳定段落 | 完整对齐 |',
  '| 图片 | 图注与边界 | 完整对齐 |',
  '| 代码 | 行内与块级 | 完整对齐 |',
  '| 表格 | 多列数据 | 完整对齐 |',
  '',
  '## 回到结果',
  '',
  '稳定的长文版式最终会让视觉系统负责引导，而不是要求内容迁就装饰。如果一段话特别长，它仍然应该保持舒适的行长。',
  '',
  '如果一段话很短，也不需要额外填充。统一的段落节奏会自然留下空白，让短句成为强调，而不是看起来像遗漏了内容。',
  '',
  '最后回到文章的核心结论：版式要能够承受内容变化。只有通过长文和多图压力测试，才能确认它不是一张好看的样片，而是一套真正可用的公众号模板。',
  '',
  '我是 蓝梦，持续整理公众号视觉与长文排版。',
].join('\n');

type Spec = StudioGlobals['Md2GZHThemes']['SPECS'][number];
type Library = StudioGlobals['Md2GZHThemes']['LIBRARIES'][number];
type Level = StudioGlobals['Md2GZHOriginalData']['LEVELS'][number];
type Colorway = { id: string; name: string; colors?: Record<string, string> };

export type PreviewWidth = 'fit' | '375' | '402' | '440';
export type OpenPopover = 'theme' | 'level' | 'color' | null;

export interface Badge {
  cls: string;
  text: string;
}

export interface ToastState {
  text: string;
  /** Optional action button (e.g. 清空撤销). */
  action?: { label: string; run: () => void };
}

interface ConvertOpts {
  levelId: string;
  motionEnabled: boolean;
  colorId: string;
}

/* ---------- session persistence (project addition) ---------- */
const STORE_KEY = 'md2gzh.v1.session';

interface StoredSession {
  markdown: string;
  author: string;
  themeId: string;
  library: string;
  levelId: string;
  motionEnabled: boolean;
  colorId: string;
  previewWidth: PreviewWidth;
}

function loadSession(): Partial<StoredSession> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Partial<StoredSession>) : {};
  } catch {
    return {};
  }
}

export function useStudio() {
  const saved = useMemo(loadSession, []);
  const [G, setG] = useState<StudioGlobals | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [markdown, setMarkdown] = useState(
    typeof saved.markdown === 'string' ? saved.markdown : SAMPLE_MD,
  );
  const [author, setAuthor] = useState(saved.author ?? '');
  const [themeId, setThemeId] = useState(saved.themeId ?? 'ocean');
  const [library, setLibrary] = useState(saved.library ?? 'base');
  const [levelId, setLevelId] = useState(saved.levelId ?? 'motion-themed-frame');
  const [motionEnabled, setMotionEnabled] = useState(saved.motionEnabled ?? true);
  const [colorId, setColorId] = useState(saved.colorId ?? 'default');
  const [previewWidth, setPreviewWidth] = useState<PreviewWidth>(saved.previewWidth ?? 'fit');
  const [group, setGroup] = useState('all');

  const [openPop, setOpenPop] = useState<OpenPopover>(null);

  const [badge, setBadge] = useState<Badge>({ cls: 'badge', text: '校验中…' });
  const [panelLines, setPanelLines] = useState<Array<{ kind: 'err' | 'warn'; text: string }>>([]);
  const [panelHidden, setPanelHidden] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  const previewFrame = useRef<HTMLIFrameElement | null>(null);
  const previewWrap = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const renderIdRef = useRef(0);
  const pendingRef = useRef<Promise<string>>(Promise.resolve(''));
  const htmlRef = useRef('');
  const assetsCache = useRef<Record<string, string>>({});
  const manifestRef = useRef<unknown>(null);
  const abortRef = useRef<AbortController | null>(null);
  const dirtyRef = useRef(true);
  const persistTimer = useRef<number | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  useEffect(() => {
    loadStudioGlobals()
      .then(setG)
      .catch((e: Error) => setLoadError(e.message));
  }, []);

  const Gv = useCallback(() => {
    if (!G) throw new Error('渲染器尚未就绪');
    return G;
  }, [G]);

  const ready = !!G;

  /* ---------- theme / library helpers (ported from app.js) ---------- */
  const specs = useMemo(() => (G ? G.Md2GZHThemes.SPECS : []), [G]);
  const libraries = useMemo(() => (G ? G.Md2GZHThemes.LIBRARIES : []), [G]);
  const groups = useMemo(() => (G ? G.Md2GZHThemes.GROUPS : []), [G]);

  const spec: Spec | null = useMemo(() => {
    if (!G) return null;
    return G.Md2GZHThemes.getSpec(themeId);
  }, [themeId, G]);

  const libraryThemes = useCallback(
    (lib: Library): Spec[] =>
      specs.filter((s) => lib.groups.indexOf(s.group as string) !== -1),
    [specs],
  );

  const libraryForTheme = useCallback(
    (s: Spec): Library =>
      libraries.find((lib) => lib.groups.indexOf(s.group as string) !== -1) ?? libraries[0]!,
    [libraries],
  );

  const currentSpec = spec;
  const selectedLibrary = useMemo(
    () => (currentSpec ? libraryForTheme(currentSpec) : libraries[0]),
    [currentSpec, libraryForTheme, libraries],
  );
  const isOriginalSpec = !!currentSpec && (currentSpec.group as string) === 'motion';

  const levels = useMemo(() => (G ? G.Md2GZHOriginalData.LEVELS : []), [G]);
  const currentLevel: Level | null = useMemo(() => {
    if (!G) return null;
    return G.Md2GZHOriginalData.level(levelId);
  }, [levelId, G]);
  const isDynamicLevel = !!currentLevel && currentLevel.motion !== 'none';

  const colorways: Colorway[] | null = useMemo(() => {
    if (!G || !isOriginalSpec) return null;
    return (G.Md2GZHOriginalData.colorwaysForTheme(themeId) ?? null) as Colorway[] | null;
  }, [themeId, isOriginalSpec, G]);
  const colorVisible = isOriginalSpec && !!currentLevel && currentLevel.order > 1 && !!colorways;

  const colorwayDots = useCallback(
    (cw: Colorway): Array<{ key: string; bg: string }> => {
      if (!G) return [];
      const p = G.Md2GZHOriginalData.profileForTheme(themeId, cw.id) as Record<string, string> | null;
      if (!p) return [];
      const roles = ['paper', 'surface', 'accent', 'accent2', 'line'];
      return roles.map((r, i) => ({ key: `${cw.id}-${i}`, bg: p[r] ?? '#ccc' }));
    },
    [themeId, G],
  );

  /* ---------- popover outside-click / Escape close ---------- */
  useEffect(() => {
    if (!openPop) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest('.picker-slot, .level-picker-slot, .color-picker-slot')) {
        setOpenPop(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPop(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openPop]);

  /* ---------- session persistence (project addition) ---------- */
  useEffect(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => {
      try {
        const data: StoredSession = {
          markdown, author, themeId, library, levelId, motionEnabled, colorId, previewWidth,
        };
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
      } catch {
        /* quota / private mode */
      }
    }, 1000);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [markdown, author, themeId, library, levelId, motionEnabled, colorId, previewWidth]);

  /* ---------- preview plumbing (ported from app.js) ---------- */
  const previewShell = (html: string, advanced: boolean) => {
    const bodyLayout = advanced
      ? 'padding:0;background:transparent;display:flex;justify-content:center;align-items:flex-start;'
      : 'padding:18px 16px;background:#fff;';
    return (
      '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<style>html,body{overflow:hidden;scrollbar-width:none;}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none;}' +
      'body{margin:0;min-width:0;' + bodyLayout +
      'font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;}' +
      'img,svg{max-width:100%;}</style></head><body>' + html + '</body></html>'
    );
  };

  const syncPreviewHeight = useCallback(() => {
    const frame = previewFrame.current;
    const wrap = previewWrap.current;
    if (!frame?.contentDocument?.body || !wrap) return;
    const doc = frame.contentDocument;
    const minimumHeight = Math.max(1, wrap.clientHeight);
    frame.style.height = `${minimumHeight}px`;
    const contentHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
    frame.style.height = `${Math.max(minimumHeight, Math.ceil(contentHeight))}px`;
  }, []);

  const queuePreviewHeight = useCallback(() => {
    requestAnimationFrame(() => {
      syncPreviewHeight();
      requestAnimationFrame(syncPreviewHeight);
    });
  }, [syncPreviewHeight]);

  const applyPreviewLayout = useCallback(() => {
    const frame = previewFrame.current;
    const wrap = previewWrap.current;
    if (!frame?.contentDocument?.body || !wrap) return;
    const fixed = previewWidth !== 'fit';
    wrap.classList.toggle('device', fixed);
    wrap.classList.toggle('readable', !fixed);
    if (fixed) wrap.style.setProperty('--preview-width', `${previewWidth}px`);
    else wrap.style.removeProperty('--preview-width');
    frame.contentDocument.body.style.zoom = '1';
    queuePreviewHeight();
  }, [previewWidth, queuePreviewHeight]);

  // Re-apply layout whenever the width toggle changes (original uses the same
  // function on button click; iframe onLoad alone doesn't fire here).
  useEffect(() => {
    if (!ready) return;
    applyPreviewLayout();
  }, [ready, previewWidth, applyPreviewLayout]);

  /* ---------- bidirectional scroll sync ----------
   * Ratio-based mapping between the editor textarea and the preview wrap.
   * The iframe is sized to full content height (original site's design), so
   * the *wrap* is the scrollable preview surface, not the iframe document.
   * A source tag suppresses echo loops across one animation frame.
   */
  const scrollLockRef = useRef<'editor' | 'preview' | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!ready) return;
    const editor = editorRef.current;
    const wrap = previewWrap.current;
    if (!editor || !wrap) return;

    const ratioOf = (el: HTMLElement | HTMLTextAreaElement) => {
      const max = el.scrollHeight - el.clientHeight;
      return max > 0 ? el.scrollTop / max : 0;
    };

    let raf = 0;
    const applyTo = (source: HTMLElement | HTMLTextAreaElement, target: HTMLElement | HTMLTextAreaElement) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = target.scrollHeight - target.clientHeight;
        target.scrollTop = ratioOf(source) * max;
        scrollLockRef.current = null;
      });
    };

    const onEditorScroll = () => {
      if (scrollLockRef.current === 'preview') return;
      scrollLockRef.current = 'editor';
      applyTo(editor, wrap);
    };
    const onWrapScroll = () => {
      if (scrollLockRef.current === 'editor') return;
      scrollLockRef.current = 'preview';
      applyTo(wrap, editor);
    };

    editor.addEventListener('scroll', onEditorScroll, { passive: true });
    wrap.addEventListener('scroll', onWrapScroll, { passive: true });
    return () => {
      editor.removeEventListener('scroll', onEditorScroll);
      wrap.removeEventListener('scroll', onWrapScroll);
      cancelAnimationFrame(raf);
    };
  }, [ready]);

  const commitHtml = useCallback(
    (html: string, advanced: boolean) => {
      const g = Gv();
      htmlRef.current = html;
      dirtyRef.current = false;
      if (previewFrame.current) previewFrame.current.srcdoc = previewShell(html, advanced);
      const result = g.Md2GZHValidator.validate(html);
      setBadge({
        cls: `badge ${result.ok ? (result.warnings.length ? 'warn' : 'ok') : 'bad'}`,
        text: result.ok
          ? result.warnings.length
            ? `⚠ ${result.warnings.length} 条建议`
            : '✓ 平台合规'
          : `✗ ${result.errors.length} 个错误`,
      });
      setPanelLines([
        ...result.errors.map((m) => ({ kind: 'err' as const, text: m })),
        ...result.warnings.map((m) => ({ kind: 'warn' as const, text: m })),
      ]);
      setPanelHidden(result.ok && !result.warnings.length);
    },
    [Gv],
  );

  const renderFailure = useCallback(
    (error: unknown) => {
      htmlRef.current = '';
      const message = error instanceof Error ? error.message : String(error);
      setBadge({ cls: 'badge bad', text: '✗ 高级排版载入失败' });
      setPanelLines([{ kind: 'err', text: message }]);
      setPanelHidden(false);
      if (previewFrame.current) {
        previewFrame.current.srcdoc = previewShell(
          '<section style="padding:28px;color:#8A382F;font-size:14px;line-height:1.8;">高级排版资源暂时无法载入，请刷新后重试。</section>',
          false,
        );
      }
    },
    [],
  );

  const ensureManifest = useCallback(async (signal?: AbortSignal) => {
    if (manifestRef.current) return manifestRef.current;
    const res = await fetch('/motion/manifest.json', { signal: signal ?? null });
    if (!res.ok) throw new Error(`无法读取 motion/manifest.json（${res.status}）`);
    const manifest = await res.json();
    if (!manifest.components || manifest.component_count !== manifest.components.length) {
      throw new Error('动静态组件清单不完整');
    }
    manifestRef.current = manifest;
    return manifest;
  }, []);

  const fetchAsset = useCallback(async (path: string, signal?: AbortSignal) => {
    if (assetsCache.current[path]) return assetsCache.current[path]!;
    const res = await fetch(`/${path}`, { signal: signal ?? null });
    if (!res.ok) throw new Error(`无法读取 ${path}（${res.status}）`);
    const svg = await res.text();
    assetsCache.current[path] = svg;
    return svg;
  }, []);

  const convert = useCallback(async (): Promise<string> => {
    const g = Gv();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;
    const renderId = ++renderIdRef.current;
    const s = g.Md2GZHThemes.getSpec(themeId);
    const tokens = g.Md2GZHConverter.parse(markdown);
    const opts: ConvertOpts = { levelId, motionEnabled, colorId };

    let task: Promise<string>;
    if (!isOriginalSpec) {
      task = Promise.resolve(
        g.Md2GZHThemes.render(tokens, s, { author: author.trim() }),
      );
    } else if ((currentLevel?.order ?? 6) < 3) {
      task = Promise.resolve(
        g.Md2GZHOriginalVisuals.render(
          tokens,
          s,
          { author: author.trim(), levelId: opts.levelId, motionEnabled: opts.motionEnabled, colorId: opts.colorId },
          {},
          null,
        ),
      );
    } else {
      task = ensureManifest(signal)
        .then(async (manifest) => {
          if (signal.aborted) throw new DOMException('aborted', 'AbortError');
          const requirements = g.Md2GZHOriginalVisuals.assetRequirements(
            themeId,
            opts.levelId,
            opts.motionEnabled,
            manifest,
          );
          const assets: Record<string, string> = {};
          for (const req of requirements) {
            assets[req.sourcePath] = await fetchAsset(req.sitePath, signal);
          }
          return g.Md2GZHOriginalVisuals.render(
            tokens,
            s,
            { author: author.trim(), levelId: opts.levelId, motionEnabled: opts.motionEnabled, colorId: opts.colorId },
            assets,
            manifest,
          );
        });
    }

    const pending = task
      .then((html) => {
        if (renderId === renderIdRef.current) commitHtml(html, isOriginalSpec);
        return html;
      })
      .catch((error) => {
        if (signal.aborted) throw error;
        if (renderId === renderIdRef.current) renderFailure(error);
        throw error;
      });
    pendingRef.current = pending;
    return pending;
  }, [
    Gv, themeId, markdown, author, levelId, motionEnabled, colorId,
    isOriginalSpec, currentLevel, ensureManifest, fetchAsset, commitHtml, renderFailure,
  ]);

  useEffect(() => {
    if (!ready) return;
    dirtyRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      convert().catch(() => {});
    }, 350);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ready, convert]);

  // Idle prefetch of the motion manifest once an advanced theme is selected —
  // removes the 88KB fetch from the first L3+ render's critical path.
  useEffect(() => {
    if (!ready || !isOriginalSpec) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const handle = idle(() => {
      ensureManifest().catch(() => {});
    });
    return () => {
      // requestIdleCallback has no cancel on all browsers; safe no-op guard.
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(handle as number);
      else clearTimeout(handle as number);
    };
  }, [ready, isOriginalSpec, ensureManifest]);

  /* ---------- toast (with optional undo action) ---------- */
  useEffect(() => {
    if (!toast) return;
    // Original site shows plain toasts for 2.4s; toasts carrying an undo
    // action stay 5s so there is time to click it.
    const t = setTimeout(() => setToast(null), toast.action ? 5000 : 2400);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- export / copy (ported from app.js) ---------- */
  const exportName = useCallback(
    (extension: string) => {
      const g = Gv();
      const s = g.Md2GZHThemes.getSpec(themeId);
      const title = (markdown.match(/^#\s*(.+)$/m) || [])[1] || '文章';
      const name = title.trim().replace(/[\\/:*?"<>| ]/g, '_').slice(0, 30);
      let suffix = `${s.name}(${s.id})`;
      if ((s.group as string) === 'motion' && currentLevel) {
        suffix += `_L${currentLevel.order}_${currentLevel.short}`;
        if (isDynamicLevel) suffix += motionEnabled ? '_动态' : '_静态回退';
        const cw = (colorways ?? []).find((c) => c.id === colorId);
        if (cw && cw.id !== 'default') suffix += `_${cw.name}`;
      }
      return `${name}_排版_${suffix}.${extension}`;
    },
    [Gv, themeId, markdown, currentLevel, isDynamicLevel, motionEnabled, colorways, colorId],
  );

  const saveBlob = (blob: Blob, name: string) => {
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(anchor.href), 0);
  };

  const fallbackCopy = () => {
    const box = document.createElement('section');
    box.contentEditable = 'true';
    box.innerHTML = htmlRef.current;
    box.style.position = 'fixed';
    box.style.left = '-9999px';
    document.body.appendChild(box);
    const range = document.createRange();
    range.selectNodeContents(box);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.execCommand('copy');
    selection?.removeAllRanges();
    document.body.removeChild(box);
  };

  // Ensure the exported HTML reflects the latest editor state even when the
  // user clicks within the 350ms debounce window.
  const freshHtml = useCallback(async (): Promise<boolean> => {
    if (!dirtyRef.current) return !!htmlRef.current;
    try {
      await convert();
    } catch {
      /* renderFailure already surfaced the error */
    }
    return !!htmlRef.current;
  }, [convert]);

  const copyToWechat = useCallback(async () => {
    try {
      const has = await freshHtml();
      if (!has) {
        setToast({ text: '先粘贴一点内容再复制' });
        return;
      }
      const g = Gv();
      const plain = new Blob([g.Md2GZHConverter.plainText(markdown)], { type: 'text/plain' });
      const rich = new Blob([htmlRef.current], { type: 'text/html' });
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': rich, 'text/plain': plain })]);
        setToast({ text: '✓ 已复制，去公众号编辑器粘贴' });
      } else {
        fallbackCopy();
        setToast({ text: '✓ 已复制（兼容模式）' });
      }
    } catch {
      setToast({ text: '✓ 已复制（兼容模式）' });
      fallbackCopy();
    }
  }, [Gv, markdown, freshHtml]);

  const download = useCallback(async () => {
    try {
      const has = await freshHtml();
      if (!has) {
        setToast({ text: '先粘贴一点内容' });
        return;
      }
      saveBlob(new Blob(['﻿' + htmlRef.current], { type: 'text/html;charset=utf-8' }), exportName('html'));
    } catch {
      setToast({ text: '高级排版尚未载入完成' });
    }
  }, [exportName, freshHtml]);

  const exportLongImage = useCallback(async () => {
    setExportBusy(true);
    try {
      const has = await freshHtml();
      if (!has) {
        setToast({ text: '先粘贴一点内容再导出' });
        return;
      }
      if (typeof window.html2canvas !== 'function') await ensureHtml2canvas();
      if (typeof window.html2canvas !== 'function') throw new Error('长图导出组件加载失败');
      const doc = previewFrame.current?.contentDocument;
      if (!doc?.body) throw new Error('预览尚未就绪');
      const images = Array.from(doc.images);
      await Promise.all(
        images.map((image) =>
          image.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                image.addEventListener('load', () => resolve(), { once: true });
                image.addEventListener('error', () => resolve(), { once: true });
                setTimeout(resolve, 3000);
              }),
        ),
      );
      const target = doc.body;
      const width = Math.ceil(Math.max(target.scrollWidth, doc.documentElement.scrollWidth));
      const height = Math.ceil(Math.max(target.scrollHeight, doc.documentElement.scrollHeight));
      const maxCanvasSide = 16384;
      const scale = Math.min(3, maxCanvasSide / width, maxCanvasSide / height);
      if (scale < 0.5) throw new Error('文章过长，无法生成清晰的单张长图');
      const canvas = await window.html2canvas(target, {
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        scale,
        width,
        height,
        windowWidth: width,
        windowHeight: height,
        scrollX: 0,
        scrollY: 0,
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('浏览器未能编码 PNG');
      saveBlob(blob, exportName('png'));
      setToast({ text: '✓ 长图已导出 PNG' });
    } catch (error) {
      setToast({ text: error instanceof Error ? error.message : '长图导出失败，请稍后重试' });
    } finally {
      setExportBusy(false);
    }
  }, [exportName, freshHtml]);

  /* ---------- picker actions (ported from app.js) ---------- */
  const openLibraryPicker = (libId: string) => {
    const sameOpen = openPop === 'theme' && library === libId;
    setLibrary(libId);
    setGroup('all');
    setOpenPop(sameOpen ? null : 'theme');
  };

  const pickTheme = (id: string) => {
    setThemeId(id);
    if (G) setLibrary(libraryForTheme(G.Md2GZHThemes.getSpec(id)).id);
    setColorId('default');
    setOpenPop(null);
  };

  const pickLevel = (id: string) => {
    setLevelId(id);
    setMotionEnabled(true);
    setOpenPop(null);
  };

  const clearAll = () => {
    const prev = markdown;
    if (!prev) return;
    setMarkdown('');
    setToast({
      text: '已清空',
      action: {
        label: '撤销',
        run: () => {
          setMarkdown(prev);
          setToast(null);
        },
      },
    });
    editorRef.current?.focus();
  };

  return {
    ready,
    loadError,
    markdown, setMarkdown,
    author, setAuthor,
    themeId, pickTheme,
    library, openLibraryPicker,
    group, setGroup,
    openPop, setOpenPop,
    levelId, pickLevel,
    motionEnabled, setMotionEnabled,
    colorId, setColorId,
    previewWidth, setPreviewWidth,
    specs, libraries, groups, libraryThemes, libraryForTheme, selectedLibrary, currentSpec, isOriginalSpec,
    levels, currentLevel, isDynamicLevel,
    colorways, colorVisible, colorwayDots,
    badge, panelLines, panelHidden, setPanelHidden,
    toast, setToast,
    previewFrame, previewWrap, editorRef,
    applyPreviewLayout,
    copyToWechat, download, exportLongImage,
    exportBusy,
    clearAll,
    SAMPLE_MD,
  };
}

export type StudioState = ReturnType<typeof useStudio>;
