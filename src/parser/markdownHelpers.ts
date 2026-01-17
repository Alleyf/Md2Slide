/**
 * 格式化行内 Markdown
 * 处理公式、加粗、斜体、删除线、代码、链接和任务列表
 */
export const formatInlineMarkdown = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\$([^\$]+)\$/g, '<span class="math-inline">$1</span>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #58c4dd; text-decoration: underline;">$1</a>')
    .replace(/^\[ \]\s+/, '<input type="checkbox" disabled style="margin-right: 8px; vertical-align: middle;" />')
    .replace(/^\[x\]\s+/, '<input type="checkbox" checked disabled style="margin-right: 8px; vertical-align: middle;" />');
};
