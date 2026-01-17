import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { SlideTemplate, SlideContent } from '../components/SlideTemplate';

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
    expect(screen.getByText('测试标题')).toBeInTheDocument();
  });

  it('displays slides', () => {
    render(<SlideTemplate slides={mockSlides} />);
    expect(screen.getByText('测试标题')).toBeInTheDocument();
  });
});

describe('Markdown Parser', () => {
  it('parse inline markdown correctly', () => {
    const { formatInlineMarkdown } = await import('../parser');
    
    const result = formatInlineMarkdown('**粗体**文本');
    expect(result).toBe('<strong>粗体</strong>文本');
    
    const result2 = formatInlineMarkdown('___下划线___文本');
    expect(result2).toBe('<strong>下划线</strong>文本');
  });
});
