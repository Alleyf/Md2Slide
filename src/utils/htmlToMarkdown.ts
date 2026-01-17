export const htmlToMarkdown = (html: string): string => {
  if (!html || typeof window === 'undefined') {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 检查解析是否成功
  if (doc.querySelector('parsererror')) {
    console.warn('HTML解析错误，返回原始内容');
    return html;
  }

  const serializeChildren = (node: Node, depth: number = 0): string => {
    const parts: string[] = [];
    for (const child of Array.from(node.childNodes)) {
      const serialized = serializeNode(child, depth);
      if (serialized !== '') {
        parts.push(serialized);
      }
    }
    return parts.join('');
  };

  const escapeMarkdownChars = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\') // 反斜杠
      .replace(/\*/g, '\\*') // 星号
      .replace(/_/g, '\\_') // 下划线
      .replace(/\[/g, '\\[') // 方括号
      .replace(/]/g, '\\]') // 方括号
      .replace(/#/g, '\\#') // 井号
      .replace(/\+/g, '\\+') // 加号
      .replace(/-/g, '\\-') // 减号
      .replace(/\./g, '\\.') // 点号
      .replace(/!/g, '\\!') // 感叹号
      .replace(/`/g, '\\`'); // 反引号
  };

  const serializeNode = (node: Node, depth: number = 0): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      // 只保留有意义的文本内容，去除多余的空白
      const text = node.textContent || '';
      return text.replace(/\s+/g, ' ').trim();
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    // 处理换行符
    if (tag === 'br') {
      return '  \n';
    }

    if (tag === 'hr') {
      return '\n---\n\n';
    }

    // 处理标题
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      const level = parseInt(tag.substring(1), 10);
      const content = serializeChildren(element, depth + 1);
      return `${'#'.repeat(level)} ${content}\n\n`;
    }

    // 处理段落
    if (tag === 'p') {
      const content = serializeChildren(element, depth + 1).trim();
      return content ? `${content}\n\n` : '';
    }

    // 处理粗体和斜体
    if (['strong', 'b', 'bold'].includes(tag)) {
      const content = serializeChildren(element, depth + 1).trim();
      return content ? `**${content}**` : '';
    }

    if (['em', 'i', 'italic'].includes(tag)) {
      const content = serializeChildren(element, depth + 1).trim();
      return content ? `*${content}*` : '';
    }

    if (tag === 'u') {
      const content = serializeChildren(element, depth + 1).trim();
      return content ? `_${content}_` : '';
    }

    if (tag === 's' || tag === 'strike' || tag === 'del') {
      const content = serializeChildren(element, depth + 1).trim();
      return content ? `~~${content}~~` : '';
    }

    // 处理代码相关标签
    if (tag === 'code') {
      // 检查是否是pre标签内的code，这种情况下处理为代码块
      if (element.parentElement && element.parentElement.tagName.toLowerCase() === 'pre') {
        return element.textContent || '';
      }
      // 内联代码
      const content = element.textContent || '';
      return content ? `\`${escapeMarkdownChars(content)}\`` : '';
    }

    if (tag === 'pre') {
      const codeElement = element.querySelector('code');
      let codeText = '';
      let language = '';
      
      if (codeElement) {
        codeText = codeElement.textContent || '';
        // 获取语言类型
        const className = codeElement.className || element.className;
        const languageMatch = className.match(/language-(\w+)/) || className.match(/lang-(\w+)/);
        if (languageMatch && languageMatch[1]) {
          language = languageMatch[1];
        }
      } else {
        // 如果没有code标签，直接使用pre的内容
        codeText = element.textContent || '';
      }
      
      const trimmedCode = codeText.replace(/^\n+|\n+$/g, '');
      return `\`\`\`${language}
${trimmedCode}
\`\`\`

`;
    }

    // 处理链接
    if (tag === 'a') {
      const href = element.getAttribute('href') || '';
      const content = serializeChildren(element, depth + 1).trim();
      const text = content || href;
      if (!href) return text;
      return `[${text}](${href})`;
    }

    // 处理图片
    if (tag === 'img') {
      const src = element.getAttribute('src') || '';
      const alt = element.getAttribute('alt') || '';
      const title = element.getAttribute('title') || '';
      if (!src) return '';
      const titlePart = title ? ` "${title}"` : '';
      return `![${alt}](${src}${titlePart})`;
    }

    // 处理列表
    if (tag === 'ul' || tag === 'ol') {
      const isOrdered = tag === 'ol';
      const items = Array.from(element.children).filter(child => child.tagName.toLowerCase() === 'li');
      
      if (items.length === 0) return '';
      
      const listItems: string[] = [];
      items.forEach((li, index) => {
        const liElement = li as HTMLElement;
        const content = serializeChildren(liElement, depth + 1).trim();
        if (content) {
          const prefix = isOrdered ? `${index + 1}. ` : '- ';
          // 对于嵌套列表，增加缩进
          const indentedContent = content.split('\n').join('\n  '); // 每行前添加两个空格
          listItems.push(`${prefix}${indentedContent}`);
        }
      });
      
      return listItems.length > 0 ? `${listItems.join('\n')}\n\n` : '';
    }

    // 处理列表项
    if (tag === 'li') {
      // 列表项的处理已经在ul/ol中完成，这里只返回内容
      return serializeChildren(element, depth + 1);
    }

    // 处理引用
    if (tag === 'blockquote') {
      const content = serializeChildren(element, depth + 1).trim();
      if (!content) return '';
      
      // 将每行前面加上'> '
      const quoted = content
        .split('\n')
        .map(line => line.trim() ? `> ${line}` : '>')
        .join('\n');
        
      return `${quoted}\n\n`;
    }

    // 处理表格
    if (tag === 'table') {
      const rows = Array.from(element.querySelectorAll('tr'));
      if (rows.length === 0) return '';
      
      const tableRows: string[] = [];
      let headerProcessed = false;
      
      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('th, td'));
        if (cells.length === 0) continue;
        
        const cellContents = cells.map(cell => {
          const content = serializeChildren(cell, depth + 1).trim().replace(/\|/g, '\\|');
          return content || ' ';
        });
        
        tableRows.push(`| ${cellContents.join(' | ')} |`);
        
        // 如果还没有添加表头分隔行，且当前行包含th标签，则添加分隔行
        if (!headerProcessed && row.querySelector('th')) {
          const separatorCells = Array(cells.length).fill(' --- ');
          tableRows.push(`| ${separatorCells.join(' | ')} |`);
          headerProcessed = true;
        }
      }
      
      return tableRows.length > 0 ? `${tableRows.join('\n')}\n\n` : '';
    }

    // 处理div和span等容器标签
    if (['div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav'].includes(tag)) {
      return serializeChildren(element, depth + 1);
    }

    // 处理行内元素
    if (['small', 'sub', 'sup', 'mark', 'kbd', 'samp'].includes(tag)) {
      const content = serializeChildren(element, depth + 1).trim();
      return content;
    }

    // 默认情况：递归处理子节点
    return serializeChildren(element, depth + 1);
  };

  const body = doc.body;
  if (!body) {
    // 如果没有body，尝试直接处理整个文档
    return serializeChildren(doc.documentElement || doc, 0)
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  
  const result = serializeChildren(body, 0)
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return result;
};