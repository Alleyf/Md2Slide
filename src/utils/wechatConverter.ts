import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * WeChat Official Account formatting styles
 */
const STYLES = {
  container: `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 16px;
    color: #333;
    line-height: 1.75;
    text-align: justify;
    word-break: break-word;
  `,
  h1: `
    font-size: 22px;
    font-weight: bold;
    text-align: center;
    margin: 20px 0;
    color: #333;
    line-height: 1.4;
  `,
  h2: `
    font-size: 18px;
    font-weight: bold;
    border-left: 4px solid #42b983;
    padding-left: 10px;
    margin: 30px 0 15px;
    color: #333;
    line-height: 1.4;
  `,
  h3: `
    font-size: 16px;
    font-weight: bold;
    margin: 20px 0 10px;
    padding-left: 10px;
    border-left: 4px solid #42b983;
    color: #333;
    line-height: 1.4;
  `,
  p: `
    margin: 0 0 16px;
    line-height: 1.75;
    color: #333;
    font-size: 16px;
  `,
  ul: `
    margin: 0 0 16px;
    padding-left: 20px;
  `,
  ol: `
    margin: 0 0 16px;
    padding-left: 20px;
  `,
  li: `
    margin-bottom: 8px;
    line-height: 1.6;
    color: #333;
    font-size: 16px;
  `,
  blockquote: `
    border-left: 4px solid #dfe2e5;
    color: #6a737d;
    padding: 10px 15px;
    background-color: #f8f8f8;
    margin: 20px 0;
    border-radius: 4px;
    font-size: 15px;
    line-height: 1.6;
  `,
  code_inline: `
    font-family: Consolas, Monaco, monospace;
    padding: 2px 4px;
    background-color: #fff5f5;
    color: #ff502c;
    border-radius: 4px;
    font-size: 14px;
  `,
  img: `
    display: block;
    max-width: 100% !important;
    height: auto !important;
    margin: 20px auto;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  `,
  a: `
    color: #576b95;
    text-decoration: none;
    border-bottom: 1px dashed #576b95;
  `,
  hr: `
    border: none;
    border-top: 1px solid #ddd;
    margin: 30px 0;
  `,
  table: `
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 20px;
    font-size: 14px;
    border: 1px solid #dfe2e5;
  `,
  th: `
    border: 1px solid #dfe2e5;
    padding: 8px 12px;
    background-color: #f2f2f2;
    font-weight: bold;
    text-align: left;
  `,
  td: `
    border: 1px solid #dfe2e5;
    padding: 8px 12px;
  `
};

/**
 * Mac window style for code blocks
 */
const CODE_BLOCK_WRAPPER_STYLE = `
  background: #282c34;
  border-radius: 8px;
  margin: 15px 0;
  font-size: 14px;
  color: #abb2bf;
  line-height: 1.5;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const CODE_BLOCK_HEADER_STYLE = `
  padding: 10px 15px;
  border-bottom: 1px solid #3e4451;
  display: flex;
  align-items: center;
  background: #21252b;
`;

const CODE_BLOCK_CONTENT_STYLE = `
  padding: 15px;
  overflow-x: auto;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  white-space: pre;
  color: #abb2bf;
  background: #282c34;
  border: none;
  margin: 0;
`;

const MAC_DOT_RED = `width: 12px; height: 12px; border-radius: 50%; background: #fc625d; margin-right: 8px;`;
const MAC_DOT_YELLOW = `width: 12px; height: 12px; border-radius: 50%; background: #fdbc40; margin-right: 8px;`;
const MAC_DOT_GREEN = `width: 12px; height: 12px; border-radius: 50%; background: #35cd4b;`;

/**
 * Convert Markdown to WeChat-friendly HTML with inline styles
 */
