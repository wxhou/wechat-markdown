export const READ_SPEED_CHARS_PER_MINUTE = 300; // 常规中文阅读速度口径（公众号工具惯例）

export interface WordCountStats {
  chars: number;
  minutes: number;
}

const WORD_RUN = /[A-Za-z0-9]+/g;
/* 汉字逐字计入；中文标点、全角符号及中文习惯的引号/破折号/省略号同口径逐字计入 */
const CJK_OR_FULLWIDTH =
  /[㐀-䶿一-鿿豈-﫿、-〿—‘’“”…！-～]/g;

/* 剥离 Markdown 语法符号；代码围栏整块只计代码正文，链接只计文字、图片整体剔除 */
export function stripMarkdownSyntax(md: string): string {
  return (
    md
      .replace(/^[ \t]*(?:```+|~~~+).*$/gm, '')
      .replace(/`([^`\n]+)`/g, '$1')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/^#{1,6}[ \t]+/gm, '')
      .replace(/\*\*|__|\*|==|\+\+|~~/g, '')
  );
}

export function wordCountStats(md: string): WordCountStats {
  const text = stripMarkdownSyntax(md);
  let chars = 0;
  for (const m of text.matchAll(CJK_OR_FULLWIDTH)) chars += m[0].length;
  const words = (text.match(WORD_RUN) ?? []).length;
  const total = chars + words;
  return { chars: total, minutes: Math.max(1, Math.floor(total / READ_SPEED_CHARS_PER_MINUTE)) };
}