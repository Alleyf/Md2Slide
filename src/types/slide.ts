import React from 'react';

export interface SlideContent {
  id: string;
  title?: string;
  subtitle?: string;
  elements: SlideElement[];
  notes?: string;
  layout?: string;
}

export interface SlideElement {
  id: string;
  type: 'title' | 'subtitle' | 'text' | 'bullets' | 'vector' | 'grid' | 'code' | 'quote' | 'image' | 'video' | 'icon' | 'html' | 'math' | 'markdown' | 'table' | 'audio';
  content: string | string[] | any;
  clickState: number;
  animation?: 'fade' | 'scale' | 'grow' | 'transform' | 'highlight' | 'slide-left' | 'slide-right' | 'slide-up' | 'pop';
  style?: React.CSSProperties;
  children?: SlideElement[];
  listStart?: number;
  listType?: 'ul' | 'ol';
  language?: string;
  autoAnimate?: boolean;
  autoAnimateId?: string;
  autoAnimateType?: 'move' | 'scale' | 'fade' | 'opacity' | 'transform' | 'all';
  autoAnimateDuration?: number;
  autoAnimateEasing?: string;
}
