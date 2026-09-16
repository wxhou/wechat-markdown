## Purpose

导出能力让用户将当前主题与内容以三种形式带走：本地 HTML 文件、长图 PNG、微信公众号剪贴板内容。所有导出 SHALL 复用当前主题、等级与配色，并保留已配置的署名。

## ADDED Requirements

### Requirement: 下载 HTML
"下载 HTML"按钮 SHALL 触发浏览器下载一份带内联样式的 `.html` 文件，文件名 SHALL 包含文章标题、主题标识与时间性后缀（高级排版另含等级 / 动静态 / 配色标识）。

#### Scenario: 下载包含内联样式的 HTML
- **WHEN** 用户点击"下载 HTML"
- **THEN** 浏览器 SHALL 立即下载一份 `.html` 文件，且 SHALL 包含当前主题的内联样式、内容 HTML 与署名；打开下载文件 SHALL 与工坊预览视觉一致

### Requirement: 导出长图
"导出长图"按钮 SHALL 将预览区域渲染为一张 PNG 图片并下载；导出中 SHALL 显示进度反馈（"正在生成…"）并禁用按钮；超长文章 SHALL 限制画布尺寸并给出可读错误；图片 SHALL 等待加载完成后再渲染。

#### Scenario: 导出预览为 PNG 图片
- **WHEN** 用户点击"导出长图"
- **THEN** 浏览器 SHALL 下载一份 `.png` 文件，且 SHALL 与当前预览视觉一致（主题样式 + 内容 + 署名）

### Requirement: 复制到公众号
"复制到公众号"按钮 SHALL 将渲染后的 HTML 与纯文本兜底写入剪贴板（`text/html` + `text/plain` 双格式），且 SHALL 提供可见的成功反馈；ClipboardItem 不可用时 SHALL 降级为隐藏节点 execCommand 复制并提示"兼容模式"。

#### Scenario: 点击复制并粘贴到微信编辑器
- **WHEN** 用户点击"复制到公众号"按钮
- **THEN** 剪贴板 SHALL 包含公众号兼容 HTML，UI SHALL 显示"已复制"等可见反馈
- **AND** 当用户粘贴到微信公众号编辑器时 SHALL 保留主题样式

### Requirement: 导出前确保最新渲染
用户在防抖窗口内（350ms）点击任一导出按钮时，系统 SHALL 先完成最新内容的渲染再导出，避免导出过期产物。

#### Scenario: 快速编辑后立即导出
- **WHEN** 用户停止输入后 350ms 内点击"下载 HTML"
- **THEN** 导出文件 SHALL 反映最新编辑内容