export const markdownToWeChatHtml = async (markdown: string): Promise<string> => {
  if (!markdown) return '';

  try {
    // 1. Convert Markdown to base HTML using marked
    const rawHtml = await marked.parse(markdown);
    
    // 2. Parse HTML string to DOM for manipulation
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    
    // 3. Apply styles to elements
    
    // Headings
    doc.querySelectorAll('h1').forEach(el => el.setAttribute('style', STYLES.h1));
    doc.querySelectorAll('h2').forEach(el => el.setAttribute('style', STYLES.h2));
    doc.querySelectorAll('h3').forEach(el => el.setAttribute('style', STYLES.h3));
    doc.querySelectorAll('h4, h5, h6').forEach(el => el.setAttribute('style', STYLES.h3)); // Map lower headings to h3 style
    
    // Paragraphs
    doc.querySelectorAll('p').forEach(el => el.setAttribute('style', STYLES.p));
    
    // Lists
    doc.querySelectorAll('ul').forEach(el => el.setAttribute('style', STYLES.ul));
    doc.querySelectorAll('ol').forEach(el => el.setAttribute('style', STYLES.ol));
    doc.querySelectorAll('li').forEach(el => el.setAttribute('style', STYLES.li));
    
    // Blockquotes
    doc.querySelectorAll('blockquote').forEach(el => {
      el.setAttribute('style', STYLES.blockquote);
      // Remove margin from p inside blockquote to avoid double spacing
      el.querySelectorAll('p').forEach(p => {
        p.style.margin = '0';
      });
    });
    
    // Inline Code
    doc.querySelectorAll('code').forEach(el => {
      // Skip if it's inside a pre (block code)
      if (el.parentElement?.tagName !== 'PRE') {
        el.setAttribute('style', STYLES.code_inline);
      }
    });
    
    // Images
    doc.querySelectorAll('img').forEach(el => el.setAttribute('style', STYLES.img));
    
    // Links
    doc.querySelectorAll('a').forEach(el => el.setAttribute('style', STYLES.a));
    
    // Horizontal Rules
    doc.querySelectorAll('hr').forEach(el => el.setAttribute('style', STYLES.hr));
    
    // Tables
    doc.querySelectorAll('table').forEach(el => el.setAttribute('style', STYLES.table));
    doc.querySelectorAll('th').forEach(el => el.setAttribute('style', STYLES.th));
    doc.querySelectorAll('td').forEach(el => el.setAttribute('style', STYLES.td));
    
    // Code Blocks (PRE) - Transform to Mac Window Style
    const preElements = Array.from(doc.querySelectorAll('pre'));
    preElements.forEach(pre => {
      const code = pre.querySelector('code');
      const content = code ? code.innerHTML : pre.innerHTML;
      
      const wrapper = doc.createElement('section');
      wrapper.setAttribute('style', CODE_BLOCK_WRAPPER_STYLE);
      
      const header = doc.createElement('div');
      header.setAttribute('style', CODE_BLOCK_HEADER_STYLE);
      header.innerHTML = `
        <span style="${MAC_DOT_RED}"></span>
        <span style="${MAC_DOT_YELLOW}"></span>
        <span style="${MAC_DOT_GREEN}"></span>
      `;
      
      const codeContainer = doc.createElement('div');
      codeContainer.setAttribute('style', CODE_BLOCK_CONTENT_STYLE);
      codeContainer.innerHTML = content; // Keep syntax highlighting if present (though marked output is usually plain text unless highlighted)
      
      wrapper.appendChild(header);
      wrapper.appendChild(codeContainer);
      
      pre.replaceWith(wrapper);
    });
    
    // 4. Wrap everything in a container
    const bodyContent = doc.body.innerHTML;
    const finalHtml = `
      <div style="${STYLES.container}">
        ${bodyContent}
      </div>
    `;
    
    // 5. Sanitize final output
    return DOMPurify.sanitize(finalHtml, {
      ADD_TAGS: ['section', 'span', 'div'], // Ensure we allow our structural tags
      ADD_ATTR: ['style'] // Allow inline styles
    });
    
  } catch (error) {
    console.error('WeChat conversion failed:', error);
    return markdown;
  }
};
