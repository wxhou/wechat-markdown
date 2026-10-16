/* 编辑器快捷键的纯变换层：把当前选区文本映射为「替换后的文本段 + 插入后的选区位置」。
 * DOM 侧约定（CodeEditor 接线）：整段经单次 CM transaction 落入文档，
 * 落在原生撤销栈上；selStart/selEnd 是相对插入段的偏移。 */

export interface SelectionTransform {
  segment: string;
  selStart: number;
  selEnd: number;
}

export function markerWrap(selected: string, marker: string): SelectionTransform {
  if (selected) {
    return { segment: `${marker}${selected}${marker}`, selStart: marker.length, selEnd: marker.length + selected.length };
  }
  return { segment: `${marker}${marker}`, selStart: marker.length, selEnd: marker.length };
}

export function linkWrap(selected: string): SelectionTransform {
  if (selected) {
    const segment = `[${selected}](https://)`;
    return {
      segment,
      /* 选区落在 https:// 上，输入即替换 URL */
      selStart: selected.length + 3,
      selEnd: segment.length - 1,
    };
  }
  return { segment: '[文本](https://)', selStart: 1, selEnd: 3 };
}

/* Tab 缩进作用于选区覆盖的完整行组；空行不缩进 */
export function indentLines(lines: string): string {
  return lines
    .split('\n')
    .map((line) => (line.length ? `  ${line}` : line))
    .join('\n');
}

export function outdentLines(lines: string): string {
  return lines
    .split('\n')
    .map((line) => (line.startsWith('  ') ? line.slice(2) : line.startsWith(' ') ? line.slice(1) : line))
    .join('\n');
}