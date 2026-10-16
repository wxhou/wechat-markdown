import { describe, expect, it } from 'vitest';
import { indentLines, linkWrap, markerWrap, outdentLines } from '../lib/editor-shortcuts';

/** 快捷键选区变换与 Tab 行缩进（editor-features） */
describe('markerWrap / linkWrap', () => {
  it('有选区：包裹并保持选区在标记内', () => {
    expect(markerWrap('关键词', '**')).toEqual({ segment: '**关键词**', selStart: 2, selEnd: 5 });
    expect(markerWrap('词', '==')).toEqual({ segment: '==词==', selStart: 2, selEnd: 3 });
  });

  it('无选区：插入空标记、光标移入标记对中间', () => {
    expect(markerWrap('', '**')).toEqual({ segment: '****', selStart: 2, selEnd: 2 });
    expect(markerWrap('', '++')).toEqual({ segment: '++++', selStart: 2, selEnd: 2 });
  });

  it('链接：无选区选中「文本」占位、有选区选中 URL 段', () => {
    expect(linkWrap('')).toEqual({ segment: '[文本](https://)', selStart: 1, selEnd: 3 });
    const t = linkWrap('原文');
    expect(t.segment).toBe('[原文](https://)');
    expect(t.segment.slice(t.selStart, t.selEnd)).toBe('https://');
  });
});

describe('Tab 行缩进', () => {
  it('非空行行首加两空格、空行不动', () => {
    expect(indentLines(['a', '', 'b c'].join('\n'))).toBe(['  a', '', '  b c'].join('\n'));
  });

  it('反缩进每行最多移除两个行首空格', () => {
    expect(outdentLines(['    a', ' b', 'c'].join('\n'))).toBe(['  a', 'b', 'c'].join('\n'));
  });
});