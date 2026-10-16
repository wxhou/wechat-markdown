/* 导出文件名共用的标题提取：首个一级标题 → 净化非法字符 → 截断 30 字符 → 兜底「文章」。
 * exportName（成品导出）与 exportMarkdown（源稿导出）共用，防两份正则漂移。 */
export function exportBaseTitle(markdown: string): string {
  const title = (markdown.match(/^#[ \t]*(.+)$/m) || [])[1] ?? '';
  return title.trim().replace(/[\\/:*?"<>| ]/g, '_').slice(0, 30) || '文章';
}