## Purpose

应用外壳提供路由、全局 Header 与 Footer、品牌资产等基础设施，是所有页面与组件的承载层。

## ADDED Requirements

### Requirement: 路由
系统 SHALL 使用 React Router 管理两条路由：`/`（落地页）与 `/studio`（工坊页）；其它路径 SHALL 重定向到 `/`。

#### Scenario: 访问未知路径回落到首页
- **WHEN** 用户访问不存在的路径（如 `/foo`）
- **THEN** 系统 SHALL 重定向到 `/`

### Requirement: 全局 Header
Header SHALL 在所有页面顶部显示品牌 Logo + 副标；落地页与工坊页 SHALL 在 Header 右侧显示不同的操作按钮组。

#### Scenario: Header 在所有页面可见
- **WHEN** 用户访问 `/` 或 `/studio`
- **THEN** 页面顶部 SHALL 显示完整的 Header（Logo + 副标 + 对应操作按钮组）

### Requirement: 全局 Footer
Footer SHALL 在所有页面底部显示归属与许可元数据（`AGPL-3.0 OPEN SOURCE` 与开源项目致谢）。

#### Scenario: Footer 在所有页面可见
- **WHEN** 用户访问 `/` 或 `/studio`
- **THEN** 页面底部 SHALL 显示归属与许可元数据