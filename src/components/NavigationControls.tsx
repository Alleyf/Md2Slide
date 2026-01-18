import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme } from '../styles/theme';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Maximize, Monitor, GripVertical } from 'lucide-react';
import { getStorageItem, setStorageItem, storageKeys } from '../utils/storage';

interface NavigationControlsProps {
  currentSlideIndex: number;
  clickState: number;
  totalClicks: number;
  slidesCount: number;
  onNext: () => void;
  onPrev: () => void;
  onJump?: (index: number) => void;
  onReplay?: () => void;
  isAutoPlaying?: boolean;
  onAutoPlayToggle?: () => void;
  autoPlayInterval: number;
  onAutoPlayIntervalChange: (interval: number) => void;
  onFullscreenToggle?: () => void;
  onPresenterModeToggle?: () => void;
  isVisible?: boolean;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentSlideIndex,
  clickState,
  totalClicks,
  slidesCount,
  onNext,
  onPrev,
  onJump,
  onReplay,
  isAutoPlaying = false,
  onAutoPlayToggle,
  autoPlayInterval,
  onAutoPlayIntervalChange,
  onFullscreenToggle,
  onPresenterModeToggle,
  isVisible = true,
}) => {
  const { themeConfig: theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [isEditing, setIsEditing] = useState(false);
  const [jumpValue, setJumpValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      let x = e.clientX - parentRect.left - dragOffsetRef.current.x;
      let y = e.clientY - parentRect.top - dragOffsetRef.current.y;

      const maxX = parentRect.width - containerRect.width;
      const maxY = parentRect.height - containerRect.height;

      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x > maxX) x = maxX;
      if (y > maxY) y = maxY;

      const newPos = { x, y };
      setPosition(newPos);
      setStorageItem(storageKeys.PREVIEW_NAV_POSITION, newPos);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDragging(true);
    e.preventDefault();
  };

  const handleJumpSubmit = (e: React.FormEvent | React.FocusEvent) => {
    e.preventDefault();
    setIsEditing(false);
    const pageNum = parseInt(jumpValue);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= slidesCount) {
      onJump?.(pageNum - 1);
    }
    setJumpValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpSubmit(e);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setJumpValue('');
    }
  };

  useEffect(() => {
    const saved = getStorageItem<{ x: number; y: number } | null>(
      storageKeys.PREVIEW_NAV_POSITION,
      null
    );
    if (saved && containerRef.current && containerRef.current.parentElement) {
      const parentRect = containerRef.current.parentElement.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const maxX = parentRect.width - containerRect.width;
      const maxY = parentRect.height - containerRect.height;
      const clampedX = Math.min(Math.max(saved.x, 0), maxX);
      const clampedY = Math.min(Math.max(saved.y, 0), maxY);
      setPosition({ x: clampedX, y: clampedY });
    }
  }, []);

  return (
    <div
      className="nav-controls"
      ref={containerRef}
      style={{
        position: 'absolute',
        top: position ? position.y : 'auto',
        left: position ? position.x : 'auto',
        bottom: position ? 'auto' : 25,
        right: position ? 'auto' : 25,
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        zIndex: 100,
        background: theme === darkTheme ? 'rgba(20, 20, 20, 0.6)' : 'rgba(255, 255, 255, 0.8)',
        padding: '8px 16px',
        borderRadius: '12px',
        border: theme === darkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
        backdropFilter: 'blur(15px)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        onMouseDown={handleDragStart}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          padding: '4px 2px',
          marginRight: '4px',
          display: 'flex',
          alignItems: 'center',
          color: theme.colors.textSecondary,
          userSelect: 'none',
        }}
        title="拖动工具栏"
      >
        <GripVertical size={14} />
      </div>
      <button
        onClick={onPrev}
        disabled={currentSlideIndex === 0 && clickState === 0}
        aria-label="上一张幻灯片"
        style={{
          padding: isMobile ? '6px' : '4px',
          background: 'transparent',
          border: 'none',
          color: theme.primaryColor,
          cursor: currentSlideIndex === 0 && clickState === 0 ? 'not-allowed' : 'pointer',
          opacity: currentSlideIndex === 0 && clickState === 0 ? 0.2 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: isMobile ? '44px' : 'auto',
          minHeight: isMobile ? '44px' : 'auto',
        }}
        title="上一张"
      >
        <ChevronLeft size={isMobile ? 24 : 20} strokeWidth={2.5} />
      </button>

      <div style={{ display: 'flex', gap: isMobile ? '8px' : '8px', alignItems: 'center' }}>
        <button
          onClick={onAutoPlayToggle}
          aria-label={isAutoPlaying ? "暂停自动播放" : "开始自动播放"}
          style={{
            padding: isMobile ? '6px' : '4px',
            background: 'transparent',
            border: 'none',
            color: isAutoPlaying ? theme.primaryColor : theme.colors.text,
            cursor: 'pointer',
            opacity: isAutoPlaying ? 1 : 0.6,
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            minWidth: isMobile ? '44px' : 'auto',
            minHeight: isMobile ? '44px' : 'auto',
          }}
          onMouseEnter={(e) => !isMobile && (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => !isMobile && (e.currentTarget.style.opacity = isAutoPlaying ? '1' : '0.6')}
          title={isAutoPlaying ? "暂停自动播放" : "开始自动播放"}
        >
          {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        {isAutoPlaying && !isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={autoPlayInterval}
              onChange={(e) => onAutoPlayIntervalChange(parseInt(e.target.value))}
              style={{
                width: '60px',
                height: '4px',
                cursor: 'pointer',
                accentColor: theme.primaryColor
              }}
              title={`播放速度: ${autoPlayInterval / 1000}秒`}
            />
            <span style={{ fontSize: '10px', color: theme.colors.textSecondary, minWidth: '25px' }}>
              {autoPlayInterval / 1000}s
            </span>
          </div>
        )}

        <button
          onClick={onReplay}
          aria-label="回到第一张幻灯片"
          style={{
            padding: isMobile ? '6px' : '4px',
            background: 'transparent',
            border: 'none',
            color: theme.colors.text,
            cursor: 'pointer',
            opacity: 0.6,
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            minWidth: isMobile ? '44px' : 'auto',
            minHeight: isMobile ? '44px' : 'auto',
          }}
          onMouseEnter={(e) => !isMobile && (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => !isMobile && (e.currentTarget.style.opacity = '0.6')}
          title="回到首页"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onBlur={handleJumpSubmit}
            onKeyDown={handleKeyDown}
            placeholder="..."
            style={{
              width: '40px',
              height: '18px',
              fontSize: '12px',
              textAlign: 'center',
              background: theme === darkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${theme.primaryColor}`,
              borderRadius: '4px',
              color: theme.colors.text,
              outline: 'none',
            }}
          />
        ) : (
          <span 
            onClick={() => {
              setIsEditing(true);
              setJumpValue((currentSlideIndex + 1).toString());
            }}
            title="点击跳转页码"
            style={{ 
              color: theme.colors.text, 
              fontSize: '12px', 
              fontWeight: 600,
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '4px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = theme === darkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {currentSlideIndex + 1} / {slidesCount}
          </span>
        )}
        <div
          style={{
            width: '40px',
            height: '2px',
            background: theme === darkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            marginTop: '4px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${((currentSlideIndex + 1) / slidesCount) * 100}%`,
              background: theme.primaryColor,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
      <button
        onClick={onNext}
        disabled={currentSlideIndex === slidesCount - 1 && clickState === totalClicks - 1}
        aria-label="下一张幻灯片"
        style={{
          padding: isMobile ? '6px' : '4px',
          background: 'transparent',
          border: 'none',
          color: theme.primaryColor,
          cursor: currentSlideIndex === slidesCount - 1 && clickState === totalClicks - 1 ? 'not-allowed' : 'pointer',
          opacity: currentSlideIndex === slidesCount - 1 && clickState === totalClicks - 1 ? 0.2 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: isMobile ? '44px' : 'auto',
          minHeight: isMobile ? '44px' : 'auto',
        }}
        title="下一张"
      >
        <ChevronRight size={isMobile ? 24 : 20} strokeWidth={2.5} />
      </button>

      {!isMobile && (
        <>
          <div style={{ height: '15px', width: '1px', background: theme.colors.border, margin: '0 5px' }} />

          <button
            onClick={onPresenterModeToggle}
            aria-label="打开演讲者模式"
            style={{
              padding: '4px',
              background: 'transparent',
              border: 'none',
              color: theme.colors.text,
              cursor: 'pointer',
              opacity: 0.6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
            title="演讲者模式"
          >
            <Monitor size={18} />
          </button>

          <button
            onClick={onFullscreenToggle}
            aria-label="全屏播放"
            style={{
              padding: '4px',
              background: 'transparent',
              border: 'none',
              color: theme.colors.text,
              cursor: 'pointer',
              opacity: 0.6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
            title="全屏播放"
          >
            <Maximize size={18} />
          </button>
        </>
      )}
    </div>
  );
};
