# 公众号排版工坊（YI TUO HUB STUDIO 复刻）

本地 1:1 复刻 [YI TUO HUB STUDIO](https://studio.yituohub.com/) 的 React 实现——粘贴 Markdown，一键排版为可直接粘贴到微信公众号编辑器的精致 HTML。

> 原项目为 **AGPL-3.0** 开源（[yan9651688/yituo-hub](https://github.com/yan9651688/yituo-hub)）。本仓库的渲染管线与样式系统移植自原站（见 [LICENSE](./LICENSE)），同样以 AGPL-3.0 分发。

## 快速开始

```bash
npm install
npm run dev        # 开发模式 → http://127.0.0.1:5173/
```

生产构建与预览：

```bash
npm run build      # 产物在 dist/
npm run preview    # → http://127.0.0.1:4173/
```

其他脚本：`npm run typecheck`（TS 严格检查）、`npm run lint`（ESLint，0 警告门禁）。

## 功能

- **落地页 `/`**：雪山云雾场景（视差 + 雾层动效 + 自定义光标）、4 款可切换背景（默认雾山，选择持久化）、双 CTA 进入工坊
- **工坊页 `/studio`**：Markdown ↔ 微信 HTML 实时互预
  - **33 套主题 / 4 大合集**：杂志编辑部（6）、经典复刻（6）、新锐系列（6）、高级排版（15）
  - **高级排版**：6 档视觉等级（L1 黑白极简 → L6 完整主题动效）× 每主题 5 套配色，148 个 SVG 动效组件 + 30 个冻结模板
  - **双向同步滚动**（本项目新增，原站没有）
  - **合规校验**：实时徽标（✓ 平台合规 / ⚠ 建议 / ✗ 错误）+ 可展开校验面板
  - **三项导出**：复制到公众号（富文本剪贴板）、下载 HTML、导出长图 PNG
  - **会话持久化**（本项目新增）：刷新恢复文章与全部设置
  - 预览宽度切换：适应 / 375 / 402 / 440

## 技术栈

- React 18 + Vite + TypeScript（strict 全开）
- 渲染管线（移植自原站，verbatim）：`themes.js`（33 套参数化主题工厂）、`converter.js`（Markdown → 语义 token）、`validator.js`（平台红线校验）、`original-visuals*.js`（Production V6 视觉系统）
- React 层：页面壳 + `useStudio` 状态机（移植自原站 `app.js`）+ 双向滚动同步 + 持久化

## 目录

```
public/            # 原站 AGPL 资产（verbatim 移植）
  motion/          # 148 SVG 组件 + manifest + 30 冻结模板
  vendor/          # marked + html2canvas（原站同版本）
src/
  pages/           # LandingPage / StudioPage / useStudio（状态机）
  components/      # 图标
  lib/             # 渲染器脚本加载器
```

## 许可

AGPL-3.0 —— 详见 [LICENSE](./LICENSE)。基于 [gzh-design-skill](https://github.com/isjiamu/gzh-design-skill) 与 [wechat-motion-layout-studio](https://github.com/lanmengSakura/wechat-motion-layout-studio) 融合打造的原项目。
