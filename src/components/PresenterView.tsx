import React, { useState, useEffect, useRef } from 'react';
import { SlideContent } from '../types/slide';
import { useTheme } from '../context/ThemeContext';
import { Play, Pause, RotateCcw, Clock, ArrowLeft, ArrowRight } from 'lucide-react';

interface PresenterViewProps {
  slides: SlideContent[];
  initialIndex?: number;
}

export const PresenterView: React.FC<PresenterViewProps> = ({ slides: initialSlides, initialIndex = 0 }) => {
  const [slides, setSlides] = useState<SlideContent[]>(initialSlides);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { themeConfig: theme } = useTheme();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with main window via localStorage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'md2slide_current_index' && e.newValue !== null) {
        setCurrentIndex(parseInt(e.newValue));
      }
      if (e.key === 'md2slide_presenter_slides' && e.newValue !== null) {
        setSlides(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    
    // Check initial values
    const savedIndex = localStorage.getItem('md2slide_current_index');
    if (savedIndex !== null) {
      setCurrentIndex(parseInt(savedIndex));
    }
    const savedSlides = localStorage.getItem('md2slide_presenter_slides');
    if (savedSlides !== null) {
      setSlides(JSON.parse(savedSlides));
    }

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Update localStorage when local index changes (if user clicks in presenter view)
  const updateIndex = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < slides.length) {
      setCurrentIndex(newIndex);
      localStorage.setItem('md2slide_current_index', newIndex.toString());
    }
  };

  // Timer logic
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderMinimalElement = (el: any) => {
    const baseStyle: React.CSSProperties = {
      opacity: 1,
      transform: 'none',
    };

    switch (el.type) {
      case 'text':
      case 'markdown':
        return (
          <div
            key={el.id}
            style={{
              fontSize: '18px',
              lineHeight: 1.6,
              marginBottom: '8px',
              textAlign: 'justify',
              textIndent: '2em',
              ...baseStyle,
            }}
            dangerouslySetInnerHTML={{ __html: el.content }}
          />
        );
      case 'bullets':
        const ListTag = el.listType === 'ol' ? 'ol' : 'ul';
        return (
          <ListTag
            key={el.id}
            start={el.listStart}
            style={{
              paddingLeft: '25px',
              marginBottom: '10px',
              fontSize: '18px',
              ...baseStyle,
            }}
          >
            {el.content.map((item: string, i: number) => (
              <li key={i} style={{ marginBottom: '5px' }} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ListTag>
        );
      case 'code':
        return (
          <pre
            key={el.id}
            style={{
              padding: '10px',
              background: '#333',
              borderRadius: '4px',
              fontSize: '14px',
              overflow: 'hidden',
              marginBottom: '10px',
              ...baseStyle,
            }}
          >
            <code>{el.content}</code>
          </pre>
        );
      case 'image':
        return (
          <img
            key={el.id}
            src={el.content}
            alt=""
            style={{
              maxWidth: '100%',
              maxHeight: '150px',
              objectFit: 'contain',
              marginBottom: '10px',
              borderRadius: '4px',
              ...baseStyle,
            }}
          />
        );
      default:
        return null;
    }
  };

  const currentSlide = slides[currentIndex];
  const nextSlide = currentIndex < slides.length - 1 ? slides[currentIndex + 1] : null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr',
      gridTemplateRows: '1fr 1fr',
      height: '100vh',
      background: '#1a1a1a',
      color: '#fff',
      fontFamily: theme.fontFamily,
      padding: '20px',
      gap: '20px',
      boxSizing: 'border-box',
    }}>
      {/* Current Slide Preview */}
      <div style={{
        gridColumn: '1',
        gridRow: '1',
        background: '#000',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        border: `2px solid ${theme.primaryColor}`,
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '15px', position: 'sticky', top: 0, background: '#000', padding: '5px 0' }}>
          CURRENT SLIDE ({currentIndex + 1}/{slides.length})
        </div>
        <div style={{ flex: 1 }}>
           <h1 style={{ fontSize: '32px', textAlign: 'center', marginBottom: '20px' }}>
             {currentSlide?.title ? <span dangerouslySetInnerHTML={{ __html: currentSlide.title }} /> : 'Slide ' + (currentIndex + 1)}
           </h1>
           {currentSlide?.subtitle && (
             <h2 style={{ fontSize: '24px', opacity: 0.8, textAlign: 'center', marginBottom: '20px', color: theme.primaryColor }}>
               <span dangerouslySetInnerHTML={{ __html: currentSlide.subtitle }} />
             </h2>
           )}
           <div style={{ marginTop: '20px' }}>
             {currentSlide?.elements.map(renderMinimalElement)}
           </div>
        </div>
      </div>

      {/* Next Slide Preview */}
      <div style={{
        gridColumn: '2',
        gridRow: '1',
        background: '#222',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        border: '1px solid #444',
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '15px', position: 'sticky', top: 0, background: '#222', padding: '5px 0' }}>NEXT SLIDE</div>
        <div style={{ flex: 1 }}>
          {nextSlide ? (
            <>
               <h1 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '15px' }}>
                 {nextSlide.title ? <span dangerouslySetInnerHTML={{ __html: nextSlide.title }} /> : 'Slide ' + (currentIndex + 2)}
               </h1>
               {nextSlide.subtitle && (
                 <h2 style={{ fontSize: '18px', opacity: 0.8, textAlign: 'center', marginBottom: '15px', color: theme.primaryColor }}>
                   <span dangerouslySetInnerHTML={{ __html: nextSlide.subtitle }} />
                 </h2>
               )}
               <div style={{ marginTop: '15px', opacity: 0.6 }}>
                 {nextSlide.elements.map(renderMinimalElement)}
               </div>
            </>
          ) : (
            <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: '#555' }}>
              End of presentation
            </div>
          )}
        </div>
      </div>

      {/* Speaker Notes */}
      <div style={{
        gridColumn: '1 / span 2',
        gridRow: '2',
        background: '#222',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        border: '1px solid #444',
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.primaryColor, marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>SPEAKER NOTES</div>
        <div style={{ fontSize: '20px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
          {currentSlide?.notes || <span style={{ opacity: 0.3, fontStyle: 'italic' }}>No notes for this slide.</span>}
        </div>
      </div>

      {/* Controls & Timer Overlay (Floating bottom) */}
      <div style={{
        position: 'fixed',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)',
        padding: '10px 25px',
        borderRadius: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        border: '1px solid #333',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.primaryColor, fontWeight: 'bold', fontSize: '20px' }}>
          <Clock size={20} />
          {formatTime(elapsedTime)}
        </div>
        <div style={{ width: '1px', height: '24px', background: '#444' }} />
        <button onClick={() => setIsPaused(!isPaused)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {isPaused ? <Play size={24} /> : <Pause size={24} />}
        </button>
        <button onClick={() => setElapsedTime(0)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <RotateCcw size={20} />
        </button>
        <div style={{ width: '1px', height: '24px', background: '#444' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => updateIndex(currentIndex - 1)} disabled={currentIndex === 0} style={{ background: 'none', border: 'none', color: currentIndex === 0 ? '#444' : '#fff', cursor: currentIndex === 0 ? 'default' : 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <button onClick={() => updateIndex(currentIndex + 1)} disabled={currentIndex === slides.length - 1} style={{ background: 'none', border: 'none', color: currentIndex === slides.length - 1 ? '#444' : '#fff', cursor: currentIndex === slides.length - 1 ? 'default' : 'pointer' }}>
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
