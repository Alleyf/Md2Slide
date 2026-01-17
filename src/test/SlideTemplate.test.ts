import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/react';
import '@testing-library/dom';

import { SlideTemplate, SlideContent } from '../components/SlideTemplate';

beforeEach(() => {
  cleanup();
});

describe('Markdown Parser', () => {
  it('parse inline markdown correctly', async () => {
    const { formatInlineMarkdown } = await import('../parser');
    
    const result = formatInlineMarkdown('**粗体**文本');
    expect(result).toBe('<strong>粗体</strong>文本');
    
    const result2 = formatInlineMarkdown('___下划线___文本');
    expect(result2).toBe('<strong>下划线</strong>文本');
  });
});

describe('SlideTemplate Component', () => {
  const mockSlides: SlideContent[] = [
    {
      id: 'slide-0',
      elements: [
        {
          id: 'element-0',
          type: 'title',
          content: '测试标题',
          clickState: 0,
        },
      ],
    },
  ];

  it('renders without crashing', () => {
    render(<SlideTemplate slides={mockSlides} />);
    expect(screen.queryByText('测试标题')).toBeInTheDocument();
  });
});
