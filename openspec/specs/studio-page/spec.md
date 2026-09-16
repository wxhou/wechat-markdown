## Purpose

工坊页 `/studio` 提供 Markdown 实时渲染为公众号兼容 HTML 的核心工作面板，左侧编辑、右侧预览、双侧均可独立操作，工具栏集中管理主题、署名与导出行为。

## Requirements

### Requirement: 双栏布局与基本结构
桌面端页面 SHALL 采用左右双栏布局：左侧 Markdown 编辑器、右侧公众号预览；顶部 SHALL 复用全局 Header，底部 SHALL 显示开源致谢页脚。

#### Scenario: 进入工坊页呈现完整双栏
- **WHEN** 用户访问 `/studio`
- **THEN** 顶部 Header SHALL 显示 Logo + "首页" / "下载 HTML" / "导出长图" / "复制到公众号" 控件
- **AND** 主体 SHALL 分为左右两栏，左栏为 Markdown 编辑器，右栏为公众号预览
- **AND** 页脚 SHALL 显示致谢与 AGPL-3.0 声明

### Requirement: 编辑器工具栏
编辑器头部 SHALL 包含两个独立的主题入口按钮（基础 / 高级排版）、"署名"输入框（placeholder "你的名字（可空）"，最长 24 字）、"载入示例"按钮、"清空"按钮。原站不存在独立的字号选择器。

#### Scenario: 工具栏全部控件可见可交互
- **WHEN** 工坊页加载完成
- **THEN** 两个主题入口按钮、署名输入框、载入示例与清空按钮 SHALL 全部可见且可交互

### Requirement: 预览工具栏与状态徽标
预览头部 SHALL 显示标题"公众号预览"、合规状态徽标（`✓ 平台合规` / `⚠ N 条建议` / `✗ N 个错误`）以及设备宽度切换组（"适应" / "小屏 375" / "标准 402" / "大屏 440"），其中"适应"对应最大 500 CSS px 的舒适阅读容器。徽标 SHALL 为真实按钮，可展开/收起校验明细面板。

#### Scenario: 切换设备宽度立即生效
- **WHEN** 用户点击宽度切换项（"小屏 375" / "标准 402" / "大屏 440"）
- **THEN** 预览区 SHALL 立即按所选宽度（375 / 402 / 440 px）展示，且"适应"选项 SHALL 让预览宽度跟随容器（最大 500px）

#### Scenario: 徽标展开校验面板
- **WHEN** 存在校验错误或建议且用户点击徽标
- **THEN** 预览下方 SHALL 展开校验明细（错误 ✗ / 建议 ⚠ 逐行列出）；再次点击 SHALL 收起

### Requirement: 实时预览渲染
预览区 SHALL 在 Markdown 内容变化时（350ms 防抖）同步渲染微信公众号兼容 HTML；输入为空时 SHALL 渲染兜底封面。渲染 SHALL 处理竞态：连续输入时仅最新一次渲染生效；高级排版渲染中断（切换主题/输入）时 SHALL 终止过期请求。

#### Scenario: 编辑内容后预览同步更新
- **WHEN** 用户在编辑器中输入 Markdown
- **THEN** 右侧预览 SHALL 渲染对应主题样式后的微信兼容 HTML，无明显可感知延迟（≤300ms 防抖外）

### Requirement: 编辑器与预览双向同步滚动
编辑器滚动 SHALL 按比例同步预览滚动，预览滚动 SHALL 同步编辑器；同步 SHALL 防回声（单侧滚动源在下一动画帧内抑制反向回声）。预览滚动面 SHALL 为预览容器（iframe 撑至内容全高）。

#### Scenario: 编辑器滚动带动预览
- **WHEN** 用户滚动编辑器到中部
- **THEN** 预览 SHALL 按相同滚动比例滚动

### Requirement: 会话持久化恢复
工坊页 SHALL 将编辑内容、署名、主题、入口、视觉等级、动态开关、配色与预览宽度防抖（1s）持久化到 localStorage（key `md2gzh.v1.session`）；刷新或重开页面 SHALL 恢复全部设置。

#### Scenario: 刷新后恢复会话
- **WHEN** 用户修改主题并输入内容后刷新页面
- **THEN** 编辑器、署名与全部设置 SHALL 恢复为刷新前的状态

### Requirement: 清空与撤销
"清空"按钮 SHALL 清空编辑器内容，并 SHALL 展示 5 秒可撤销的提示 toast（"已清空 / 撤销"）；署名 SHALL 保留。普通提示 toast SHALL 2.4 秒自动消失。

#### Scenario: 点击清空后撤销
- **WHEN** 用户点击"清空"并在 5 秒内点击"撤销"
- **THEN** 编辑器 SHALL 先变空，撤销后 SHALL 恢复原内容