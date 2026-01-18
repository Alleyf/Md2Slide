import React, { useEffect, useRef, useState } from 'react';

interface MusicVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isActive: boolean;
}

const MusicVisualizer: React.FC<MusicVisualizerProps> = ({ audioRef, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!enabled || !isActive || !audioRef.current || !canvasRef.current) {
      cancelAnimationFrame(animationRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const audio = audioRef.current;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!ctx || !canvas) return;
      
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(58, 134, 255, 0.6)'; // theme.primaryColor with transparency
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      
      // Draw circles that react to bass frequencies
      for (let i = 0; i < 10; i++) {
        const bassValue = dataArray[i] / 255;
        const radius = 10 + bassValue * 30;
        const xPos = (canvas.width / 10) * i + 20;
        const yPos = canvas.height - 50;
        
        ctx.beginPath();
        ctx.arc(xPos, yPos, radius, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(58, 134, 255, ${0.2 + bassValue * 0.5})`;
        ctx.fill();
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationRef.current);
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [isActive, enabled, audioRef]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        opacity: isActive ? 0.15 : 0,
        transition: 'opacity 0.5s ease'
      }}
    />
  );
};

export default MusicVisualizer;