import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Tag, tags } from '@lezer/highlight';
import type { DelimiterType, MarkdownConfig } from '@lezer/markdown';

/* 站内方言的语法色（与壳层明暗两档一一对应，值定义在 styles.css 的 :root / 深色档） */
const highlightTag = Tag.define();
const underlineTag = Tag.define();

/* 形状照 lezer-markdown 内置的 GFM 删除线：成对 delimiter + 独立 Mark 节点名，
 * after: 'Emphasis' 与内建强调同级。 */
function delimiterSyntax(name: string, code: number, style: Tag): MarkdownConfig {
  const delimiter: DelimiterType = { resolve: name, mark: `${name}Mark` };
  return {
    defineNodes: [
      { name, style: { [`${name}/...`]: style } },
      { name: `${name}Mark`, style: tags.processingInstruction },
    ],
    parseInline: [
      {
        name,
        parse: (cx, next, pos) =>
          next === code && cx.char(pos + 1) === code
            ? cx.addDelimiter(delimiter, pos, pos + 2, true, true)
            : -1,
        after: 'Emphasis',
      },
    ],
  };
}

export const dialectExtensions: MarkdownConfig[] = [
  delimiterSyntax('Highlight', 61 /* = */, highlightTag),
  delimiterSyntax('Underline', 43 /* + */, underlineTag),
];

export const dialectHighlight = syntaxHighlighting(
  HighlightStyle.define([
    { tag: highlightTag, color: 'var(--cm-highlight)', fontWeight: '600' },
    { tag: underlineTag, color: 'var(--cm-underline)' },
  ]),
);
