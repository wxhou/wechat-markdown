# 公众号排版工坊

粘贴 Markdown，一键排版为可直接粘贴到微信公众号编辑器的精致 HTML。提供网页版与跨平台桌面版。

## 桌面版下载

从 [GitHub Releases](https://github.com/wxhou/wechat-markdown/releases) 按平台下载：

| 平台 | 安装包 | 首次启动 |
|---|---|---|
| macOS Apple Silicon / Intel | `.dmg` | **未签名**：右键 → 「打开」绕过 Gatekeeper 提示（只首次需要） |
| Windows 10/11 | `.exe`（NSIS 安装包） | SmartScreen 提示时点「仍要运行」 |
| Linux | `.AppImage` / `.deb` / `.rpm` | AppImage 需先 `chmod +x` |

桌面版跳过落地页直达工坊，功能与网页版一致，**离线可用**。数据存储在应用本地 WebView 存储区，卸载即清空。

自行构建需先安装 [Rust](https://rustup.dev/) 工具链：

```bash
npm install
npm run tauri:build   # 产物在 src-tauri/target/release/bundle/
```

## 快速开始（网页版）

```bash
npm install
npm run dev        # 开发模式 → http://127.0.0.1:5188/
npm run build      # 生产构建 → dist/
npm run preview    # 预览构建 → http://127.0.0.1:4173/
```

检查：`npm run typecheck` · `npm run lint` · `npm test`

## 功能

- **落地页 `/`**：4 款可切换背景（云海 / 雪山 / 湖光 / 森林，默认云海，选择持久化）、视差雾层与自定义光标、桌面版下载区块
- **工坊页 `/studio`**：
  - 33 套主题 / 4 大合集（杂志编辑部、经典复刻、新锐系列、高级排版）
  - 高级排版：6 档视觉等级 × 每主题 5 套配色
  - Markdown ⇄ 微信 HTML 实时互转；双向同步滚动（本项目新增）
  - 实时合规校验 + 可展开校验面板
  - 导出：复制为富文本、下载 HTML、长图 PNG
  - 会话持久化（本项目新增）：刷新恢复文章与全部设置
  - 预览宽度：适应 / 375 / 402 / 440

## 技术栈

React 18 + Vite + TypeScript（strict）。渲染管线 verbatim 移植自原站（`themes` / `converter` / `validator` / `original-visuals`），React 层负责页面壳、状态机、滚动同步与持久化。

## 许可

AGPL-3.0 —— 详见 [LICENSE](./LICENSE)。基于 [gzh-design-skill](https://github.com/isjiamu/gzh-design-skill) 与 [wechat-motion-layout-studio](https://github.com/lanmengSakura/wechat-motion-layout-studio) 融合打造的原项目。
