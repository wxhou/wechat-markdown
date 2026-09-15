## Purpose

工坊页 `/studio` 提供 Markdown 实时渲染为公众号兼容 HTML 的核心工作面板，左侧编辑、右侧预览、双侧均可独立操作，工具栏集中管理主题、字号、签名与导出行为。

## ADDED Requirements

### Requirement: 双栏布局与基本结构
页面 SHALL 采用左右双栏布局：左侧 Markdown 编辑器、右侧公众号预览；顶部 SHALL 复用全局 Header，底部 SHALL 显示版权与许可元数据。

#### Scenario: 进入工坊页呈现完整双栏
- **WHEN** 用户访问 `/studio`
- **THEN** 顶部 Header SHALL 显示 Logo + GitHub + "首页"/"下载 HTML"/"导出长图"/"复制到公众号" 控件
- **AND** 主体 SHALL 分为左右两栏，左栏为 Markdown 编辑器，右栏为公众号预览
- **AND** 页脚 SHALL 显示归属与 AGPL-3.0 声明

### Requirement: 编辑器工具栏
编辑器头部 SHALL 包含两个独立的主题入口按钮（基础 / 高级排版）、"署名"输入框（placeholder "你的名字（可空）"）、"载入示例"按钮、"清空"按钮。原站不存在独立的字号选择器。

#### Scenario: 工具栏全部控件可见可交互
- **WHEN** 工坊页加载完成
- **THEN** 两个主题入口按钮、署名输入框、载入示例与清空按钮 SHALL 全部可见且可交互

### Requirement: 预览工具栏与状态徽标
预览头部 SHALL 显示标题"公众号预览"、合规状态徽标"✓ 平台合规"（class `badge ok`）以及设备宽度切换组（"适应" / "小屏 375" / "标准 402" / "大屏 440"），其中"适应"对应最大 500 CSS px 的舒适阅读容器。

#### Scenario: 切换设备宽度立即生效
- **WHEN** 用户点击宽度切换项（"小屏 375" / "标准 402" / "大屏 440"）
- **THEN** 预览区 SHALL 立即按所选宽度（375 / 402 / 440 px）展示，且"适应"选项 SHALL 让预览宽度跟随容器（最大 500px）

### Requirement: 实时预览渲染
预览区 SHALL 在 Markdown 内容变化时同步渲染微信公众号兼容 HTML；当内容尚未输入时 SHALL 显示占位示例。

#### Scenario: 编辑内容后预览同步更新
- **WHEN** 用户在编辑器中输入 Markdown
- **THEN** 右侧预览 SHALL 渲染对应主题样式后的微信兼容 HTML，无明显可感知延迟（≤300ms）

### Requirement: 编辑器与预览高度对齐
两栏 SHALL 在视口内等高显示；当窗口缩放时两侧 SHALL 同步滚动或独立滚动但保持视觉对齐。

#### Scenario: 两栏顶部对齐
- **WHEN** 工坊页加载完成
- **THEN** 编辑器与预览的顶部 SHALL 处于同一水平线，宽度 SHALL 按可用空间合理分配