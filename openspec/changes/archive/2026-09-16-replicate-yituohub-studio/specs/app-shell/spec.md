## Purpose

应用外壳提供路由、全局 Header、品牌资产等基础设施，是所有页面与组件的承载层。

## ADDED Requirements

### Requirement: 路由
系统 SHALL 使用 React Router 管理两条路由：`/`（落地页）与 `/studio`（工坊页）；其它路径 SHALL 重定向到 `/`。

#### Scenario: 访问未知路径回落到首页
- **WHEN** 用户访问不存在的路径（如 `/foo`）
- **THEN** 系统 SHALL 重定向到 `/`

### Requirement: 全局 Header
Header SHALL 在所有页面顶部显示品牌 Logo + "公众号排版"主标 + "Markdown → WeChat HTML Studio"副标；落地页与工坊页 SHALL 在 Header 右侧显示不同的操作按钮组（落地页"进入工坊"；工坊页"首页 / 下载 HTML / 导出长图 / 复制到公众号"）。页面 SHALL 不包含 GitHub 外链。

#### Scenario: Header 在所有页面可见
- **WHEN** 用户访问 `/` 或 `/studio`
- **THEN** 页面顶部 SHALL 显示完整的 Header（Logo + 主副标 + 对应操作按钮组）

### Requirement: 工坊页页脚
仅工坊页 SHALL 在底部显示开源致谢："基于 gzh-design-skill 与 wechat-motion-layout-studio 融合打造 · AGPL-3.0 开源"，并链接两个上游仓库；落地页 SHALL 无页脚。

#### Scenario: 工坊页显示致谢页脚
- **WHEN** 用户访问 `/studio` 并滚动到底部
- **THEN** 页面底部 SHALL 显示致谢文案与上游仓库链接
- **AND** 落地页 SHALL 不出现任何页脚声明区