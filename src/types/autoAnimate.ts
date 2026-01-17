/**
 * Auto-Animation types and interfaces
 */

export interface AutoAnimateConfig {
  enabled: boolean;
  duration?: number;
  easing?: string;
  type?: 'move' | 'scale' | 'fade' | 'opacity' | 'transform' | 'all';
}

export interface ElementMatch {
  from: HTMLElement;
  to: HTMLElement;
  similarity: number;
  animationType: 'move' | 'scale' | 'fade' | 'transform';
}

export interface AnimationData {
  id?: string;
  textContent: string;
  tagName: string;
  className: string;
  rect: DOMRect;
  computedStyle: CSSStyleDeclaration;
  dataset: DOMStringMap;
}

export interface AutoAnimationResult {
  matchedElements: ElementMatch[];
  newElements: HTMLElement[];
  removedElements: HTMLElement[];
}