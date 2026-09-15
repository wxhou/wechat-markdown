## Purpose

导出能力让用户将当前主题与内容以三种形式带走：本地 HTML 文件、长图 PNG、微信公众号剪贴板内容。所有导出 SHALL 复用当前主题与字号，并保留已配置的署名。

## ADDED Requirements

### Requirement: 下载 HTML
"下载 HTML"按钮 SHALL 触发浏览器下载一份带内联样式的 `.html` 文件，文件名 SHALL 包含可读主题标识与时间戳。

#### Scenario: 下载包含内联样式的 HTML
- **WHEN** 用户点击"下载 HTML"
- **THEN** 浏览器 SHALL 立即下载一份 `.html` 文件，且 SHALL 包含当前主题的内联样式、内容 HTML 与署名；打开下载文件 SHALL 与工坊预览视觉一致

### Requirement: 导出长图
"导出长图"按钮 SHALL 调用图片导出能力将预览区域渲染为一张 PNG 图片并下载；导出过程 SHALL 显示进度反馈。

#### Scenario: 导出预览为 PNG 图片
- **WHEN** 用户点击"导出长图"
- **THEN** 浏览器 SHALL 下载一份 `.png` 文件，且 SHALL 与当前预览视觉一致（主题样式 + 内容 + 署名）

### Requirement: 复制到公众号
"复制到公众号"按钮 SHALL 将渲染后的 HTML 与样式写入剪贴板（兼容富文本/HTML 格式），且 SHALL 提供可见的成功反馈。

#### Scenario: 点击复制并粘贴到微信编辑器
- **WHEN** 用户点击"复制到公众号"按钮
- **THEN** 剪贴板 SHALL 包含公众号兼容 HTML，UI SHALL 显示"已复制"等可见反馈
- **AND** 当用户粘贴到微信公众号编辑器时 SHALL 保留主题样式