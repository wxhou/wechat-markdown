import { describe, expect, it } from 'vitest';
import { exportBaseTitle } from '../lib/md-export-name';

/** 导出文件名的标题提取（export-functions 快赢批） */
describe('exportBaseTitle', () => {
  it('取首个一级标题', () => {
    expect(exportBaseTitle('# 味道的故事\n\n## 章节\n\n# 第二个标题')).toBe('味道的故事');
  });

  it('净化非法文件名字符与空格', () => {
    expect(exportBaseTitle('# a/b\\c:d*e?f"g<h>i|j k')).toBe('a_b_c_d_e_f_g_h_i_j_k');
  });

  it('超长标题截断 30 字符', () => {
    expect(exportBaseTitle('# ' + '长'.repeat(40))).toBe('长'.repeat(30));
  });

  it('无标题兜底「文章」', () => {
    expect(exportBaseTitle('只有段落')).toBe('文章');
    expect(exportBaseTitle('#    \n\n正文')).toBe('文章');
  });
});