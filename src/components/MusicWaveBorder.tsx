import React, { useEffect, useRef } from 'react';

interface MusicWaveBorderProps {
  isActive: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const MusicWaveBorder: React.FC<MusicWaveBorderProps> = ({ isActive, audioRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive || !audioRef.current || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸为全屏
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 获取音频上下文用于分析
    const audio = audioRef.current;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;

    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audio);
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    } catch (error) {
      console.error('无法创建音频上下文:', error);
      // 如果无法创建音频上下文，使用模拟数据
      dataArray = new Uint8Array(128).fill(0);
    }

    let animationFrameId: number;

    const draw = () => {
      if (!ctx || !canvas) return;

      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 获取音频数据
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
      }

      // 绘制四个边的波浪效果
      ctx.strokeStyle = 'rgba(58, 134, 255, 0.3)'; // 半透明蓝色
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 顶部波浪
      drawWave(ctx, canvas.width, 0, 'top', dataArray);

      // 底部波浪
      drawWave(ctx, canvas.width, canvas.height, 'bottom', dataArray);

      // 左侧波浪
      drawWaveVertical(ctx, canvas.height, 0, 'left', dataArray);

      // 右侧波浪
      drawWaveVertical(ctx, canvas.height, canvas.width, 'right', dataArray);

      animationFrameId = requestAnimationFrame(draw);
    };

    const drawWave = (
      ctx: CanvasRenderingContext2D,
      width: number,
      offsetY: number,
      position: 'top' | 'bottom',
      dataArray: Uint8Array
    ) => {
      if (!dataArray || dataArray.length === 0) return;

      ctx.beginPath();

      const amplitudeFactor = 5; // 控制波浪幅度
      const sensitivity = 0.3; // 控制对音频的敏感度
      const segmentWidth = width / dataArray.length;

      for (let i = 0; i < dataArray.length; i++) {
        const x = i * segmentWidth;
        // 使用低频部分来控制波浪形状
        const frequencyValue = dataArray[Math.min(i, dataArray.length - 1)];
        const amplitude = (frequencyValue / 255) * amplitudeFactor * sensitivity;

        // 计算波浪偏移量
        const waveOffset = Math.sin((i / dataArray.length) * Math.PI * 4) * amplitude;

        if (i === 0) {
          if (position === 'top') {
            ctx.moveTo(x, offsetY + 5 + waveOffset);
          } else {
            ctx.moveTo(x, offsetY - 5 + waveOffset);
          }
        } else {
          if (position === 'top') {
            ctx.lineTo(x, offsetY + 5 + waveOffset);
          } else {
            ctx.lineTo(x, offsetY - 5 + waveOffset);
          }
        }
      }

      ctx.stroke();
    };

    const drawWaveVertical = (
      ctx: CanvasRenderingContext2D,
      height: number,
      offsetX: number,
      position: 'left' | 'right',
      dataArray: Uint8Array
    ) => {
      if (!dataArray || dataArray.length === 0) return;

      ctx.beginPath();

      const amplitudeFactor = 5; // 控制波浪幅度
      const sensitivity = 0.3; // 控制对音频的敏感度
      const segmentHeight = height / dataArray.length;

      for (let i = 0; i < dataArray.length; i++) {
        const y = i * segmentHeight;
        // 使用低频部分来控制波浪形状
        const frequencyValue = dataArray[Math.min(i, dataArray.length - 1)];
        const amplitude = (frequencyValue / 255) * amplitudeFactor * sensitivity;

        // 计算波浪偏移量
        const waveOffset = Math.sin((i / dataArray.length) * Math.PI * 4) * amplitude;

        if (i === 0) {
          if (position === 'left') {
            ctx.moveTo(offsetX + 5 + waveOffset, y);
          } else {
            ctx.moveTo(offsetX - 5 + waveOffset, y);
          }
        } else {
          if (position === 'left') {
            ctx.lineTo(offsetX + 5 + waveOffset, y);
          } else {
            ctx.lineTo(offsetX - 5 + waveOffset, y);
          }
        }
      }

      ctx.stroke();
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      
      // 关闭音频上下文
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [isActive, audioRef]);

  // 如果不活跃，返回空组件
  if (!isActive) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none', // 确保不影响用户交互
        zIndex: 9998, // 确保在大多数元素之下，但高于背景
        opacity: 0.6
      }}
    />
  );
};

export default MusicWaveBorder;