## Purpose

应用外壳提供路由、全局 Header、品牌资产等基础设施，是所有页面与组件的承载层。

## Requirements

### Requirement: 路由
系统 SHALL 使用 React Router 管理两条路由：`/`（落地页）与 `/studio`（工坊页）；其它路径 SHALL 重定向到 `/`。

#### Scenario: 访问未知路径回落到首页
- **WHEN** 用户访问不存在的路径（如 `/foo`）
- **THEN** 系统 SHALL 重定向到 `/`

### Requirement: 全局 Header
Header SHALL 在所有页面顶部显示品牌 Logo + "公众号排版"主标 + "Markdown → WeChat HTML Studio"副标；落地页与工坊页 SHALL 在 Header 右侧显示不同的操作按钮组（落地页"进入工坊"；工坊页"首页 / 下载 HTML / 导出 Markdown / 导出长图 / 复制到公众号"）。页面 SHALL 不包含 GitHub 外链。

#### Scenario: Header 在所有页面可见
- **WHEN** 用户访问 `/` 或 `/studio`
- **THEN** 页面顶部 SHALL 显示完整的 Header（Logo + 主副标 + 对应操作按钮组）

### Requirement: 深色模式（三态外观）
Header 右侧 SHALL 提供外观分段控件，在「跟随系统 / 浅色 / 深色」三档间切换，当前档 SHALL 以控件内选中态（`aria-pressed`）标识。外观 SHALL 作用于整站壳层（落地页与工坊页，含顶栏、弹层、toast、校验面板、源码视图、编辑器等全部壳层表面）；预览 iframe SHALL 除外——公众号文章预览 SHALL 恒为白底，不随壳层外观变化。选择 SHALL 持久化到 localStorage（key `md2gzh.v1.theme`，取值 `auto` / `light` / `dark`）；无有效存储时 SHALL 默认「跟随系统」。「跟随系统」态 SHALL 响应操作系统亮暗变化即时切换，无需刷新或重载页面。

#### Scenario: 切到深色后壳层变暗、预览保持白底
- **WHEN** 用户在外观控件点击「深色」
- **THEN** 整站壳层 SHALL 呈现深色外观（顶栏、编辑器、主题弹层、源码视图、toast 等表面），且各表面文字对比度可读
- **AND** 预览 iframe 内容 SHALL 保持白底，不受壳层外观影响
- **AND** 刷新或重开页面后 SHALL 保持深色

#### Scenario: 跟随系统默认且即时响应
- **WHEN** 无有效存储偏好且操作系统处于深色模式时访问页面
- **THEN** 壳层 SHALL 以深色呈现
- **AND** 偏好为「跟随系统」时，操作系统切换亮暗 SHALL 使页面即时切换外观，无需刷新

#### Scenario: 手动档覆盖系统
- **WHEN** 操作系统处于深色模式而用户选择「浅色」
- **THEN** 壳层 SHALL 保持浅色外观，不随系统切换变化

#### Scenario: 偏好跨页面共享
- **WHEN** 用户在工坊页选择「深色」后进入落地页
- **THEN** 落地页壳层 SHALL 同为深色外观

### Requirement: 工坊页页脚
仅工坊页 SHALL 在底部显示开源致谢："基于 gzh-design-skill 与 wechat-motion-layout-studio 融合打造 · AGPL-3.0 开源"，并链接两个上游仓库；落地页 SHALL 无页脚。

#### Scenario: 工坊页显示致谢页脚
- **WHEN** 用户访问 `/studio` 并滚动到底部
- **THEN** 页面底部 SHALL 显示致谢文案与上游仓库链接
- **AND** 落地页 SHALL 不出现任何页脚声明区