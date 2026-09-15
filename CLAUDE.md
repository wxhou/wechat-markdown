# wechat-markdown

<!-- OPENSPEC-PW:START -->

## CodeGraph 优先 🔴

结构性任务（定义/调用链/影响面/流程）第一步用 `codegraph_explore`，直接用结果回答；grep/read 仅作补充（字面文本、已打开文件、结果不足）。不派子 agent 重建索引。无 `.codegraph/` 跳过。

**工作流**：优先使用 OpenSpec 工作流（/opsx 命令），而非 plan mode。

@AGENTS.md

<!-- OPENSPEC-PW:END -->
