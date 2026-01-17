/**
 * Accessibility utilities for Md2Slide
 */

let announcementTimeout: NodeJS.Timeout | null = null;

/**
 * Announces a message to screen readers using an ARIA live region.
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  let liveRegion = document.getElementById('md2slide-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'md2slide-live-region';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.padding = '0';
    liveRegion.style.margin = '-1px';
    liveRegion.style.overflow = 'hidden';
    liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    liveRegion.style.whiteSpace = 'nowrap';
    liveRegion.style.border = '0';
    document.body.appendChild(liveRegion);
  } else {
    liveRegion.setAttribute('aria-live', priority);
  }

  // Clear previous timeout
  if (announcementTimeout) {
    clearTimeout(announcementTimeout);
  }

  // Set the message
  liveRegion.textContent = '';
  announcementTimeout = setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }, 100);
};

/**
 * Focuses an element and ensures it's visible.
 */
export const focusElement = (element: HTMLElement) => {
  if (!element) return;
  element.setAttribute('tabindex', '-1');
  element.focus();
  element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};
