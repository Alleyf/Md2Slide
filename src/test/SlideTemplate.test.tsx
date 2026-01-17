import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { SlideTemplate, SlideContent } from '../components/SlideTemplate';
import { ThemeProvider } from '../context/ThemeContext';

beforeEach(() => {
  cleanup();
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
    render(
      <ThemeProvider>
        <SlideTemplate slides={mockSlides} />
      </ThemeProvider>
    );
    expect(screen.queryByText('测试标题')).toBeInTheDocument();
  });
});
