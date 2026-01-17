export type TransitionType = 'none' | 'fade' | 'slide' | 'zoom' | 'flip';

export type TransitionDirection = 'in' | 'out';

export interface SlideTransition {
  type: TransitionType;
  duration?: number;
  easing?: string;
  direction?: TransitionDirection;
}

export const defaultTransition: SlideTransition = {
  type: 'fade',
  duration: 500,
  easing: 'ease-in-out',
  direction: 'in',
};

export const transitionPresets: Record<TransitionType, SlideTransition> = {
  none: {
    type: 'none',
    duration: 0,
    easing: 'ease',
  },
  fade: {
    type: 'fade',
    duration: 500,
    easing: 'ease-in-out',
  },
  slide: {
    type: 'slide',
    duration: 400,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  zoom: {
    type: 'zoom',
    duration: 600,
    easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  },
  flip: {
    type: 'flip',
    duration: 700,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

export const getTransitionStyles = (
  transition: SlideTransition,
  isActive: boolean,
  direction: TransitionDirection = 'in'
): React.CSSProperties => {
  const { type, duration, easing } = transition;

  if (type === 'none') {
    return {
      transition: 'none',
    opacity: isActive ? 1 : 0,
    transform: isActive ? 'translateY(0)' : 'translateY(10px)',
    pointerEvents: isActive ? 'all' : 'none',
    position: 'absolute' as any,
    top: 0,
    left: 0,
    width: '100%',
      height: '100%',
    };
  }

  if (type === 'fade') {
    return {
      transition: `opacity ${duration}ms ${easing}`,
      opacity: isActive ? 1 : 0,
      transform: isActive ? 'translateY(0)' : 'translateY(10px)',
      pointerEvents: isActive ? 'all' : 'none',
      position: 'absolute' as any,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    };
  }

  if (type === 'slide') {
    const xOffset = direction === 'in' ? (isActive ? 0 : '-100%') : isActive ? '0' : '100%';
    return {
      transition: `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`,
      opacity: isActive ? 1 : 0,
      transform: `translateX(${xOffset})`,
      pointerEvents: isActive ? 'all' : 'none',
      position: 'absolute' as any,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    };
  }

  if (type === 'zoom') {
    const scale = isActive ? 1 : 0.8;
    const opacity = isActive ? 1 : 0;
    return {
      transition: `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`,
      opacity,
      transform: `scale(${scale})`,
      pointerEvents: isActive ? 'all' : 'none',
      position: 'absolute' as any,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    };
  }

  if (type === 'flip') {
    const rotateX = isActive ? 0 : direction === 'in' ? '-180deg' : '180deg';
    const opacity = isActive ? 1 : 0;
    return {
      transition: `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`,
      opacity,
      transform: `perspective(1000px) rotateY(${rotateX})`,
      pointerEvents: isActive ? 'all' : 'none',
      position: 'absolute' as any,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden' as any,
    };
  }

  return {
    transition: `opacity ${duration}ms ${easing}`,
    opacity: isActive ? 1 : 0,
    transform: isActive ? 'translateY(0)' : 'translateY(10px)',
    pointerEvents: isActive ? 'all' : 'none',
    position: 'absolute' as any,
    top: 0,
      left: 0,
      width: '100%',
      height: '100%',
  };
};
