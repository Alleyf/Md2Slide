import React, { useEffect, useRef } from 'react';
import { useAutoAnimate } from '../hooks/useAutoAnimate';
import { AutoAnimateConfig } from '../types/autoAnimate';

interface AutoAnimateWrapperProps {
  children: React.ReactNode;
  config?: AutoAnimateConfig;
  slideIndex?: number;
  isActive?: boolean;
}

export const AutoAnimateWrapper: React.FC<AutoAnimateWrapperProps> = ({
  children,
  config = { enabled: true, duration: 600, easing: 'ease-in-out' },
  slideIndex = 0,
  isActive = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    captureSlideData, 
    matchElements, 
    applyAnimations, 
    updatePreviousSlide 
  } = useAutoAnimate(config);

  useEffect(() => {
    if (!containerRef.current || !isActive) return;

    // Capture data for the current slide
    const currentSlideData = captureSlideData(containerRef.current);

    // Match with previous slide
    const result = matchElements(currentSlideData);

    // Apply animations if there are matches
    if (result.matchedElements.length > 0 || 
        result.newElements.length > 0 || 
        result.removedElements.length > 0) {
      applyAnimations(result);
    }

    // Update previous slide data for next comparison
    updatePreviousSlide(currentSlideData);
  }, [slideIndex, isActive]);

  return (
    <div 
      ref={containerRef} 
      data-auto-animate-container={config.enabled}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  );
};