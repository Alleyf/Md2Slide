import { useState, useEffect, useRef } from 'react';
import { AutoAnimateConfig, AnimationData, ElementMatch, AutoAnimationResult } from '../types/autoAnimate';

/**
 * Auto-animation hook for matching elements between slide transitions
 */
export const useAutoAnimate = (config: AutoAnimateConfig = { enabled: false }) => {
  const [isEnabled, setIsEnabled] = useState(config.enabled);
  const prevSlideRef = useRef<AnimationData[]>([]);
  
  /**
   * Capture animation data for elements in a slide
   */
  const captureSlideData = (slideContainer: HTMLElement | null): AnimationData[] => {
    if (!slideContainer) return [];
    
    const elements = slideContainer.querySelectorAll('[data-auto-animate], [data-id]');
    return Array.from(elements).map(element => {
      const el = element as HTMLElement;
      const rect = el.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(el);
      
      return {
        id: el.dataset.id || el.id,
        textContent: el.textContent || '',
        tagName: el.tagName,
        className: el.className,
        rect,
        computedStyle,
        dataset: el.dataset,
      };
    });
  };

  /**
   * Calculate similarity score between two elements
   */
  const calculateSimilarity = (from: AnimationData, to: AnimationData): number => {
    let score = 0;
    const maxScore = 4; // Maximum possible score
    
    // Match by explicit ID first (highest priority)
    if (from.id && to.id && from.id === to.id) {
      return 1.0; // Perfect match
    }
    
    // Tag name similarity
    if (from.tagName === to.tagName) {
      score += 0.8;
    }
    
    // Class name similarity (partial match)
    const fromClasses = from.className.split(' ');
    const toClasses = to.className.split(' ');
    const commonClasses = fromClasses.filter(cls => toClasses.includes(cls)).length;
    if (commonClasses > 0) {
      score += 0.5 * (commonClasses / Math.max(fromClasses.length, toClasses.length));
    }
    
    // Text content similarity (if both have text)
    if (from.textContent && to.textContent) {
      const minLength = Math.min(from.textContent.length, to.textContent.length);
      if (minLength > 0) {
        const commonPrefixLength = getCommonPrefixLength(
          from.textContent.trim().toLowerCase(),
          to.textContent.trim().toLowerCase()
        );
        score += 0.7 * (commonPrefixLength / minLength);
      }
    }
    
    // Dataset similarity (for auto-animate attributes)
    if (from.dataset.autoAnimate || to.dataset.autoAnimate) {
      score += 0.6;
    }
    
    return Math.min(score / maxScore, 1.0);
  };

  /**
   * Helper function to calculate common prefix length
   */
  const getCommonPrefixLength = (str1: string, str2: string): number => {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return i;
  };

  /**
   * Match elements between previous and current slide
   */
  const matchElements = (currentSlideData: AnimationData[]): AutoAnimationResult => {
    const prevSlideData = prevSlideRef.current;
    
    if (!isEnabled || prevSlideData.length === 0) {
      return {
        matchedElements: [],
        newElements: [],
        removedElements: []
      };
    }
    
    const matchedElements: ElementMatch[] = [];
    const processedToIndices = new Set<number>();
    const processedFromIndices = new Set<number>();
    
    // Find best matches between previous and current elements
    for (let i = 0; i < prevSlideData.length; i++) {
      const fromEl = prevSlideData[i];
      let bestMatch: { index: number; similarity: number } | null = null;
      
      for (let j = 0; j < currentSlideData.length; j++) {
        if (processedToIndices.has(j)) continue; // Skip already matched elements
        
        const toEl = currentSlideData[j];
        const similarity = calculateSimilarity(fromEl, toEl);
        
        if (similarity > 0.5 && (!bestMatch || similarity > bestMatch.similarity)) {
          bestMatch = { index: j, similarity };
        }
      }
      
      if (bestMatch) {
        // Determine animation type based on changes
        let animationType: 'move' | 'scale' | 'fade' | 'transform' = 'move';
        
        const fromRect = fromEl.rect;
        const toRect = currentSlideData[bestMatch.index].rect;
        
        // Check if it's primarily a positional change
        const posDiff = Math.sqrt(
          Math.pow(toRect.left - fromRect.left, 2) + 
          Math.pow(toRect.top - fromRect.top, 2)
        );
        
        // Check if it's primarily a size change
        const sizeDiff = Math.abs(
          (toRect.width * toRect.height) - (fromRect.width * fromRect.height)
        ) / (fromRect.width * fromRect.height);
        
        if (sizeDiff > 0.2) {
          animationType = 'scale';
        } else if (posDiff > 50) {
          animationType = 'move';
        } else {
          animationType = 'transform'; // Could be opacity, color, etc.
        }
        
        matchedElements.push({
          from: document.querySelector(`[data-id="${fromEl.id}"]`) as HTMLElement || 
                findElementByContent(fromEl.textContent, fromEl.tagName) || 
                document.createElement('div'),
          to: document.querySelector(`[data-id="${currentSlideData[bestMatch.index].id}"]`) as HTMLElement || 
              findElementByContent(currentSlideData[bestMatch.index].textContent, currentSlideData[bestMatch.index].tagName) || 
              document.createElement('div'),
          similarity: bestMatch.similarity,
          animationType
        });
        
        processedToIndices.add(bestMatch.index);
        processedFromIndices.add(i);
      }
    }
    
    // Identify new elements (in current but not in previous)
    const newElements = currentSlideData
      .filter((_, index) => !processedToIndices.has(index))
      .map(data => 
        document.querySelector(`[data-id="${data.id}"]`) as HTMLElement || 
        findElementByContent(data.textContent, data.tagName) || 
        document.createElement('div')
      );
    
    // Identify removed elements (in previous but not in current)
    const removedElements = prevSlideData
      .filter((_, index) => !processedFromIndices.has(index))
      .map(data => 
        document.querySelector(`[data-id="${data.id}"]`) as HTMLElement || 
        findElementByContent(data.textContent, data.tagName) || 
        document.createElement('div')
      );
    
    return {
      matchedElements,
      newElements,
      removedElements
    };
  };

  /**
   * Helper function to find element by content and tag name
   */
  const findElementByContent = (textContent: string, tagName: string): HTMLElement | null => {
    const elements = document.getElementsByTagName(tagName);
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as HTMLElement;
      if (el.textContent?.includes(textContent.substring(0, 20))) { // Match first 20 chars
        return el;
      }
    }
    return null;
  };

  /**
   * Apply animations to matched elements
   */
  const applyAnimations = (result: AutoAnimationResult) => {
    if (!isEnabled) return;

    const duration = config.duration || 500;
    const easing = config.easing || 'ease-in-out';

    // Animate matched elements
    result.matchedElements.forEach(match => {
      const { from, to, animationType } = match;
      
      // Get positions
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();
      
      // Calculate transformations
      const deltaX = toRect.left - fromRect.left;
      const deltaY = toRect.top - fromRect.top;
      const scaleX = toRect.width / fromRect.width;
      const scaleY = toRect.height / fromRect.height;
      
      // Apply animation based on type
      if (animationType === 'move') {
        // Move animation
        from.style.transition = `transform ${duration}ms ${easing}`;
        from.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      } else if (animationType === 'scale') {
        // Scale animation
        from.style.transition = `transform ${duration}ms ${easing}`;
        from.style.transform = `scale(${scaleX}, ${scaleY})`;
      } else if (animationType === 'transform') {
        // Combined transform
        from.style.transition = `transform ${duration}ms ${easing}`;
        from.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
      } else {
        // Fade animation
        from.style.transition = `opacity ${duration}ms ${easing}`;
        from.style.opacity = '0';
      }
      
      // Reset after animation completes
      setTimeout(() => {
        from.style.transition = '';
        from.style.transform = '';
        from.style.opacity = '';
      }, duration);
    });

    // Handle new elements (fade in)
    result.newElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transition = `opacity ${duration}ms ${easing}`;
      setTimeout(() => {
        el.style.opacity = '1';
      }, 10); // Small delay to ensure transition works
    });

    // Handle removed elements (fade out)
    result.removedElements.forEach(el => {
      el.style.transition = `opacity ${duration}ms ${easing}`;
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.display = 'none';
      }, duration);
    });
  };

  /**
   * Update previous slide data
   */
  const updatePreviousSlide = (slideData: AnimationData[]) => {
    prevSlideRef.current = slideData;
  };

  return {
    isEnabled,
    setIsEnabled,
    captureSlideData,
    matchElements,
    applyAnimations,
    updatePreviousSlide,
    calculateSimilarity
  };
};