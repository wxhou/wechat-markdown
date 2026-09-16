## Why

目标网站 https://studio.yituohub.com/ 是一个聚焦微信公众号 Markdown 排版的极简工具站，包含一个高审美落地页和一个全功能 Markdown → 微信 HTML 工坊。当前仓库为空，没有任何代码与配置。本次变更从零搭建本地可运行的完整复刻版本：复刻视觉布局、文案与交互，并实现工坊页的 33 套主题系统与三项导出能力。完成后可在本地 `npm run dev` 直接访问并验证全部功能。

## What Changes

- **新增** Vite + React 18 + TypeScript + Tailwind CSS 项目脚手架（含 ESLint、Prettier、TypeScript 严格模式、React Router）
- **新增** 落地页 `/`：雪山 Hero（Unsplash 免费图）、顶部极简导航、双 CTA（开始排版 / 浏览 33 套主题）、底部 AGPL 标识
- **新增** 工坊页 `/studio`：双栏布局（左 Markdown 编辑器 / 右公众号预览）、两套主题入口（基础 18 套 / 高级排版 15 套）、签名编辑、载入示例/清空、设备宽度切换（适应/小屏 375/标准 402/大屏 440）
- **新增** Markdown → 微信 HTML 渲染管线（marked + DOMPurify），支持 33 套主题与 4 大合集分类
- **新增** 三项导出能力：下载 HTML、导出长图（html2canvas）、复制到公众号剪贴板
- **新增** 全局 Header / Footer 组件复用
- **新增** 33 套主题样式数据（含 4 大合集分组），以及基础数据驱动的主题切换器组件

## Capabilities

### New Capabilities

- `landing-page`：落地页 `/` 的完整视觉与导航行为（hero 背景、双 CTA、AGPL 页脚）
- `studio-page`：工坊 `/studio` 的双栏布局、工具栏、状态徽标、设备宽度切换
- `theme-system`：33 套主题 + 4 大合集的数据结构、样式策略、运行时切换能力
- `markdown-rendering`：Markdown 解析为微信兼容 HTML（带主题样式注入）的渲染管线
- `editor-features`：编辑器工具栏能力——主题选择、字号选择、签名编辑、载入示例、清空
- `export-functions`：下载 HTML、导出长图、复制到公众号三项导出能力
- `app-shell`：React Router、全局 Header / Footer、路由守卫、基础布局

### Modified Capabilities

无（项目从零起步，无既有 spec 可修改）

## Impact

- **新增依赖**：`vite`、`react`、`react-dom`、`react-router-dom`、`typescript`、`tailwindcss`、`marked`、`dompurify`、`html2canvas`、开发态 `eslint`、`prettier`、`@vitejs/plugin-react`
- **新增目录**：`src/`、`public/`、`src/pages/`、`src/components/`、`src/themes/`、`src/lib/`
- **新增配置文件**：`package.json`、`vite.config.ts`、`tsconfig.json`、`tailwind.config.ts`、`postcss.config.js`、`.eslintrc.cjs`、`.prettierrc`、`index.html`
- **影响系统**：本地开发服务器（默认 5173 端口）；不涉及后端、无外部 API 调用；所有资源本地化（含 Unsplash 图通过 `<img>` 直接引用）
- **AGPL-3.0 许可**：底部保留原项目许可标识与"基于 gzh-design-skill 深度定制"声明