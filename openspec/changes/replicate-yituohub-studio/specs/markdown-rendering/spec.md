## Purpose

Markdown 渲染管线将用户在编辑器中的 Markdown 文本转换为公众号兼容的 HTML，并在渲染时按当前主题注入样式。该管线是工坊页"实时预览"与"下载 HTML"能力的核心。

## ADDED Requirements

### Requirement: Markdown 语法支持范围
系统 SHALL 支持标准 Markdown 语法：标题、段落、粗体、斜体、行内代码、代码块、链接、图片、有序与无序列表、引用、分隔线、表格。

#### Scenario: 解析常见 Markdown 元素
- **WHEN** 用户输入包含 `# 标题`、`**粗体**`、列表、代码块、引用、表格的 Markdown
- **THEN** 渲染输出 SHALL 包含 `<h1>`、`<strong>`、`<ul>`/`<ol>`、`<pre><code>`、`<blockquote>`、`<table>` 等对应 HTML 元素

### Requirement: 微信公众号兼容性
渲染输出 SHALL 使用微信公众号编辑器支持的标签（避免 `<div>` 外层包裹、`<section>`、外部资源）；代码块、行内代码、引文等 SHALL 具备内联样式保证在公众号编辑器中可见。

#### Scenario: 渲染输出可在公众号编辑器粘贴生效
- **WHEN** 用户点击"复制到公众号"并将剪贴板内容粘贴到微信公众号编辑器
- **THEN** 粘贴内容 SHALL 显示主题样式（含字体、配色、间距、代码块样式）且 SHALL 不包含被公众号剥除的样式

### Requirement: XSS 防护
渲染管线 SHALL 在产出最终 HTML 前对原始 Markdown 解析结果做白名单净化，禁止 `<script>`、`<iframe>`、`on*` 事件属性等危险内容出现在最终输出中。

#### Scenario: 过滤危险内容
- **WHEN** 用户输入包含 `<script>alert(1)</script>` 或带 `onerror` 的图片标签
- **THEN** 渲染输出 SHALL 完全剥离这些危险元素，最终 HTML 在浏览器中 SHALL 不触发任何脚本

### Requirement: 主题样式注入
渲染输出 SHALL 在与主题约定的容器元素上挂载主题样式（内联 `<style>` 或 className 绑定），主题切换 SHALL 重新生成或替换样式。

#### Scenario: 切换主题后样式同步
- **WHEN** 用户切换主题
- **THEN** 预览与导出的 HTML SHALL 反映新主题的字体、颜色、间距与装饰