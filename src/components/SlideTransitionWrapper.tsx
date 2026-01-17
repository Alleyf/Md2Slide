import React from 'react';
import { getTransitionStyles, SlideTransition, TransitionDirection } from '../types/transition';

interface SlideTransitionWrapperProps {
  children: React.ReactNode;
  transition: SlideTransition;
  isActive: boolean;
  direction?: TransitionDirection;
}

export const SlideTransitionWrapper: React.FC<SlideTransitionWrapperProps> = ({
  children,
  transition,
  isActive,
  direction = 'in',
}) => {
  const styles = getTransitionStyles(transition, isActive, direction);

  return <div style={styles}>{children}</div>;
};
