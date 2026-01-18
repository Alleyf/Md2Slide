import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import MusicVisualizer from './MusicVisualizer';

interface MusicPlayerProps {
  defaultMusicPath?: string;
}

interface MusicTrack {
  id: string;
  title: string;
  path: string;
  duration?: number;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ defaultMusicPath = '/music/风止了.mp3' }) => {
  const { themeConfig: theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showControls, setShowControls] = useState(false);
  
  // 拖动相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 }); // 初始位置
  const dragStartPos = useRef({ x: 0, y: 0 });
  
  // 音乐播放列表状态
  const [playlist, setPlaylist] = useState<MusicTrack[]>([
    { id: '1', title: '风止了', path: '/music/风止了.mp3' },
  ]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);

  // 音乐节奏相关的状态
  const [visualizerData, setVisualizerData] = useState<number[]>([]);
  
  // 初始化位置
  useEffect(() => {
    setPosition({ x: 20, y: window.innerHeight - 60 });
    
    // 尝试获取music目录下的音乐文件
    fetchMusicFiles();
  }, []);

  // 获取music目录下的音乐文件
  const fetchMusicFiles = async () => {
    try {
      // 为了获取public/music目录下的所有音乐文件，我们需要一个简单的API或者JSON文件
      // 这里我们创建一个music-list.json文件来列出所有音乐文件
      const response = await fetch('/music/music-list.json');
      if (response.ok) {
        const musicList = await response.json();
        const tracks: MusicTrack[] = musicList.map((fileName: string, index: number) => ({
          id: `track-${index}`,
          title: fileName.replace(/\.(mp3|wav|ogg)$/i, ''),
          path: `/music/${fileName}`
        }));
        setPlaylist(tracks);
      } else {
        // 如果没有找到music-list.json，使用默认音乐
        setPlaylist([{ id: '1', title: '风止了', path: '/music/风止了.mp3' }]);
      }
    } catch (error) {
      console.error('获取音乐文件列表失败，使用默认音乐:', error);
      setPlaylist([{ id: '1', title: '风止了', path: '/music/风止了.mp3' }]);
    }
  };
  
  // 获取可视化数据的回调函数
  useEffect(() => {
    // 当播放状态变化时，更新可视化数据
    if (isPlaying) {
      // 模拟音乐节奏变化（实际中这会来自音频分析）
      const interval = setInterval(() => {
        // 生成随机的可视化数据来模拟节奏，使其更加动态
        const newData = Array.from({ length: 32 }, () => Math.random() * 100);
        setVisualizerData(newData);
      }, 50); // 减少间隔时间，使变化更流畅
      
      return () => clearInterval(interval);
    } else {
      setVisualizerData([]);
    }
  }, [isPlaying]);

  // 加载音频元数据和设置音量
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration || 0);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    // 设置初始音量
    audio.volume = volume;

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    
    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
    };
  }, [volume]);
  
  // 拖动处理函数
  const handleMouseDown = useCallback((e: React.MouseEvent, isDragHandle = false) => {
    // 只有在点击拖动句柄或播放器整体时才允许拖动
    if (isDragHandle || e.currentTarget === e.target) {
      e.preventDefault();
      setIsDragging(true);
      
      const rect = e.currentTarget.getBoundingClientRect();
      dragStartPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  }, []);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    
    // 限制在窗口范围内
    const clampedX = Math.max(0, Math.min(window.innerWidth - 100, newX));
    const clampedY = Math.max(0, Math.min(window.innerHeight - 60, newY));
    
    setPosition({ x: clampedX, y: clampedY });
  }, [isDragging]);
  
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // 吸附到边缘
    let newX = position.x;
    let newY = position.y;
    
    // 水平方向吸附
    if (position.x <= window.innerWidth * 0.1) {
      newX = 10; // 左边
    } else if (position.x >= window.innerWidth - 40) {
      newX = window.innerWidth - 40; // 右边
    }
    
    // 垂直方向吸附
    if (position.y <= window.innerHeight * 0.1) {
      newY = 10; // 顶部
    } else if (position.y >= window.innerHeight - 40) {
      newY = window.innerHeight - 40; // 底部
    }
    
    setPosition({ x: newX, y: newY });
  }, [position]);
  
  // 添加全局鼠标事件监听器
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  // 处理窗口大小变化时的吸附
  useEffect(() => {
    const handleResize = () => {
      // 检查当前位置是否靠近边缘，如果是，则重新吸附
      let newX = position.x;
      let newY = position.y;
      
      if (position.x <= window.innerWidth * 0.1) {
        newX = 10; // 左边
      } else if (position.x >= window.innerWidth - 40) {
        newX = window.innerWidth - 40; // 右边
      }
      
      if (position.y <= window.innerHeight * 0.1) {
        newY = 10; // 顶部
      } else if (position.y >= window.innerHeight - 40) {
        newY = window.innerHeight - 40; // 底部
      }
      
      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: newX, y: newY });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [position]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error("播放失败:", e));
    }
    setIsPlaying(!isPlaying);
    
    // 确保音量设置生效
    audio.volume = volume;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };
  
  // 切换到指定音乐
  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(false); // 先暂停
    setTimeout(() => {
      setIsPlaying(true); // 然后播放新音乐
    }, 100);
  };
  
  // 播放下一首
  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(false);
    setTimeout(() => {
      setIsPlaying(true);
    }, 100);
  };
  
  // 播放上一首
  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(false);
    setTimeout(() => {
      setIsPlaying(true);
    }, 100);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // 当前播放的曲目
  const currentTrack = playlist[currentTrackIndex] || { id: '1', title: '风止了', path: defaultMusicPath };
  
  // 计算节奏变化的颜色
  const getRhythmicColor = () => {
    if (!isPlaying || visualizerData.length === 0) {
      return theme.primaryColor; // 默认颜色
    }
    
    // 根据音频数据的变化来调整颜色，增强变化效果
    const avgAmplitude = visualizerData.reduce((a, b) => a + b, 0) / visualizerData.length;
    const intensity = Math.min(avgAmplitude / 100, 1); // 限制在0-1之间
    
    // 创建更明显的颜色变化效果
    const baseR = parseInt(theme.primaryColor.slice(1, 3), 16);
    const baseG = parseInt(theme.primaryColor.slice(3, 5), 16);
    const baseB = parseInt(theme.primaryColor.slice(5, 7), 16);
    
    // 增强变化范围，使颜色变化更明显
    const r = Math.min(255, Math.floor(baseR + (255 - baseR) * intensity * 0.7));
    const g = Math.min(255, Math.floor(baseG + (255 - baseG) * intensity * 0.7));
    const b = Math.min(255, Math.floor(baseB + (255 - baseB) * intensity * 0.7));
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // 是否处于收起状态（没有鼠标悬停且没有播放）
  const isCollapsed = !showControls;

  // 计算位置样式
  const playerStyle = {
    position: 'fixed' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: isCollapsed ? '8px' : showPlaylist ? '12px' : '10px 15px',
    borderRadius: '24px',
    background: isCollapsed 
      ? `radial-gradient(circle, ${theme.primaryColor} 0%, ${theme.colors.surface} 70%)`
      : `linear-gradient(135deg, ${theme.colors.surface}, ${theme.colors.background})`,
    boxShadow: isCollapsed
      ? `0 2px 10px rgba(0, 0, 0, 0.2), 0 0 15px rgba(${parseInt(theme.primaryColor.slice(1, 3), 16)}, ${parseInt(theme.primaryColor.slice(3, 5), 16)}, ${parseInt(theme.primaryColor.slice(5, 7), 16)}, 0.3)`
      : `0 4px 20px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.1)`,
    border: `1px solid ${theme.colors.border}`,
    backdropFilter: 'blur(10px)',
    transform: 'translate(0, 0)',
    transition: 'all 0.3s ease',
    opacity: 0.8,
    cursor: isDragging ? 'grabbing' : 'default',
    width: isCollapsed ? '40px' : showPlaylist ? '300px' : 'auto',
    minHeight: isCollapsed ? '40px' : '50px',
    justifyContent: showPlaylist ? 'normal' : 'center',
    overflow: 'hidden'
  };

  return (
    <div 
      style={playerStyle}
      onMouseDown={(e) => handleMouseDown(e, false)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <audio
        ref={audioRef}
        src={currentTrack.path}
        loop // 启用循环播放
        onEnded={() => {
          // 自动播放下一首
          playNext();
        }}
      />
        
      {/* 拖动句柄 */}
      <div 
        style={{
          width: '4px',
          height: '20px',
          backgroundColor: theme.colors.textSecondary,
          borderRadius: '2px',
          cursor: 'move',
          alignSelf: 'center',
          margin: '0 4px'
        }}
        onMouseDown={(e) => {
          e.stopPropagation(); // 防止事件冒泡
          handleMouseDown(e, true);
        }}
      />
      
      {/* 展开状态下的控制按钮 */}
      {!isCollapsed && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
          visibility: showControls ? 'visible' : 'hidden',
          height: showControls ? 'auto' : '0',
          overflow: 'hidden',
          flex: 1
        }}>
          {/* 播放列表按钮 */}
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              background: theme.colors.border,
              color: theme.colors.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
            title="播放列表"
          >
            🎵
          </button>
          
          {/* 播放列表 */}
          {showPlaylist && (
            <div style={{
              position: 'absolute',
              top: '-200px',
              left: '0',
              width: '280px',
              maxHeight: '200px',
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              padding: '10px',
              overflowY: 'auto',
              zIndex: 1001,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ marginBottom: '8px', fontWeight: 'bold', color: theme.colors.text }}>
                播放列表
              </div>
              {playlist.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(index)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: currentTrackIndex === index ? theme.primaryColor : 'transparent',
                    color: currentTrackIndex === index ? '#fff' : theme.colors.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{currentTrackIndex === index ? '▶️' : '🎵'}</span>
                  <span style={{ flex: 1 }}>{track.title}</span>
                  {currentTrackIndex === index && <span>Now Playing</span>}
                </div>
              ))}
            </div>
          )}
          
          {/* 上一首按钮 */}
          <button
            onClick={playPrev}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: 'none',
              background: theme.colors.border,
              color: theme.colors.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="上一首"
          >
            ⏮
          </button>
          
          {/* 播放/暂停按钮 */}
          <button
            onClick={togglePlayPause}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: theme.primaryColor,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `0 2px 8px rgba(0, 0, 0, 0.2)`,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isDragging) {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = `0 4px 12px rgba(0, 0, 0, 0.3)`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = `0 2px 8px rgba(0, 0, 0, 0.2)`;
            }}
            title={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="4" width="4" height="16" rx="1" fill="white"/>
                <rect x="14" y="4" width="4" height="16" rx="1" fill="white"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5V19L19 12L8 5Z" fill="white"/>
              </svg>
            )}
          </button>
          
          {/* 下一首按钮 */}
          <button
            onClick={playNext}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: 'none',
              background: theme.colors.border,
              color: theme.colors.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="下一首"
          >
            ⏭
          </button>
          
          {/* 进度条和音量控制区域 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: '100px'
          }}>
            {/* 当前播放曲目信息 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '4px'
            }}>
              <span style={{ 
                fontSize: '12px', 
                color: theme.colors.textSecondary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentTrack.title}
              </span>
            </div>
            
            {/* 进度条 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '4px'
            }}>
              <span style={{ fontSize: '10px', color: theme.colors.textSecondary }}>
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: theme.colors.border,
                  outline: 'none',
                  border: 'none',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '10px', color: theme.colors.textSecondary }}>
                {formatTime(duration)}
              </span>
            </div>
            
            {/* 音量控制 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: theme.colors.textSecondary }}>
                <path d="M3 10V14C3 14 7 12 7 12C7 12 11 14 11 10C11 6 7 4 7 4C7 4 3 6 3 10Z" stroke={theme.colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 8C16.6569 8 18 9.34315 18 11C18 12.6569 16.6569 14 15 14C14.793 14 14.5931 13.971 14.4031 13.9155C13.3509 15.1746 11.8254 16 10 16C7.79086 16 6 14.2091 6 12C6 9.79086 7.79086 8 10 8C11.3562 8 12.5202 8.66432 13.2533 9.65429C13.6247 8.8529 14.263 8.21064 15 8Z" stroke={theme.colors.textSecondary} strokeWidth="2"/>
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: theme.colors.border,
                  outline: 'none',
                  border: 'none',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* 收起状态下的音乐图标 */}
      {!showPlaylist && (
        <div style={{
          width: isCollapsed ? '24px' : '24px',
          height: isCollapsed ? '24px' : '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: getRhythmicColor(), // 根据音乐节奏变化颜色
          transform: isPlaying ? 'rotate(0deg)' : 'rotate(-30deg)',
          transition: 'transform 0.3s ease',
          filter: isPlaying ? 'drop-shadow(0 0 8px rgba(58, 134, 255, 0.7))' : 'none' // 播放时添加发光效果
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 5L11 19C11 20.3807 12.5 21 13 19.5L13 6C13 4.61929 12 4 11 5Z" stroke={getRhythmicColor()} strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 5L6 19C6 20.3807 7.5 21 8 19.5L8 6C8 4.61929 7 4 6 5Z" stroke={getRhythmicColor()} strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="10" stroke={getRhythmicColor()} strokeWidth="2"/>
          </svg>
        </div>
      )}
        
      <MusicVisualizer audioRef={audioRef} isActive={isPlaying} />
    </div>
  );
}

export default MusicPlayer;