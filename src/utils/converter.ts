import { marked } from 'marked';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import DOMPurify from 'dompurify';

// Configure marked options
marked.setOptions({
  breaks: true, // Enable line breaks
  gfm: true,    // Enable GitHub Flavored Markdown
});

/**
 * Convert Markdown to HTML
 * Uses 'marked' for parsing and 'dompurify' for sanitization
 */
export const markdownToHtml = async (markdown: string): Promise<string> => {
  if (!markdown) return '';
  
  try {
    // marked.parse can be async
    const rawHtml = await marked.parse(markdown);
    // Sanitize the HTML to prevent XSS
    return DOMPurify.sanitize(rawHtml);
  } catch (error) {
    console.error('Markdown to HTML conversion failed:', error);
    return markdown; // Return original text on failure
  }
};

/**
 * Convert HTML to Markdown
 * Uses 'turndown' with GFM plugin
 */
export const htmlToMarkdown = (html: string): string => {
  if (!html) return '';

  try {
    const turndownService = new TurndownService({
      headingStyle: 'atx', // Use # for headings
      codeBlockStyle: 'fenced', // Use ``` for code blocks
      bulletListMarker: '-', // Use - for bullet lists
      emDelimiter: '*', // Use * for emphasis
    });

    // Use GFM plugin for tables, strikethrough, etc.
    turndownService.use(gfm);

    // Add custom rules if needed
    // Example: Preserve specific classes or attributes if necessary
    // But for now, standard GFM is good.

    return turndownService.turndown(html);
  } catch (error) {
    console.error('HTML to Markdown conversion failed:', error);
    return html; // Return original text on failure
  }
};
