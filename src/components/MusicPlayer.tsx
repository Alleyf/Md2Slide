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
  
  // 拖动相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 }); // 初始位置
  const dragStartPos = useRef({ x: 0, y: 0 });
  
  // 音乐播放列表状态
  const [playlist, setPlaylist] = useState<MusicTrack[]>([
    { id: '1', title: '风止了', path: '/music/风止了.mp3' },
  ]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  // 音乐节奏相关的状态
  const [visualizerData, setVisualizerData] = useState<number[]>([]);
  
  // 初始化位置
  useEffect(() => {
    setPosition({ x: window.innerWidth - 60, y: window.innerHeight - 60 }); // 右下角初始位置
    
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
        const tracks: MusicTrack[] = musicList
          .filter((fileName: string) => /\.(mp3|wav|ogg)$/i.test(fileName)) // 只包含音频文件
          .map((fileName: string, index: number) => ({
            id: `track-${index}`,
            title: fileName.replace(/\.(mp3|wav|ogg)$/i, ''),
            path: `/music/${fileName}`
          }));
        
        if (tracks.length > 0) {
          setPlaylist(tracks);
        } else {
          // 如果没有找到音频文件，使用默认音乐
          setPlaylist([{ id: '1', title: '风止了', path: '/music/风止了.mp3' }]);
        }
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
      // 确保小球不会超出窗口边界
      let newX = Math.max(10, Math.min(window.innerWidth - 50, position.x));
      let newY = Math.max(10, Math.min(window.innerHeight - 50, position.y));
      
      setPosition({ x: newX, y: newY });
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setCurrentTrackIndex(index);
    
    // 使用setTimeout确保音频元素已更新路径后再播放
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("播放失败:", e));
        setIsPlaying(true);
      }
    }, 100);
  };
  
  // 播放下一首
  const playNext = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    
    // 使用setTimeout确保音频元素已更新路径后再播放
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("播放失败:", e));
        setIsPlaying(true);
      }
    }, 100);
  };
  
  // 播放上一首
  const playPrev = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    
    // 使用setTimeout确保音频元素已更新路径后再播放
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("播放失败:", e));
        setIsPlaying(true);
      }
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

  // 计算位置样式 - 简化的悬浮小球
  const playerStyle = {
    position: 'fixed' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 1000,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${getRhythmicColor()} 0%, ${theme.colors.surface} 70%)`,
    boxShadow: `0 2px 10px rgba(0, 0, 0, 0.2), 0 0 15px rgba(${parseInt(getRhythmicColor().slice(1, 3), 16)}, ${parseInt(getRhythmicColor().slice(3, 5), 16)}, ${parseInt(getRhythmicColor().slice(5, 7), 16)}, 0.3)`
      + `, 0 0 20px rgba(${parseInt(getRhythmicColor().slice(1, 3), 16)}, ${parseInt(getRhythmicColor().slice(3, 5), 16)}, ${parseInt(getRhythmicColor().slice(5, 7), 16)}, 0.1)`,
    border: `1px solid ${theme.colors.border}`,
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isDragging ? 'grabbing' : 'pointer',
    transition: 'all 0.3s ease',
    transform: 'translate(0, 0)',
  };

  // 播放列表模态窗样式
  const modalStyle = {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    background: `linear-gradient(135deg, ${theme.colors.surface}AA, ${theme.colors.background}BB)`,
    border: `1px solid ${theme.colors.border}80`,
    borderRadius: '20px',
    padding: '20px',
    zIndex: 10000,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    fontFamily: 'inherit',
  };

  // 遮罩层样式
  const overlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)',
    zIndex: 9999,
  };

  return (
    <>
      <div 
        style={playerStyle}
        onMouseDown={(e) => handleMouseDown(e, true)} // 整个小球都可以拖动
        onClick={() => setShowPlaylistModal(true)} // 点击打开模态窗
      >
        <div style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          transform: isPlaying ? 'rotate(0deg)' : 'rotate(-30deg)',
          transition: 'transform 0.3s ease',
          filter: isPlaying ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.7))' : 'none'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 5L11 19C11 20.3807 12.5 21 13 19.5L13 6C13 4.61929 12 4 11 5Z" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 5L6 19C6 20.3807 7.5 21 8 19.5L8 6C8 4.61929 7 4 6 5Z" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/>
          </svg>
        </div>
      </div>
      
      <audio
        ref={audioRef}
        src={currentTrack.path}
        loop // 启用循环播放
        onEnded={() => {
          // 自动播放下一首
          playNext();
        }}
        onLoadedMetadata={() => {
          // 当音频元数据加载完成时更新时长
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
      />
      
      {/* 液态柔滑玻璃风格的模态窗 */}
      {showPlaylistModal && (
        <>
          <div 
            style={overlayStyle}
            onClick={() => setShowPlaylistModal(false)} // 点击遮罩关闭模态窗
          />
          <div style={modalStyle}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: `1px solid ${theme.colors.border}80`
            }}>
              <h2 style={{
                margin: 0,
                color: theme.colors.text,
                fontSize: '1.2em'
              }}>播放列表</h2>
              <button 
                onClick={() => setShowPlaylistModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.text,
                  fontSize: '1.5em',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            
            {/* 当前播放信息 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '10px',
              marginBottom: '15px',
              borderRadius: '12px',
              background: `${theme.colors.background}80`,
              border: `1px solid ${theme.colors.border}80`
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: theme.primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.2em'
              }}>
                🎵
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: theme.colors.text }}>
                  {currentTrack.title}
                </div>
                <div style={{ fontSize: '0.8em', color: theme.colors.textSecondary }}>
                  正在播放
                </div>
              </div>
            </div>
            
            {/* 播放控制 */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <button
                onClick={playPrev}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: theme.colors.border,
                  color: theme.colors.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.2em',
                  transition: 'all 0.2s ease'
                }}
                title="上一首"
              >
                ⏮
              </button>
              
              <button
                onClick={togglePlayPause}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  border: 'none',
                  background: theme.primaryColor,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: `0 4px 10px rgba(0, 0, 0, 0.2)`,
                  transition: 'all 0.2s ease'
                }}
                title={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="4" width="4" height="16" rx="1" fill="white"/>
                    <rect x="14" y="4" width="4" height="16" rx="1" fill="white"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="white"/>
                  </svg>
                )}
              </button>
              
              <button
                onClick={playNext}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: theme.colors.border,
                  color: theme.colors.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.2em',
                  transition: 'all 0.2s ease'
                }}
                title="下一首"
              >
                ⏭
              </button>
            </div>
            
            {/* 进度条 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px'
            }}>
              <span style={{ fontSize: '0.8em', color: theme.colors.textSecondary }}>
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
                  height: '6px',
                  borderRadius: '3px',
                  background: theme.colors.border,
                  outline: 'none',
                  border: 'none',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '0.8em', color: theme.colors.textSecondary }}>
                {formatTime(duration)}
              </span>
            </div>
            
            {/* 音量控制 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: theme.colors.textSecondary }}>
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
                  height: '6px',
                  borderRadius: '3px',
                  background: theme.colors.border,
                  outline: 'none',
                  border: 'none',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '0.8em', color: theme.colors.textSecondary }}>
                {Math.round(volume * 100)}%
              </span>
            </div>
            
            {/* 播放列表 */}
            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: `1px solid ${theme.colors.border}80`,
              borderRadius: '12px',
              padding: '10px',
              background: `${theme.colors.background}40`
            }}>
              <div style={{ 
                marginBottom: '10px', 
                fontWeight: 'bold', 
                color: theme.colors.text,
                fontSize: '0.9em'
              }}>
                曲目列表
              </div>
              {/* 必须渲染音乐文件名作为可预览文本 */}
              {playlist.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => {
                    playTrack(index);
                  }}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: currentTrackIndex === index ? `${theme.primaryColor}80` : 'transparent',
                    color: currentTrackIndex === index ? '#fff' : theme.colors.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    margin: '4px 0',
                    border: currentTrackIndex === index ? `1px solid ${theme.primaryColor}80` : `1px solid transparent`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentTrackIndex !== index) {
                      e.currentTarget.style.backgroundColor = `${theme.colors.border}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentTrackIndex !== index) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.1em' }}>{currentTrackIndex === index ? '▶️' : '🎵'}</span>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</span>
                  {currentTrackIndex === index && (
                    <span style={{ fontSize: '0.8em', opacity: 0.8 }}>当前</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      <MusicVisualizer audioRef={audioRef} isActive={isPlaying} />
    </>
  );
}

export default MusicPlayer;