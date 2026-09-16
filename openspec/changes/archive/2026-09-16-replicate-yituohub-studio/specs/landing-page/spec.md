## Purpose

落地页 `/` 提供项目品牌入口与高审美 Hero 视觉，承担两个核心任务：传递"Markdown → WeChat HTML Studio"的产品定位，并将用户引导至工坊页 `/studio` 浏览主题或直接开始排版。

## ADDED Requirements

### Requirement: 全屏背景 Hero 展示
页面 SHALL 在首屏（100vh）展示背景照片，并以雾凇渐变叠加保证标题可读；上方固定 Header。背景图 SHALL 提供 4 款免版权候选（雪山 / 雾山 / 云海 / 雪林），默认为雾山，新访客与未存储选择时均回落默认。

#### Scenario: 访问首页加载完整 Hero
- **WHEN** 用户访问 `/` 且页面渲染完成
- **THEN** 页面 SHALL 在 100vh 高度内呈现背景照片，居中显示主标题"把 Markdown，排成高级感。"、副标识"Markdown → WeChat HTML · 33 Themes · 4 Collections"与顶部 Header

### Requirement: 背景切换器
页面底部居中 SHALL 提供胶囊分段切换器，含 4 个背景选项（雪山 / 雾山 / 云海 / 雪林）；点击 SHALL 以 0.8s 淡入淡出切换背景；当前项 SHALL 以深色高亮并携带 `aria-pressed`；选择 SHALL 写入 localStorage（key `md2gzh.v1.heroBg`），刷新后 SHALL 恢复；其余背景 SHALL 在浏览器空闲时预载，保证切换即时。

#### Scenario: 切换背景并持久化
- **WHEN** 用户点击切换器中的"云海"
- **THEN** 背景 SHALL 淡入为云海图，"云海"按钮 SHALL 变为高亮且 `aria-pressed=true`
- **AND** 刷新页面后背景 SHALL 保持云海

### Requirement: 顶部导航与品牌区
Header SHALL 包含品牌图标 + "公众号排版"主标 + "Markdown → WeChat HTML Studio"副标；右侧 SHALL 提供"进入工坊"按钮。页面 SHALL 不包含 GitHub 外链。

#### Scenario: 点击"进入工坊"跳转工坊页
- **WHEN** 用户点击"进入工坊"按钮
- **THEN** 系统 SHALL 跳转至 `/studio`

### Requirement: 双 CTA 引导
Hero 区域 SHALL 提供两个行动按钮："开始排版"（主操作，深色实心）与"浏览 33 套主题"（次操作，下划线文字链）；两者均 SHALL 跳转至 `/studio`；右下角 SHALL 另有圆形箭头 CTA 同样跳转 `/studio`。

#### Scenario: 双 CTA 同时可见且可点击
- **WHEN** Hero 区域渲染完成
- **THEN** 两个 CTA 按钮 SHALL 同时可见且均可点击
- **AND** 点击任一按钮 SHALL 跳转至 `/studio`

### Requirement: 场景动效
背景层 SHALL 随鼠标位移产生视差；页面 SHALL 呈现三组漂移雾层动效；桌面指针环境 SHALL 启用自定义光标（即时小点 + 延迟圆环，悬停可点元素时圆环放大）；`prefers-reduced-motion` 与触点设备 SHALL 停用上述动效。

#### Scenario: reduced-motion 下不动效
- **WHEN** 系统开启"减弱动态效果"
- **THEN** 雾层漂移与视差 SHALL 停用，页面仍完整可读可操作