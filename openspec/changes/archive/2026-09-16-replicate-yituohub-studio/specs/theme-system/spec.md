## Purpose

主题系统提供 33 套主题样式与合集分类的数据模型、运行时切换能力，以及高级排版的视觉等级 / 配色 / 动静态维度，是工坊页"主题选择"的支撑层。所有主题 SHALL 同时支持实时预览与导出 HTML。

## ADDED Requirements

### Requirement: 33 套主题数据完整
系统 SHALL 提供 33 套主题定义（渲染器脚本 verbatim 移植自原站），按 4 大合集分类（杂志编辑部 6 / 经典复刻 6 / 新锐系列 6 / 高级排版 15），每套主题具备可枚举的 `id`、中文 `name`、英文标识、合集归属与色板元数据。

#### Scenario: 加载主题目录共 33 套
- **WHEN** 应用启动并读取主题注册表
- **THEN** 主题总数 SHALL 等于 33，且每套主题 SHALL 归属于恰好一个合集；合集数量 SHALL 等于 4

### Requirement: 主题切换无刷新
用户切换主题时 SHALL 仅触发预览样式与编辑器视觉的更新，URL SHALL 不变更、文档 SHALL 不重新加载。

#### Scenario: 切换主题仅更新样式
- **WHEN** 用户在主题弹层中选择不同主题
- **THEN** 预览 SHALL 立即应用所选主题样式
- **AND** 文档 SHALL 不重新加载，URL SHALL 保持 `/studio`

### Requirement: 主题样式与微信兼容 HTML 注入
每套主题 SHALL 以参数化主题工厂产出全内联样式（`<span leaf>` 结构、无 class/id 依赖），确保导出的 HTML 可独立在微信公众号编辑器中正常显示。

#### Scenario: 导出 HTML 在微信编辑器中保留样式
- **WHEN** 用户在主题 A 下点击"下载 HTML"
- **THEN** 下载文件 SHALL 包含主题 A 的完整内联样式且无外部 CSS 依赖

### Requirement: 基础合集分组展示
基础主题入口 SHALL 按"杂志编辑部 / 经典复刻 / 新锐系列" 3 子合集分组显示，提供"全部"过滤标签，每组标签 SHALL 附带主题计数（如"杂志编辑部 6"）；高级排版入口 SHALL 平铺展示 15 套主题，无子分组。

#### Scenario: 基础入口按 3 子合集分组
- **WHEN** 用户打开"基础"主题弹层
- **THEN** SHALL 出现子合集过滤标签（全部 / 杂志编辑部 / 经典复刻 / 新锐系列），选择后 SHALL 只显示对应组主题
- **AND** 每个标签 SHALL 附带主题计数

### Requirement: 高级排版视觉等级（L1–L6）
高级排版的 15 套主题 SHALL 支持 6 档视觉等级：L1 黑白极简 / L2 静态简约 / L3 静态装饰标题栏 / L4 静态主题场景 / L5 标题场景动效 / L6 完整主题动效；选择高级排版主题后 SHALL 显示"视觉"入口，列出全部等级与说明（共 76 种组合）；切换等级 SHALL 立即重渲染预览。

#### Scenario: 切换视觉等级
- **WHEN** 用户在"视觉"弹层中选择 L1 黑白极简
- **THEN** 预览 SHALL 立即变为黑白排版；导出文件名 SHALL 携带 L 等级标识

### Requirement: 高级排版配色（Colorways）
L2 及以上等级 SHALL 显示"配色"入口，每套高级主题 SHALL 提供主题原配色 + 4 套定制配色（如墨红社论：黛蓝 / 松烟 / 紫棠 / 鎏金），以多色圆点预览；L1 黑白极简 SHALL 不参与配色；切换配色 SHALL 立即重渲染。

#### Scenario: 切换定制配色
- **WHEN** 用户在"配色"弹层中选择"黛蓝"
- **THEN** 预览 SHALL 立即应用黛蓝配色；导出文件名 SHALL 附加配色名

### Requirement: 动态 SVG 与静态回退
L5 / L6 等级 SHALL 支持动态 SVG 组件与"静态回退"切换（按钮实时切换、产物随之变化）；静态产物 SHALL 与动态产物几何一致（pair policy），保证公众号内静态显示不破版。渲染所需 SVG 资产 SHALL 按清单（motion/manifest.json）按需加载并缓存；清单 SHALL 在选中高级排版主题后空闲时预取。

#### Scenario: 切换静态回退
- **WHEN** 用户在动态等级下点击"静态回退"
- **THEN** 预览 SHALL 重渲染为静态 SVG 版本；再次点击 SHALL 恢复动态