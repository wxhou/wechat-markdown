## Purpose

落地页 `/` 提供项目品牌入口与高审美 Hero 视觉，承担两个核心任务：传递"Markdown → WeChat HTML Studio"的产品定位，并将用户引导至工坊页 `/studio` 浏览主题或直接开始排版。

## ADDED Requirements

### Requirement: 全屏雪山 Hero 展示
页面 SHALL 在首屏（100vh）展示雪山背景图，并以雾凇渐变叠加保证标题可读；上方固定 Header，左下/右下各放置一行声明文字。

#### Scenario: 访问首页加载完整 Hero
- **WHEN** 用户访问 `/` 且页面渲染完成
- **THEN** 页面 SHALL 在 100vh 高度内呈现雪山背景图，居中显示主标题"把 Markdown，排成高级感。"、副标识"Markdown → WeChat HTML · 33 Themes · 4 Collections"、顶部 Header 与底部双声明

### Requirement: 顶部导航与品牌区
Header SHALL 包含品牌图标 + "YI TUO HUB STUDIO" 主标 + "公众号排版工坊" 副标 + "MARKDOWN → WECHAT HTML STUDIO" 英文副标识；右侧 SHALL 提供 GitHub 仓库外链图标与"进入工坊"主按钮。

#### Scenario: 顶部品牌与 GitHub 入口可见
- **WHEN** 用户访问 `/`
- **THEN** 顶部 SHALL 显示完整的品牌组合标识（图标 + 主副标题 + 英文副标识）
- **AND** 右上角 SHALL 至少包含 GitHub 外链图标与"进入工坊"按钮两项

#### Scenario: 点击"进入工坊"跳转工坊页
- **WHEN** 用户点击"进入工坊"按钮
- **THEN** 系统 SHALL 跳转至 `/studio` 路由

### Requirement: 双 CTA 引导
Hero 区域 SHALL 提供两个行动按钮："开始排版"（主操作，深色实心）与"浏览 33 套主题"（次操作，描边）；两者均 SHALL 跳转至 `/studio`。

#### Scenario: 双 CTA 同时可见且可点击
- **WHEN** Hero 区域渲染完成
- **THEN** 两个 CTA 按钮 SHALL 同时可见且均可点击
- **AND** 点击任一按钮 SHALL 跳转至 `/studio`

### Requirement: 底部声明区
页面底部 SHALL 显示两段元数据：左侧"AGPL-3.0 OPEN SOURCE"、右侧"基于 GZH-DESIGN-SKILL 深度定制"。

#### Scenario: 底部元数据对齐到左右两端
- **WHEN** 页面底部区域渲染完成
- **THEN** 两段元数据 SHALL 分别固定在视口的左下与右下