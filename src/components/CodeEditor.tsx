import { useEffect, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownKeymap, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorSelection, Prec, type Extension } from '@codemirror/state';
import { highlightSelectionMatches, search, searchKeymap } from '@codemirror/search';
import {
  EditorView,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder,
} from '@codemirror/view';
import {
  indentLines,
  linkWrap,
  markerWrap,
  outdentLines,
  type SelectionTransform,
} from '../lib/editor-shortcuts';
import { dialectExtensions, dialectHighlight } from '../lib/editor-dialect';
import { markdownHighlight } from '../lib/editor-highlight';

const PLACEHOLDER =
  '把文章 Markdown 粘进来，右侧立即预览…\n\n支持：# 标题 / ## 章节 / **加粗**(自动升级为关键词下划线) / ==高亮== / ++下划线++ / 代码块 / 图片 / 表格 / 引用';

type Transform = (selected: string) => SelectionTransform;

function wrapKey(transform: Transform) {
  return (view: EditorView) => {
    view.focus();
    view.dispatch(
      view.state.changeByRange((range) => {
        const t = transform(view.state.sliceDoc(range.from, range.to));
        return {
          changes: { from: range.from, to: range.to, insert: t.segment },
          range: EditorSelection.range(range.from + t.selStart, range.from + t.selEnd),
        };
      }),
      { scrollIntoView: true, userEvent: 'input.wrap' },
    );
    return true;
  };
}

/* Tab 仅在有选区时吃掉按键做行缩进；无选区返回 false 放行浏览器默认的焦点移动，保键盘可达性 */
function indentKey(direction: 1 | -1) {
  return (view: EditorView) => {
    const { from, to } = view.state.selection.main;
    if (from === to) return false;
    const start = view.state.doc.lineAt(from).from;
    const end = view.state.doc.lineAt(to).to;
    const span = view.state.sliceDoc(start, end);
    const segment = direction > 0 ? indentLines(span) : outdentLines(span);
    view.dispatch({
      changes: { from: start, to: end, insert: segment },
      selection: { anchor: start, head: start + segment.length },
      scrollIntoView: true,
      userEvent: 'input.indent',
    });
    return true;
  };
}

/* Cmd+H 在浏览器语义是隐藏窗口，站内高亮用 Shift 组合承担 */
const WRAP_BINDINGS = (
  [
    ['Mod-b', '**'],
    ['Mod-i', '*'],
    ['Mod-u', '++'],
    ['Mod-Shift-h', '=='],
  ] as const
).map(([key, marker]) => ({
  key,
  run: wrapKey((selected) => markerWrap(selected, marker)),
}));

/* 壳色一律引用壳层 CSS 变量（定义在 styles.css 的 :root / 深色档）；
 * 这些选择器由 CM 基础主题以同等特异性先注入，只能靠后注册的 theme 覆盖 */
const EDITOR_THEME = EditorView.theme({
  '&': { height: '100%', backgroundColor: 'var(--field)', color: 'var(--text)' },
  '.cm-scroller': {
    fontFamily: '"SF Mono", Menlo, Consolas, "PingFang SC", monospace',
    fontSize: '13px',
    lineHeight: '1.75',
    overflowY: 'auto',
    caretColor: 'var(--text)',
  },
  '.cm-content': { padding: '16px' },
  '.cm-cursor': { borderLeftColor: 'var(--text)' },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--sub2)',
    borderRight: '1px solid var(--line)',
  },
  '.cm-activeLine': { backgroundColor: 'var(--cm-active-line)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--cm-active-line-gutter)', color: 'var(--sub)' },
  '.cm-selectionMatch': { backgroundColor: 'var(--cm-match)' },
  '.cm-searchMatch': { backgroundColor: 'var(--cm-match)' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'var(--cm-selection)',
  },
  '.cm-searchMatch-selected': { backgroundColor: 'var(--cm-match-active)' },
  '.cm-placeholder': { color: 'var(--sub2)' },
  '.cm-panels': { backgroundColor: 'var(--panel)', color: 'var(--text)' },
  '.cm-panels.cm-panels-top': { borderBottom: '1px solid var(--line)' },
  '.cm-textfield': {
    backgroundColor: 'var(--field)',
    color: 'var(--text)',
    border: '1px solid var(--line)',
    borderRadius: '6px',
  },
  '.cm-button': {
    backgroundImage: 'none',
    backgroundColor: 'var(--field)',
    color: 'var(--text)',
    border: '1px solid var(--line)',
    borderRadius: '6px',
  },
});

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onDropFiles: (files: File[]) => void;
  onViewReady: (view: EditorView) => void;
}

export default function CodeEditor({
  value,
  onChange,
  onSave,
  onDropFiles,
  onViewReady,
}: CodeEditorProps) {
  /* 扩展数组引用必须稳定（uiw 以它为 reconfigure 依赖），回调走 ref 取最新值 */
  const handlers = useRef({ onSave, onDropFiles });
  useEffect(() => {
    handlers.current = { onSave, onDropFiles };
  }, [onSave, onDropFiles]);

  const extensions = useMemo<Extension[]>(
    () => [
      EDITOR_THEME,
      /* 基础主题默认跟随系统亮暗；本站外观由 data-theme 单独控制，钉死浅色基础主题 */
      EditorView.darkTheme.of(false),
      history(),
      drawSelection(),
      dropCursor(),
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      EditorView.lineWrapping,
      /* contentDOM 才是 role=textbox 的那个元素，无障碍名必须挂在它上面（挂外层 div 不生效） */
      EditorView.contentAttributes.of({ 'aria-label': 'Markdown 编辑区' }),
      placeholder(PLACEHOLDER),
      markdown({ base: markdownLanguage, extensions: dialectExtensions }),
      markdownHighlight,
      dialectHighlight,
      search({ top: true }),
      highlightSelectionMatches(),
      keymap.of([...searchKeymap, ...markdownKeymap, ...defaultKeymap, ...historyKeymap]),
      Prec.high(
        keymap.of([
          ...WRAP_BINDINGS,
          { key: 'Mod-k', run: wrapKey(linkWrap) },
          {
            key: 'Mod-s',
            run: () => {
              handlers.current.onSave();
              return true;
            },
          },
          { key: 'Tab', shift: indentKey(-1), run: indentKey(1) },
        ]),
      ),
      EditorView.domEventHandlers({
        drop: (event) => {
          const files = event.dataTransfer?.files;
          if (!files || files.length === 0) return false;
          /* CM 默认会把拖入的文件内容当作文本插入；stopPropagation 一并阻断冒泡，
             否则 React pane 的 onDrop 会把同一文件再处理一遍 */
          event.preventDefault();
          event.stopPropagation();
          handlers.current.onDropFiles(Array.from(files));
          return true;
        },
      }),
    ],
    [],
  );

  return (
    <CodeMirror
      className="code-editor"
      value={value}
      onChange={onChange}
      onCreateEditor={onViewReady}
      extensions={extensions}
      theme="none"
      basicSetup={false}
      indentWithTab={false}
    />
  );
}
