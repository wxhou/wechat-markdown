## Context

项目从零起步，目标是本地 1:1 复刻 https://studio.yituohub.com/。**架构决策（实现中期修订）**：对比验证阶段确认原站为 AGPL-3.0 开源项目，且首版"Tailwind 近似复刻"与原站存在大量视觉差异（无封面卡/章节编号/目录卡组件、无电影感 CSS 变量体系、无雾层与自定义光标动效）。经用户确认，改为**忠实移植策略**：原站的 styles.css / landing.css / themes.js / converter.js / validator.js / original-visuals*.js 及 148 个 SVG 组件、30 个冻结模板按 AGPL 原样移植到 public/（见 LICENSE.md），React 仅承载页面壳、路由与状态管理（app.js 的状态机移植为 useStudio hook）。这是达成"1:1 复刻"的唯一可靠路径。

## Goals / Non-Goals

**Goals:**
- 在本地构建一个生产级 Vite + React 18 + TS + Tailwind 工程基座
- 落地页与工坊页的视觉、交互、文案与原站肉眼一致
- 实现 Markdown → 微信兼容 HTML 的真实渲染管线（marked + DOMPurify）
- 交付完整的 33 套主题 + 4 大合集，且支持运行时切换与导出
- 三项导出能力（HTML 下载 / 长图 / 复制公众号）全部可用

**Non-Goals:**
- 不实现后端服务、不接入真实公众号 OAuth / 上传 API
- 不接入 gzh-design-skill 原仓代码（避免依赖网络与兼容性风险）
- 不实现主题的"在线保存到云端"
- 不在视觉层引入无关插画、动效或音乐

## Decisions

### 1. 技术栈：Vite + React 18 + TypeScript + Tailwind CSS
- **理由**：用户已确认；Vite 启动快且零配置 HMR；TS 强类型利于主题数据建模；Tailwind 适合"极简高级感"语义化样式。
- **替代**：Next.js（更重且当前无需 SSR）；CRA（已停止维护）。
- **影响**：选用 `@vitejs/plugin-react` 与 SWC 编译器；ESLint + Prettier 严格模式 + tsc strict。

### 2. Markdown 解析：marked + DOMPurify
- **理由**：`marked` 在 GitHub Markdown 兼容度与性能间平衡最佳；`DOMPurify` 提供 XSS 白名单净化；二者体积小、零依赖原生 ESM。
- **替代**：`remark` + `rehype` 生态（更强大但体积与 API 复杂度更高）；手写正则（脆性高，禁用于 XSS 防护场景）。
- **影响**：渲染管线分两步——`marked.parse` → `DOMPurify.sanitize` → 主题样式注入。

### 3. 主题系统：CSS-in-style 注入 + 注册表模式
- **理由**：每套主题以独立 CSS 字符串形式注册，运行时通过 `<style>` 标签或作用域 className 注入到预览容器；导出时直接内联到 HTML 文件中，无需外部 CSS。
- **替代**：CSS 变量切换（受限于微信编辑器不支持 CSS 变量）；按主题拆分多 CSS 文件（运行时 IO 与缓存管理复杂）。
- **影响**：主题数据模型为 `Theme = { id, name, tagline?, collection, css: string, palette? }`；注册表 `themes/index.ts` 统一导出。

### 4. 路由：React Router v6
- **理由**：成熟方案且只需两条路由；与 Vite + React 18 无任何兼容问题。
- **影响**：`<BrowserRouter>` + `<Routes>` + 重定向兜底。

### 5. 图片导出：html2canvas
- **理由**：业内事实标准；与 React 容器渲染兼容；支持自定义高度与缩放。
- **替代**：原生 `canvas` + 序列化（实现成本过高）；dom-to-image（维护活跃度低）。
- **影响**：在工坊页异步懒加载，避免影响首屏体积。

### 6. 复制到公众号：navigator.clipboard.write + 备用降级
- **理由**：现代浏览器 `ClipboardItem` 支持 `text/html` MIME，可在微信编辑器中保留样式；不可用时降级到 `document.execCommand('copy')` + 临时 `<div>`。
- **影响**：在 `lib/clipboard.ts` 中封装 `copyHtmlToClipboard(html)`。

### 7. Hero 背景：Unsplash 直链
- **理由**：用户已确认；Unsplash 提供稳定的雪景雾凇图，支持尺寸参数；直链无需下载到本地，避免版权风险。
- **影响**：在 `landing-page` 组件中以 `<img>` 引用 `https://images.unsplash.com/...`。

### 8. 字体策略：系统无衬线 + 中英文混排
- **理由**：原站使用系统无衬线大标题（衬线感弱），中文使用系统字体栈；不引入额外 webfont 体积。
- **影响**：在 `tailwind.config.ts` 中定义 `font-family`：英文 `-apple-system, BlinkMacSystemFont, "Segoe UI"`，中文 `"PingFang SC", "Microsoft YaHei"`，代码 `"JetBrains Mono", "Fira Code"`。

## Risks / Trade-offs

- **marked 对 GFM 表格支持需开启 option** → Mitigation：在初始化时显式开启 `gfm: true`、`breaks: false`、`tables: true`。
- **html2canvas 在深色背景上的文字抗锯齿** → Mitigation：导出前临时把预览背景替换为白色，导出后还原。
- **33 套主题的"完全"实现工作量高** → Mitigation：首批实现 3 套完整示范主题（深海蓝、曙光橙、档案棕褐），其余 30 套用真实名称 + 占位 CSS（继承深海蓝基础 + 仅修改主色调），保证名称与合集归属真实，tasks 中分阶段补全。
- **微信公众号编辑器实际剥离部分样式（如 `<style>` 块）** → Mitigation：将样式以 `<section style="...">` 行内嵌入到每个元素上，最大化兼容性。
- **Unsplash 直链受网络影响** → Mitigation：在 README 中说明网络要求；如离线可通过 alt 文字与纯 CSS 灰蓝渐变降级。

## Migration Plan

本变更属于一次性新建项目，无既有部署需要迁移。部署步骤：
1. `npm install` 安装依赖
2. `npm run dev` 本地启动（端口 5173）
3. 浏览器访问 `/` 与 `/studio` 验证
4. `npm run build` 生成生产产物
5. 任何静态托管（Pages、Vercel、Netlify）可直接部署 `dist/`

回滚策略：删除新建的 `src/`、`public/`、`*.config.*`、`package.json` 等即可回到空仓库状态。

## Open Questions

- ~~33 套主题的具体清单与命名是否需要从原站目录抓取？~~ → **已解决**：通过浏览器 DOM 提取全部 33 套主题完整名称与 4 大合集归属（详见 `specs/theme-system/spec.md`）
- ~~字号下拉的"15 套"具体档位？~~ → **已解决**：原站不存在独立字号下拉，"高级排版 15 套"实际是第 4 合集（15 套主题）的入口按钮