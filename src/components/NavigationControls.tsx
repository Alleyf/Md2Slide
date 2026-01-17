import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme } from '../styles/theme';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';

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
}) => {
  const { themeConfig: theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [jumpValue, setJumpValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

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

  return (
    <div
      className="nav-controls"
      style={{
        position: 'absolute',
        bottom: '25px',
        right: '25px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        zIndex: 100,
        background: theme === darkTheme ? 'rgba(20, 20, 20, 0.6)' : 'rgba(255, 255, 255, 0.8)',
        padding: '8px 16px',
        borderRadius: '12px',
        border: theme === darkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
        backdropFilter: 'blur(15px)',
        transition: 'opacity 0.3s ease',
      }}
    >
      <button
        onClick={onPrev}
        disabled={currentSlideIndex === 0 && clickState === 0}
        style={{
          padding: '4px',
          background: 'transparent',
          border: 'none',
          color: theme.primaryColor,
          cursor: currentSlideIndex === 0 && clickState === 0 ? 'not-allowed' : 'pointer',
          opacity: currentSlideIndex === 0 && clickState === 0 ? 0.2 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="上一张"
      >
        <ChevronLeft size={20} strokeWidth={2.5} />
      </button>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={onAutoPlayToggle}
          style={{
            padding: '4px',
            background: 'transparent',
            border: 'none',
            color: isAutoPlaying ? theme.primaryColor : theme.colors.text,
            cursor: 'pointer',
            opacity: isAutoPlaying ? 1 : 0.6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = isAutoPlaying ? '1' : '0.6'}
          title={isAutoPlaying ? "暂停自动播放" : "开始自动播放"}
        >
          {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        {isAutoPlaying && (
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
        style={{
          padding: '4px',
          background: 'transparent',
          border: 'none',
          color: theme.primaryColor,
          cursor: currentSlideIndex === slidesCount - 1 && clickState === totalClicks - 1 ? 'not-allowed' : 'pointer',
          opacity: currentSlideIndex === slidesCount - 1 && clickState === totalClicks - 1 ? 0.2 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="下一张"
      >
        <ChevronRight size={20} strokeWidth={2.5} />
      </button>

      <div style={{ height: '15px', width: '1px', background: theme.colors.border, margin: '0 5px' }} />

      <button
        onClick={onFullscreenToggle}
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
    </div>
  );
};
