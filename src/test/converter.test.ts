import { describe, expect, it } from 'vitest';
import { loadConverter } from './renderers';

/** converter.js 语义 token 管线——Markdown → 语义 token 的行为契约 */
describe('converter (verbatim 渲染管线)', () => {
  const converter = loadConverter();

  it('解析常见 Markdown 元素为语义 token', () => {
    const tokens = converter.parse(
      [
        '# 主标题',
        '',
        '段落文字，含 **加粗**、*斜体*、`行内代码`',
        '',
        '- 列表项一',
        '- 列表项二',
        '',
        '1. 有序一',
        '',
        '> 引用内容',
        '',
        '```javascript',
        'const a = 1;',
        '```',
        '',
        '| A | B |',
        '|---|---|',
        '| 1 | 2 |',
        '',
        '---',
      ].join('\n'),
    );
    const types = tokens.map((t) => t.type);
    expect(types).toContain('cover'); // H1 成为封面标题 token
    expect(types).toContain('para');
    expect(types).toContain('list');
    expect(types).toContain('code');
    expect(types).toContain('table');
    expect(types).toContain('divider');
    const list = tokens.find((t) => t.type === 'list') as
      | { ordered: boolean; items: string[] }
      | undefined;
    expect(list?.items.some((i) => i.includes('列表项一'))).toBe(true);
    const code = tokens.find((t) => t.type === 'code') as
      | { lang: string; lines: string[] }
      | undefined;
    expect(code?.lines).toContain('const a = 1;');
  });

  it('扩展语法：==高亮== 与 ++下划线++ 转换为行内标签', () => {
    const tokens = converter.parse('==荧光笔== 与 ++主题下划线++');
    const raw = tokens.map((t) => t.raw ?? '').join('');
    expect(raw).toContain('<mark>荧光笔</mark>');
    expect(raw).toContain('<u>主题下划线</u>');
  });

  it('围栏代码块内的 == 与 ++ 不被替换', () => {
    const tokens = converter.parse('```\n==not-mark==\n++not-u++\n```');
    const code = tokens.find((t) => t.type === 'code') as
      | { lines: string[] }
      | undefined;
    expect(code).toBeDefined();
    expect(code?.lines.join('\n')).toContain('==not-mark==');
    expect(code?.lines.join('\n')).toContain('++not-u++');
  });

  it('「我是 …，」句式识别为 signature token 并提取作者', () => {
    const tokens = converter.parse('正文\n\n我是 蓝梦，持续整理公众号视觉与长文排版。');
    const sig = tokens.find((t) => t.type === 'signature');
    expect(sig).toBeDefined();
    expect((sig as { author?: string } | undefined)?.author).toBe('蓝梦');
  });

  it('无 H1 时生成 cover 兜底 token', () => {
    const tokens = converter.parse('只有一段正文');
    expect(tokens[0]?.type).toBe('cover');
    expect((tokens[0] as { title?: string } | undefined)?.title).toBe('未命名文章');
  });

  it('plainText 剥离标记语法（复制时的 text/plain 兜底）', () => {
    expect(converter.plainText('# 标题\n\n**粗**[链](https://a.b)')).toBe('标题\n\n粗链');
  });
});