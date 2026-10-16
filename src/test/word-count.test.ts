import { describe, expect, it } from 'vitest';
import { stripMarkdownSyntax, wordCountStats } from '../lib/word-count';

/** 字数统计口径——语法剥离与中英混合计数（editor-features 快赢批） */
describe('wordCountStats', () => {
  it('混合计数：汉字逐字、英文连续串计 1 词、中文标点计入', () => {
    // 你好(2) + ！(1) + world(1) = 4
    expect(wordCountStats('你好 **world**！').chars).toBe(4);
  });

  it('标题井号与高亮/下划线标记不计入', () => {
    expect(wordCountStats('# 你好\n\n==重点==\n\n++圈注++').chars).toBe(6);
  });

  it('链接只计文字、图片整体剔除', () => {
    expect(wordCountStats('[文档](https://example.com/a?b=cd&d=e) ![封面](https://a.com/b.png)').chars).toBe(2);
  });

  it('代码围栏只计代码正文、不计围栏语法', () => {
    expect(wordCountStats('```js\nconst a = 1;\n```').chars).toBe(3);
  });

  it('行内代码内容计入、反引号不计入', () => {
    expect(wordCountStats('用 `const` 声明变量').chars).toBe(6);
  });

  it('空内容与纯 ASCII 标点为 0 字', () => {
    expect(wordCountStats('').chars).toBe(0);
    expect(wordCountStats('# ...!?~,.\n```...\n```').chars).toBe(0);
  });

  it('英文句子按词计', () => {
    expect(wordCountStats('Hello world, this is WeChat').chars).toBe(5);
  });

  it('阅读时长：不足 300 字按 1 分钟、601 字约 2 分钟', () => {
    expect(wordCountStats('好'.repeat(299)).minutes).toBe(1);
    expect(wordCountStats('好'.repeat(601)).minutes).toBe(2);
  });

  it('stripMarkdownSyntax 保留链接文字与代码正文', () => {
    expect(stripMarkdownSyntax('[文字](https://a.b/c) `code`')).toBe('文字 code');
  });
});