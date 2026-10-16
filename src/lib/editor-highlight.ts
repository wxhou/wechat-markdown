import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

/* Markdown 结构着色：颜色一律引用壳层变量（值定义在 styles.css 的 :root / 深色档两处），
 * 明暗自适应零 JS。标记符号（processingInstruction）统一走弱化色，让结构读起来像脚手架。 */
export const markdownHighlight = syntaxHighlighting(
  HighlightStyle.define([
    {
      tag: [
        tags.heading,
        tags.heading1,
        tags.heading2,
        tags.heading3,
        tags.heading4,
        tags.heading5,
        tags.heading6,
      ],
      color: 'var(--cm-heading)',
      fontWeight: '700',
    },
    { tag: tags.strong, color: 'var(--cm-strong)', fontWeight: '700' },
    { tag: tags.emphasis, color: 'var(--cm-em)', fontStyle: 'italic' },
    { tag: tags.strikethrough, color: 'var(--cm-em)', textDecoration: 'line-through' },
    { tag: tags.monospace, color: 'var(--cm-mono)' },
    { tag: [tags.link, tags.url, tags.labelName], color: 'var(--cm-link)' },
    { tag: tags.quote, color: 'var(--cm-quote)', fontStyle: 'italic' },
    { tag: tags.list, color: 'var(--cm-quote)' },
    { tag: tags.contentSeparator, color: 'var(--cm-rule)' },
    { tag: [tags.processingInstruction, tags.escape, tags.character], color: 'var(--cm-mark)' },
  ]),
);
