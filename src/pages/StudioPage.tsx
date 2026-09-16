import { useEffect } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronIcon,
  DownloadIcon,
  ImageIcon,
  LogoSvg,
} from '../components/icons';
import { useStudio } from './useStudio';
import type { StudioState } from './useStudio';

/* ---------- verbatim markup mirror of studio.html ---------- */

export default function StudioPage() {
  const s = useStudio();

  useEffect(() => {
    document.title = '公众号排版 · 排版工坊';
    document.body.className = '';
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
          <a className="btn ghost" href="/">
            <ArrowLeftIcon />
            首页
          </a>
          <button id="btnDownload" className="btn ghost" type="button" onClick={s.download}>
            <DownloadIcon />
            下载 HTML
          </button>
          <button id="btnExportImage" className="btn ghost" type="button" onClick={s.exportLongImage} disabled={s.exportBusy}>
            {s.exportBusy ? '正在生成…' : (
              <>
                <ImageIcon />
                导出长图
              </>
            )}
          </button>
          <button id="btnCopy" className="btn primary" type="button" onClick={s.copyToWechat}>
            复制到公众号
            <ArrowRightIcon size={15} />
          </button>
        </div>
      </header>

      <main className="workspace rise" style={{ animationDelay: '.08s' }}>
        <section className="pane editor-pane">
          <div className="pane-toolbar">
            <strong>Markdown</strong>
            <span className="picker-slot">
              {s.libraries.map((lib) => (
                <PickerButton key={lib.id} s={s} lib={lib} />
              ))}
              {s.openPop === 'theme' && s.currentSpec && <PickerPop s={s} />}
            </span>
            {s.isOriginalSpec && <LevelPicker s={s} />}
            {s.colorVisible && <ColorPicker s={s} />}
            <span className="spacer" />
            <label className="author-field">
              署名{' '}
              <input
                id="authorInput"
                type="text"
                placeholder="你的名字（可空）"
                maxLength={24}
                value={s.author}
                onChange={(e) => s.setAuthor(e.target.value)}
              />
            </label>
            <button className="btn tiny ghost" type="button" onClick={() => s.setMarkdown(s.SAMPLE_MD)}>
              载入示例
            </button>
            <button className="btn tiny ghost" type="button" onClick={s.clearAll}>
              清空
            </button>
          </div>
          <textarea
            id="editor"
            ref={s.editorRef}
            aria-label="Markdown 编辑区"
            spellCheck={false}
            placeholder={'把文章 Markdown 粘进来，右侧立即预览…\n\n支持：# 标题 / ## 章节 / **加粗**(自动升级为关键词下划线) / ==高亮== / ++下划线++ / 代码块 / 图片 / 表格 / 引用'}
            value={s.markdown}
            onChange={(e) => s.setMarkdown(e.target.value)}
          />
        </section>

        <section className="pane preview-pane">
          <div className="pane-toolbar">
            <strong>公众号预览</strong>
            <button
              type="button"
              className={s.badge.cls}
              aria-expanded={!s.panelHidden}
              onClick={() => s.setPanelHidden(!s.panelHidden)}
            >
              {s.ready ? s.badge.text : '载入渲染器…'}
            </button>
            <span className="spacer" />
            <div className="width-toggle" role="group" aria-label="预览设备宽度">
              {(
                [
                  ['fit', '适应', '最大 500 CSS px 的舒适阅读容器'],
                  ['375', '小屏 375', '375 CSS px 小屏预览'],
                  ['402', '标准 402', '402 CSS px 标准屏预览'],
                  ['440', '大屏 440', '440 CSS px 大屏预览'],
                ] as const
              ).map(([value, label, title]) => (
                <button
                  key={value}
                  type="button"
                  className={`btn tiny ghost${s.previewWidth === value ? ' active' : ''}`}
                  data-preview-width={value}
                  aria-pressed={s.previewWidth === value}
                  title={title}
                  onClick={() => s.setPreviewWidth(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="preview-wrap" id="previewWrap" ref={s.previewWrap}>
            <iframe
              id="preview"
              title="排版预览"
              ref={s.previewFrame}
              onLoad={s.applyPreviewLayout}
            />
          </div>
          {!s.panelHidden && s.panelLines.length > 0 && (
            <div className="valid-panel">
              {s.panelLines.map((l, i) =>
                l.kind === 'err' ? (
                  <div key={`err-${i}`} className="err">✗ {l.text}</div>
                ) : (
                  <div key={`warn-${i}`} className="warn">⚠ {l.text}</div>
                ),
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="foot rise" style={{ animationDelay: '.2s' }}>
        基于 <a href="https://github.com/isjiamu/gzh-design-skill" target="_blank" rel="noopener">gzh-design-skill</a>
        {' '}与{' '}
        <a href="https://github.com/lanmengSakura/wechat-motion-layout-studio" target="_blank" rel="noopener">wechat-motion-layout-studio</a>
        {' '}融合打造 · AGPL-3.0 开源
      </footer>

      <div className="toast" role="status" aria-live="polite" hidden={!s.toast}>
        {s.toast?.text}
        {s.toast?.action && (
          <button
            type="button"
            className="toast-action"
            onClick={s.toast.action.run}
          >
            {s.toast.action.label}
          </button>
        )}
      </div>

      {s.loadError && (
        <div className="toast" style={{ background: 'var(--bad)' }}>渲染器加载失败：{s.loadError}</div>
      )}
    </>
  );
}

/* ---------- picker button (per library) ---------- */

function PickerButton({ s, lib }: { s: StudioState; lib: StudioState['libraries'][number] }) {
  const selected = s.selectedLibrary?.id === lib.id;
  const open = s.openPop === 'theme' && s.library === lib.id;
  const count = s.libraryThemes(lib).length;
  const ariaLabel =
    lib.name + (selected ? `，当前为${s.currentSpec?.name ?? ''}` : `，共${count}套`);
  return (
    <button
      type="button"
      className={`picker-btn${selected ? ' selected' : ''}${open ? ' open' : ''}`}
      aria-expanded={open}
      aria-controls="themePickerPop"
      aria-label={ariaLabel}
      onClick={() => s.openLibraryPicker(lib.id)}
    >
      <span className="picker-kind">{lib.shortName}</span>
      {selected ? (
        <>
          <span className="swatch" style={{ background: s.currentSpec?.swatch }} />
          <span className="picker-name">{s.currentSpec?.name}</span>
        </>
      ) : (
        <span className="picker-count">{count} 套</span>
      )}
      <ChevronIcon />
    </button>
  );
}

/* ---------- theme picker popover ---------- */

function PickerPop({ s }: { s: StudioState }) {
  const lib = s.libraries.find((l) => l.id === s.library) ?? s.libraries[0];
  if (!lib || !s.currentSpec) return null;
  const inLibrary = s.libraryThemes(lib);
  const note = lib.id === 'original' ? '15 THEMES · 6 LEVELS' : `${inLibrary.length} THEMES`;
  const visible = inLibrary.filter((spec) => s.group === 'all' || spec.group === s.group);
  const baseGroups = s.groups.filter(
    (g) => g.id === 'all' || lib.groups.indexOf(g.id) !== -1,
  );

  return (
    <div className="picker-pop" id="themePickerPop">
      <div className="pop-head">
        <span className="pop-title">
          {lib.en} · {lib.name}
        </span>
        <span className="pop-note">{note}</span>
      </div>
      {lib.id === 'base' && (
        <div className="pop-tabs">
          {baseGroups.map((g) => {
            const count =
              g.id === 'all'
                ? inLibrary.length
                : inLibrary.filter((spec) => spec.group === g.id).length;
            return (
              <button
                key={g.id}
                className={`group-tab${s.group === g.id ? ' active' : ''}`}
                onClick={() => s.setGroup(g.id)}
              >
                {g.name} <span className="cnt">{count}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className="pop-grid">
        {visible.map((spec) => (
          <button
            key={spec.id}
            className={`pop-card${spec.id === s.themeId ? ' active' : ''}`}
            onClick={() => s.pickTheme(spec.id)}
          >
            <span className="swatch" style={{ background: spec.swatch }} />
            <span className="pop-card-text">
              <span className="tname">{spec.name}</span>
              <span className="tdesc">{spec.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- level picker (advanced themes only) ---------- */

function LevelPicker({ s }: { s: StudioState }) {
  if (!s.currentLevel) return null;
  const level = s.currentLevel;
  const open = s.openPop === 'level';
  return (
    <span className="level-picker-slot">
      <button
        type="button"
        className="picker-btn level-picker-btn"
        aria-expanded={open}
        aria-controls="levelPickerPop"
        onClick={() => s.setOpenPop(open ? null : 'level')}
      >
        <span className="picker-kind">视觉</span>
        <span className="level-index">L{level.order}</span>
        <span className="picker-name">{level.short}</span>
        <ChevronIcon />
      </button>
      {s.isDynamicLevel && (
        <button
          type="button"
          className={`btn tiny ghost motion-mode-btn${s.motionEnabled ? ' active' : ''}`}
          aria-pressed={s.motionEnabled}
          onClick={() => s.setMotionEnabled(!s.motionEnabled)}
          title={s.motionEnabled ? '当前输出动态 SVG，点击切换为几何一致的静态回退' : '当前输出静态回退，点击恢复动态 SVG'}
        >
          {s.motionEnabled ? '动态' : '静态回退'}
        </button>
      )}
      {open && (
        <div className="level-pop" id="levelPickerPop">
          <div className="level-pop-head">
            <span className="pop-title">PRESENTATION LEVEL · 视觉等级</span>
            <span className="pop-note">76 COMBINATIONS</span>
          </div>
          <div className="level-list">
            {s.levels.map((lv) => (
              <button
                key={lv.id}
                className={`level-option${s.levelId === lv.id ? ' active' : ''}`}
                onClick={() => s.pickLevel(lv.id)}
              >
                <span className="level-no">L{lv.order}</span>
                <span className="level-copy">
                  <strong>{lv.name}</strong>
                  <small>{lv.description}</small>
                </span>
                {lv.motion !== 'none' && <span className="level-motion">动</span>}
              </button>
            ))}
          </div>
          <p className="level-footnote">L1 为全库唯一黑白排版；L2–L6 分别适用于 15 套原创主题。</p>
        </div>
      )}
    </span>
  );
}

/* ---------- colorway picker (advanced themes, L2+) ---------- */

function ColorPicker({ s }: { s: StudioState }) {
  if (!s.colorways) return null;
  const current = s.colorways.find((c) => c.id === s.colorId) ?? s.colorways[0];
  if (!current) return null;
  const dots = s.colorwayDots(current);
  const open = s.openPop === 'color';
  return (
    <span className="color-picker-slot">
      <button
        type="button"
        className="picker-btn color-picker-btn"
        aria-expanded={open}
        aria-controls="colorPickerPop"
        onClick={() => s.setOpenPop(open ? null : 'color')}
      >
        <span className="picker-kind">配色</span>
        <span className="color-chip-dots">
          {dots.map((d) => (
            <i key={d.key} className="color-dot" style={{ background: d.bg }} />
          ))}
        </span>
        <span className="picker-name">{current.name}</span>
        <ChevronIcon />
      </button>
      {open && (
        <div className="color-pop" id="colorPickerPop">
          <div className="level-pop-head">
            <span className="pop-title">COLORWAYS · 主题配色</span>
            <span className="pop-note">{s.colorways.length} PALETTES</span>
          </div>
          <div className="color-list">
            {s.colorways.map((cw) => (
              <button
                key={cw.id}
                className={`color-option${s.colorId === cw.id ? ' active' : ''}`}
                onClick={() => {
                  s.setColorId(cw.id);
                  s.setOpenPop(null);
                }}
              >
                <span className="color-chip-dots large">
                  {s.colorwayDots(cw).map((d) => (
                    <i key={d.key} className="color-dot" style={{ background: d.bg }} />
                  ))}
                </span>
                <span className="color-copy">
                  <strong>{cw.name}</strong>
                  <small>
                    {s.currentSpec?.name} · {cw.id === 'default' ? '主题原配色' : '定制配色'}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <p className="level-footnote">每套主题附带 4 套定制配色；L2–L6 全等级生效，L1 黑白极简不参与配色。</p>
        </div>
      )}
    </span>
  );
}
