## 1. 项目初始化与脚手架

- [x] 1.1 用 `npm create vite@latest . -- --template react-swc-ts` 在仓库根初始化项目；删除 Vite 默认模板（App.css、index.css 默认内容、logo.svg），并验证 `package.json` 中 React 18 + TS + SWC 已就位
- [x] 1.2 追加依赖：`react-router-dom marked dompurify html2canvas`；追加开发依赖：`tailwindcss postcss autoprefixer @tailwindcss/typography eslint-plugin-react eslint-config-prettier prettier`；运行 `npm install` 验证无错误
- [x] 1.3 初始化 Tailwind：`npx tailwindcss init -p`；在 `tailwind.config.ts` 配置 `content` 覆盖 `index.html` 与 `src/**/*.{ts,tsx}`；在 `src/index.css` 顶部加入 `@tailwind base/components/utilities`
- [x] 1.4 配置 `tsconfig.json` 启用 `strict`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`；配置 `.eslintrc.cjs` + `.prettierrc`；添加 `npm run lint`、`npm run typecheck`、`npm run format` 脚本
- [x] 1.5 在 `package.json` 加入 `engines.node >=18`；创建 `tmp/.gitignore` 与根 `.gitignore`（包含 `node_modules/`、`dist/`、`tmp/`、`*.local`）；验证 `npm run typecheck` 与 `npm run lint` 通过空模板

## 2. 应用外壳与路由

- [x] 2.1 创建 `src/components/Header.tsx`、`src/components/Footer.tsx`、`src/components/Logo.tsx`；Header 接收 `variant: "landing" | "studio"` 决定右侧按钮组；验证两个 variant 渲染对应的按钮集
- [x] 2.2 在 `src/App.tsx` 中接入 `BrowserRouter` + `Routes`：路由 `/` 渲染 `<LandingPage/>`、`/studio` 渲染 `<StudioPage/>`、其它路径 `Navigate to="/"`；验证访问 `/foo` 重定向到 `/`
- [x] 2.3 创建 `src/pages/LandingPage.tsx`、`src/pages/StudioPage.tsx` 占位（先输出"建设中"文本），并验证两个路由都可访问

## 3. 落地页视觉与组件

- [x] 3.1 在 `LandingPage.tsx` 实现全屏 Hero：使用 Unsplash 直链 `https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=2400&q=80` 作为背景，加白色-雾灰渐变蒙层；验证浏览器中呈现雪山雾凇背景
- [x] 3.2 实现 Hero 文案：英文副标 "YI TUO HUB STUDIO · TYPESET FOR WECHAT"、主标 "把 Markdown，排成高级感。"、副标 "MARKDOWN → WECHAT HTML · 33 THEMES · 4 COLLECTIONS"；验证字号、字重、颜色与原站接近（深蓝灰 #1e293b）
- [x] 3.3 实现双 CTA："开始排版"（深色实心）+ "浏览 33 套主题"（描边）；两者均通过 `useNavigate` 跳到 `/studio`；验证点击后路由切换
- [x] 3.4 实现底部双声明："AGPL-3.0 OPEN SOURCE"（左下）、"基于 GZH-DESIGN-SKILL 深度定制"（右下），固定视口底部；验证浏览器缩放时仍贴底

## 4. 主题系统数据与注册表

- [x] 4.1 定义 `src/themes/types.ts`：`Theme = { id; name; tagline?; collection: "magazine" | "classic" | "cutting" | "premium"; css: string; palette? }`；`COLLECTIONS` 常量映射 4 大合集（含 displayName 与 emoji/icon）；验证 TypeScript 编译通过
- [x] 4.2 实现 3 套完整主题作为示范：`deep-ocean.ts`（深海蓝，科技蓝）、`dawn-orange.ts`（曙光橙，暖橙）、`archive-brown.ts`（档案棕褐，高级排版）；每套主题提供完整内联 CSS（标题、段落、引用、代码块、列表、表格、链接、署名等元素样式）；验证主题切换时预览区视觉变化
- [x] 4.3 在 `src/themes/index.ts` 注册全部 33 套主题：3 套完整样式 + 30 套"占位主题"（继承 `deep-ocean` 基础 CSS + 独立 `id`/`name`/`tagline`/`collection`，主色按名称合理替换）；名称严格按 4.4 列表；验证 `THEMES.length === 33` 且各合集数 = 6/6/6/15
- [x] 4.4 创建 `src/components/ThemePicker.tsx`：两个独立的 picker 按钮 — 基础入口（"基础 / 当前主题"）打开 18 套主题并按 3 子合集分组（杂志编辑部/经典复刻/新锐系列，每组带计数徽标）、高级排版入口（"高级排版 / 15 套"）平铺展示 15 套主题；两入口互斥显示当前主题；验证下拉按合集结构正确

## 5. Markdown 渲染管线

- [x] 5.1 创建 `src/lib/markdown.ts`：`renderMarkdown(md: string)` 使用 `marked` 启用 `gfm/tables/breaks=false` 后返回 HTML；`sanitize(html)` 使用 `DOMPurify` 白名单（保留基础标签 + `style` 属性）；验证输入标准 Markdown 输出合法 HTML
- [x] 5.2 在 `src/lib/markdown.ts` 导出 `renderForWechat(md, theme)`：依次执行 `marked → DOMPurify → 注入 theme.css 到 <style> 块 → 包入 <section style="...">`；验证输出可在微信编辑器粘贴
- [x] 5.3 单元化核心解析：创建 `src/lib/__tests__/markdown.test.ts`（vitest）覆盖标题/列表/代码块/表格/链接/危险脚本过滤；运行 `npm test` 验证通过（覆盖率仅核心解析，不测 UI）

## 6. 工坊页布局与编辑器

- [x] 6.1 实现 `StudioPage.tsx` 双栏布局：左侧 Markdown 编辑器（`<textarea>`），右侧公众号预览；工具栏分别在两栏顶部；验证两栏顶部对齐、宽度按 50/50 平分
- [x] 6.2 实现 `src/components/EditorToolbar.tsx`：两个主题入口按钮（`ThemePicker` 接入）+ 署名输入 + "载入示例" + "清空"；通过 props 接收当前状态与回调；验证全部控件可见可交互
- [x] 6.3 实现 `src/components/PreviewToolbar.tsx`："公众号预览" + 状态徽标 + 设备宽度切换（"适应"/"小屏 375"/"标准 402"/"大屏 440"）；切换宽度通过 props 回调；验证切换立即改变预览宽度
- [x] 6.4 实现 `src/components/Preview.tsx`：接收 `themeId/fontSize/signature/viewport`，使用 `useMemo` 调用 `renderForWechat` 渲染 HTML；嵌入主题 `<style>` 块；切换主题/字号 SHALL 触发重渲染；验证输入 Markdown 后右侧预览同步更新
- [x] 6.5 实现 `src/lib/example.ts`：导出 `EXAMPLE_MD`（覆盖标题、段落、列表、引用、代码块、表格、图片、链接等元素，对齐原站示例）；验证"载入示例"点击后预览渲染该示例

## 7. 签名

- [x] 7.1 在 `renderForWechat` 末尾追加署名 `<p>`（当 signature 非空），署名样式来自当前主题；验证填写署名后预览末尾出现，清空后消失
- [x] 7.2 验证工坊页所有控件（无字号下拉）：两个主题入口、署名输入、载入示例、清空、设备宽度切换 — 与原站保持一致

## 8. 导出能力

- [x] 8.1 在 `src/lib/exporters.ts` 实现 `downloadHtml({ html, themeId, signature })`：拼接完整 `<!doctype html>` 文档（含 `<style>` 与正文），通过 `Blob` + `URL.createObjectURL` + 临时 `<a download>` 触发下载，文件名 `yituohub-{themeId}-{timestamp}.html`；验证下载文件可打开且样式保留
- [x] 8.2 实现 `exportLongImage(ref: HTMLElement, fileName)`：调用 `html2canvas` 渲染元素为 PNG 并下载；导出前临时把背景改为白色，导出后还原；验证下载 PNG 与预览视觉一致
- [x] 8.3 在 `src/lib/clipboard.ts` 实现 `copyHtmlToClipboard(html)`：优先 `navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })])`，降级到 `document.execCommand('copy')` + 临时 `<div>`；调用后 UI 显示"已复制"反馈（2s 后自动消失）；验证粘贴到微信编辑器保留样式
- [x] 8.4 在 Header 工坊变体的按钮组上接入三个导出能力；点击后立即执行对应函数；验证点击"复制到公众号"后页面顶部/按钮旁出现"已复制"提示

## 9. 端到端验证

- [x] 9.1 在浏览器中访问 `http://localhost:5173/`，对照原站 https://studio.yituohub.com/ 截图逐项核对 Header / Hero 文案 / CTA / 底部声明；记录差异
- [x] 9.2 在浏览器中访问 `/studio`，验证双栏布局、工具栏全部控件、实时预览、主题切换字号切换设备宽度切换全部工作；记录差异
- [x] 9.3 验证三项导出：下载 HTML 文件后用浏览器打开与工坊预览一致；导出长图 PNG 后与预览一致；点击复制后在微信公众号编辑器粘贴保留主题样式
- [x] 9.4 跑 `npm run typecheck`、`npm run lint`、`npm test`；任一失败 SHALL 修复直到全部通过
- [x] 9.5 跑 `npm run build` 验证生产产物 `dist/` 生成；用 `npx vite preview` 启动并访问两条路由，确认生产模式无运行时报错