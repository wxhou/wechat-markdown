## Purpose

主题系统提供 33 套主题样式与 4 大合集分类的数据模型、加载策略与运行时切换能力，是工坊页"主题下拉"的支撑层。所有主题 SHALL 同时支持实时预览与导出 HTML。

## ADDED Requirements

### Requirement: 33 套主题数据完整
系统 SHALL 在 `src/themes/` 下提供 33 套主题定义，按 4 大合集分类（杂志编辑部 6 / 经典复刻 6 / 新锐系列 6 / 高级排版 15），并具备可枚举的 `id`、中文 `name`、合集归属 `collection`、可选 `tagline`（如"科技蓝 · 教程与实战首选"）与 `palette` 等元数据。

#### Scenario: 加载主题目录共 33 套
- **WHEN** 应用启动并读取主题注册表
- **THEN** 主题总数 SHALL 等于 33，且每套主题 SHALL 归属于恰好一个合集；合集数量 SHALL 等于 4

### Requirement: 主题切换无刷新
用户在下拉中切换主题时 SHALL 仅触发预览样式与编辑器视觉的更新，URL SHALL 不变更、文档 SHALL 不重新加载。

#### Scenario: 切换主题仅更新样式
- **WHEN** 用户在主题下拉中选择不同主题
- **THEN** 预览 SHALL 立即应用所选主题样式
- **AND** 文档 SHALL 不重新加载，URL SHALL 保持 `/studio`

### Requirement: 主题样式与微信兼容 HTML 注入
每套主题 SHALL 以 CSS-in-style 形式注入预览容器，确保导出的 HTML 可独立在微信公众号编辑器中正常显示。

#### Scenario: 导出 HTML 在微信编辑器中保留样式
- **WHEN** 用户在主题 A 下点击"下载 HTML"
- **THEN** 下载文件 SHALL 包含主题 A 的完整样式（内联 `<style>`）且无外部 CSS 依赖

### Requirement: 4 大合集分类展示
基础主题下拉 SHALL 按"杂志编辑部 / 经典复刻 / 新锐系列" 3 子合集分组显示，每组 SHALL 有可视化的组标题（带计数徽标，如"杂志编辑部 6"）；高级排版下拉 SHALL 直接平铺展示 15 套主题，无子分组。

#### Scenario: 基础下拉按 3 子合集分组
- **WHEN** 用户打开"基础"主题下拉
- **THEN** SHALL 出现 3 个子合集组标题（杂志编辑部 / 经典复刻 / 新锐系列），每组下 SHALL 列出对应主题条目
- **AND** 每组标题 SHALL 附带主题计数（如"杂志编辑部 6"）

#### Scenario: 高级排版下拉平铺展示
- **WHEN** 用户打开"高级排版"下拉
- **THEN** SHALL 直接列出 15 套主题（无子合集分组）