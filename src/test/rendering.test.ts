import { describe, expect, it } from 'vitest';
import { loadConverter, loadThemes, loadValidator } from './renderers';

/** 渲染 round-trip：converter → themes.render → validator（18 套基础主题全量） */
describe('themes.render + validator round-trip', () => {
  const converter = loadConverter();
  const themes = loadThemes();
  const validator = loadValidator();

  it('主题注册表：33 套主题、2 个入口、基础合集 3 组', () => {
    expect(themes.SPECS).toHaveLength(33);
    expect(themes.LIBRARIES).toHaveLength(2);
    const baseLib = themes.LIBRARIES.find((l) => l.id === 'base');
    expect(baseLib?.groups).toEqual(['editorial', 'classic', 'fresh']);
    const groupIds = themes.GROUPS.map((g) => g.id);
    expect(groupIds).toEqual(expect.arrayContaining(['editorial', 'classic', 'fresh', 'motion']));
  });

  it('18 套基础主题全部渲染出 <section> 包裹且包含署名', () => {
    const tokens = converter.parse('# 标题\n\n正文段落 **加粗**');
    const baseSpecs = themes.SPECS.filter((s) => s.group !== 'motion');
    expect(baseSpecs).toHaveLength(18);
    for (const spec of baseSpecs) {
      const html = themes.render(tokens, spec, { author: '署名测试' });
      expect(html.startsWith('<section'), `${spec.id} 应以 section 开头`).toBe(true);
      expect(html.includes('署名测试'), `${spec.id} 应包含署名`).toBe(true);
    }
  });

  it('每个基础主题的渲染产物通过平台合规校验（0 error）', () => {
    const tokens = converter.parse(
      '# 标题\n\n正文 ==高亮==\n\n- 列表\n\n| A | B |\n|---|---|\n| 1 | 2 |',
    );
    for (const spec of themes.SPECS.filter((s) => s.group !== 'motion')) {
      const html = themes.render(tokens, spec, { author: '' });
      const result = validator.validate(html);
      expect(result.errors, `${spec.id} 校验错误`).toEqual([]);
      expect(result.ok, `${spec.id} 应合规`).toBe(true);
    }
  });

  it('主题切换产生不同产物（样式随主题变化）', () => {
    const tokens = converter.parse('# 标题\n\n正文段落');
    const ocean = themes.render(tokens, themes.getSpec('ocean'), { author: '' });
    const zen = themes.render(tokens, themes.getSpec('zen'), { author: '' });
    expect(ocean).not.toBe(zen);
  });
});

/** XSS 红线：渲染管线必须剥离危险内容 */
describe('markdown-rendering XSS 防护', () => {
  const converter = loadConverter();
  const themes = loadThemes();

  it('script/iframe/事件属性/javascript: 链接不出现在渲染产物中', () => {
    const tokens = converter.parse(
      [
        '# t',
        '',
        '<script>alert(1)</script>',
        '',
        '<img src=x onerror=alert(1)>',
        '',
        '[链接](javascript:alert(2))',
      ].join('\n'),
    );
    const html = themes.render(tokens, themes.getSpec('ocean'), { author: '' });
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/<iframe/i);
    expect(html).not.toMatch(/onerror/i);
    expect(html).not.toMatch(/javascript:/i);
  });
});

/** validator 平台红线——直接喂非法 HTML 验证拦截 */
describe('validator 公众号平台红线', () => {
  const validator = loadValidator();

  it('拦截禁用标签/属性/定位/文档外壳', () => {
    const bad = validator.validate(
      '<div class="x" style="position:fixed"><script>evil()</script></div><!DOCTYPE html>',
    );
    expect(bad.ok).toBe(false);
    expect(bad.errors.length).toBeGreaterThan(0);
  });

  it('拦未被 <span leaf> 包裹的文字节点', () => {
    const result = validator.validate('<section>裸文字</section>');
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('leaf'))).toBe(true);
  });

  it('放行规范的 <span leaf> 结构', () => {
    const result = validator.validate('<section><span leaf="">合规文字</span></section>');
    expect(result.errors).toEqual([]);
  });
});