import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Monitor, 
  Square,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Maximize2,
  Minimize2,
  Move,
  Check,
  Edit3
} from 'lucide-react';

/**
 * Video Preview Component conforming to Chapter 7 Specs
 * Live synchronized HTML5 Video Player with active audio playback and canvas subtitle overlay.
 * Accurate 1:1 rendering matching selected font, stroke, transparent background, animations, and sweet spot snapping.
 */
const VideoPreview = ({
  videoUrl,
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  activeSegment,
  subtitleStyle = {},
  onChangeStyle,
  aspectRatio = '9:16',
  onChangeAspectRatio,
  onUpdateActiveText
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const inlineInputRef = useRef(null);

  const [showSafeArea, setShowSafeArea] = useState(true);
  const [fitMode, setFitMode] = useState('cover'); // 'cover' or 'contain'
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [localTime, setLocalTime] = useState(0);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [localDragPos, setLocalDragPos] = useState(null);

  // Inline editing state right on the video canvas
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [inlineEditText, setInlineEditText] = useState('');

  // Sync custom drag position when subtitleStyle updates from parent
  useEffect(() => {
    if (subtitleStyle.position === 'custom') {
      setLocalDragPos({ x: subtitleStyle.posX ?? 50, y: subtitleStyle.posY ?? 75 });
    } else {
      setLocalDragPos(null);
    }
  }, [subtitleStyle.position, subtitleStyle.posX, subtitleStyle.posY]);

  // Pointer event listeners for free dragging anywhere on the document
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      let pctX = ((clientX - rect.left) / rect.width) * 100;
      let pctY = ((clientY - rect.top) / rect.height) * 100;
      
      // Magnetic Smart Snapping Physics
      if (Math.abs(pctX - 50) < 3.5) pctX = 50; // Center X
      if (Math.abs(pctY - 75) < 3.5) pctY = 75; // Instagram / TikTok Sweet Spot Y
      if (Math.abs(pctY - 15) < 3.5) pctY = 15; // Top Header
      if (Math.abs(pctY - 50) < 3.5) pctY = 50; // Middle
      
      pctX = Math.max(5, Math.min(95, pctX));
      pctY = Math.max(8, Math.min(92, pctY));
      
      setLocalDragPos({ x: Math.round(pctX * 10) / 10, y: Math.round(pctY * 10) / 10 });
    };

    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (localDragPos && onChangeStyle) {
          onChangeStyle({
            ...subtitleStyle,
            position: 'custom',
            posX: localDragPos.x,
            posY: localDragPos.y
          });
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handlePointerMove);
      document.addEventListener('mouseup', handlePointerUp);
      document.addEventListener('touchmove', handlePointerMove, { passive: false });
      document.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('touchmove', handlePointerMove);
      document.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, localDragPos, onChangeStyle, subtitleStyle]);

  // High-performance 60fps sync loop for subtitles
  useEffect(() => {
    let animationFrameId;
    const loop = () => {
      if (videoRef.current && isPlaying) {
        setLocalTime(videoRef.current.currentTime);
        animationFrameId = requestAnimationFrame(loop);
      }
    };
    if (isPlaying) {
      animationFrameId = requestAnimationFrame(loop);
    } else {
      setLocalTime(currentTime);
    }
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, currentTime]);

  // Sync play/pause with video element
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.muted = isMuted;
        videoRef.current.volume = volume;
        videoRef.current.playbackRate = playbackRate;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn('[Video Player Autoplay Notice]', err.message);
          });
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isMuted, volume, playbackRate]);

  // Sync current time with video element
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Sync playback rate
  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const aspectClasses = {
    '9:16': 'w-[300px] h-[533px] sm:w-[340px] sm:h-[604px]',
    '16:9': 'w-full max-w-[640px] aspect-video',
    '1:1': 'w-[360px] h-[360px] sm:w-[400px] sm:h-[400px]'
  };

  // Convert hex to rgb
  function hexToRgb(hex) {
    if (!hex) return '0, 0, 0';
    const c = hex.replace('#', '');
    const bigint = parseInt(c, 16);
    if (isNaN(bigint)) return '0, 0, 0';
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }

  // Accurate transparent background computation
  const isTransparent = subtitleStyle.transparentBg === true || 
    subtitleStyle.backgroundOpacity === 0 || 
    subtitleStyle.backgroundColor === 'transparent' || 
    !subtitleStyle.backgroundColor;

  const bgOpacity = subtitleStyle.backgroundOpacity !== undefined ? subtitleStyle.backgroundOpacity : 0.8;
  const computedBg = isTransparent
    ? 'transparent'
    : `rgba(${hexToRgb(subtitleStyle.backgroundColor || '#000000')}, ${bgOpacity})`;

  // Drop shadow computation
  const shadowOffset = subtitleStyle.shadowOffset || 0;
  const shadowColor = subtitleStyle.shadowColor || 'rgba(0,0,0,0.85)';
  const shadowBlur = shadowOffset * 1.5;
  const computedShadow = shadowOffset > 0 
    ? `${shadowOffset}px ${shadowOffset}px ${shadowBlur}px ${shadowColor}`
    : 'none';

  // Subtitle inline styles matching professional editor engine
  const subtitleInlineStyle = {
    fontFamily: subtitleStyle.fontFamily ? `"${subtitleStyle.fontFamily}", system-ui, -apple-system, BlinkMacSystemFont, sans-serif` : 'Outfit, sans-serif',
    fontSize: `${subtitleStyle.fontSize || 28}px`,
    color: subtitleStyle.primaryColor || '#FFFFFF',
    backgroundColor: computedBg,
    padding: isTransparent ? '4px 10px' : '6px 16px',
    borderRadius: isTransparent ? '6px' : '10px',
    border: (!isTransparent && bgOpacity > 0.3) ? '1px solid rgba(255,255,255,0.1)' : 'none',
    boxShadow: (!isTransparent && bgOpacity > 0.4) ? '0 4px 18px rgba(0,0,0,0.35)' : 'none',
    paintOrder: 'stroke fill',
    WebkitTextStroke: subtitleStyle.strokeWidth 
      ? `${subtitleStyle.strokeWidth}px ${subtitleStyle.strokeColor || '#000000'}`
      : 'none',
    textShadow: computedShadow,
    textTransform: subtitleStyle.uppercase ? 'uppercase' : 'none',
    letterSpacing: `${subtitleStyle.letterSpacing || 0}px`,
    fontWeight: subtitleStyle.fontWeight || '700',
    textAlign: 'center',
    maxWidth: '92%',
    lineHeight: 1.25,
    userSelect: 'none'
  };

  const getPositionClass = () => {
    if (subtitleStyle.position === 'custom' || localDragPos) {
      return ''; // Managed via inline absolute positioning
    }
    switch (subtitleStyle.position) {
      case 'top':
        return 'top-12 items-start';
      case 'center':
        return 'top-1/2 -translate-y-1/2 items-center';
      case 'bottom':
      default:
        return 'bottom-16 items-end';
    }
  };

  const overlayContainerStyle = (subtitleStyle.position === 'custom' || localDragPos) ? {
    top: `${localDragPos?.y ?? subtitleStyle.posY ?? 75}%`,
    left: `${localDragPos?.x ?? subtitleStyle.posX ?? 50}%`,
    transform: 'translate(-50%, -50%)',
    width: '100%',
    bottom: 'auto'
  } : {};

  // Save inline text edit
  const handleSaveInlineText = () => {
    if (onUpdateActiveText && inlineEditText.trim()) {
      onUpdateActiveText(inlineEditText.trim());
    }
    setIsInlineEditing(false);
  };

  return (
    <div className="flex flex-col items-center bg-slate-950/80 rounded-2xl p-4 border border-slate-800 backdrop-blur-md shadow-2xl relative">
      {/* Top Preview Controls Bar */}
      <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            1:1 Accurate Live Preview
          </span>
          <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono text-[10px] border border-indigo-500/30">
            {aspectRatio} {aspectRatio === '9:16' ? 'Vertical' : aspectRatio === '16:9' ? 'Landscape' : 'Square'}
          </span>
        </div>

        {/* Aspect Ratio & Video Controls */}
        <div className="flex items-center gap-2">
          {/* Fit Mode Toggle */}
          {videoUrl && (
            <button
              onClick={() => setFitMode(fitMode === 'cover' ? 'contain' : 'cover')}
              className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-medium transition ${
                fitMode === 'contain'
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={fitMode === 'cover' ? "Currently Fill Screen (Cover). Click for Fit Whole Video (Contain)." : "Currently Fit Whole Video. Click for Fill Screen."}
            >
              {fitMode === 'contain' ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              <span>{fitMode === 'contain' ? 'Fit' : 'Fill'}</span>
            </button>
          )}

          {/* Aspect Ratio Buttons */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => onChangeAspectRatio('9:16')}
              className={`p-1.5 rounded transition ${aspectRatio === '9:16' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              title="9:16 Vertical (TikTok / Reels / Shorts)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeAspectRatio('16:9')}
              className={`p-1.5 rounded transition ${aspectRatio === '16:9' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              title="16:9 Landscape (YouTube / Desktop)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeAspectRatio('1:1')}
              className={`p-1.5 rounded transition ${aspectRatio === '1:1' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              title="1:1 Square (Instagram Post)"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Safe Zone Toggle */}
          <button
            onClick={() => setShowSafeArea(!showSafeArea)}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium transition ${
              showSafeArea 
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Reels / TikTok Safe Zone Bounds"
          >
            {showSafeArea ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Safe Zone</span>
          </button>
        </div>
      </div>

      {/* Video Canvas Box */}
      <div 
        ref={containerRef}
        className={`relative overflow-hidden bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center transition-all duration-300 shadow-2xl ${aspectClasses[aspectRatio] || aspectClasses['9:16']}`}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className={`w-full h-full ${fitMode === 'contain' ? 'object-contain bg-black' : 'object-cover'}`}
            onTimeUpdate={() => {
              if (videoRef.current && isPlaying) {
                onSeek(videoRef.current.currentTime);
              }
            }}
            onEnded={onTogglePlay}
            playsInline
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
              <Smartphone className="w-8 h-8" />
            </div>
            <span className="text-xs font-semibold text-slate-200 mb-1">
              Live Subtitle Preview Canvas
            </span>
            <p className="text-[11px] text-slate-400 max-w-[220px]">
              Upload a video or test subtitle fonts, animations, and custom drag placement live!
            </p>
          </div>
        )}

        {/* Reels / TikTok Safe Zone Bounds Overlay */}
        {showSafeArea && aspectRatio === '9:16' && (
          <div className="absolute inset-0 border border-dashed border-rose-500/30 pointer-events-none rounded-2xl m-3 flex flex-col justify-between p-3 select-none">
            <div className="bg-rose-500/15 text-rose-200 text-[9px] font-mono self-center px-2 py-0.5 rounded-full border border-rose-500/30 backdrop-blur-sm">
              Header & Profile Safe Bounds
            </div>
            <div className="bg-rose-500/15 text-rose-200 text-[9px] font-mono self-center px-2 py-0.5 rounded-full border border-rose-500/30 backdrop-blur-sm">
              Reels / TikTok Action Sweet Spot
            </div>
          </div>
        )}

        {/* Dragging Smart Magnetic Guidelines */}
        {isDragging && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Center Vertical Guideline */}
            <div 
              className={`absolute top-0 bottom-0 transition-all duration-150 ${localDragPos?.x === 50 ? 'bg-indigo-400 w-[2px] shadow-[0_0_10px_rgba(99,102,241,1)]' : 'bg-white/20 w-[1px]'}`} 
              style={{ left: '50%', transform: 'translateX(-50%)' }} 
            />
            
            {/* Sweet Spot Guideline (75%) */}
            <div 
              className={`absolute left-0 right-0 transition-all duration-150 flex items-center justify-center ${localDragPos?.y === 75 ? 'bg-emerald-400 h-[2px] shadow-[0_0_10px_rgba(52,211,153,1)]' : 'bg-white/20 h-[1px]'}`} 
              style={{ top: '75%', transform: 'translateY(-50%)' }} 
            />

            {/* Live Position HUD Badge */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-indigo-500/50 text-indigo-300 text-[10px] font-mono px-3 py-1 rounded-full shadow-xl flex items-center gap-1.5 backdrop-blur-md">
              <Move className="w-3 h-3 text-indigo-400" />
              <span>X: {localDragPos?.x ?? 50}% • Y: {localDragPos?.y ?? 75}%</span>
              {localDragPos?.y === 75 && <span className="text-emerald-400 font-bold">(Sweet Spot)</span>}
            </div>
          </div>
        )}

        {/* Real-time Subtitle Overlay */}
        <div 
          className={`absolute inset-x-0 p-4 flex justify-center pointer-events-none transition-all duration-150 ${getPositionClass()}`}
          style={overlayContainerStyle}
        >
          {activeSegment ? (
            isInlineEditing ? (
              /* Inline Text Edit Overlay on Video */
              <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-950/90 border border-indigo-500 p-2 rounded-xl shadow-2xl backdrop-blur-md max-w-[90%]">
                <input
                  ref={inlineInputRef}
                  type="text"
                  value={inlineEditText}
                  onChange={(e) => setInlineEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveInlineText();
                    if (e.key === 'Escape') setIsInlineEditing(false);
                  }}
                  autoFocus
                  className="bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-400 w-56"
                />
                <button
                  type="button"
                  onClick={handleSaveInlineText}
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                  title="Save text"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Subtitle Text Element */
              <div 
                style={{
                  ...subtitleInlineStyle,
                  pointerEvents: 'auto',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }} 
                onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
                onTouchStart={() => setIsDragging(true)}
                onDoubleClick={() => {
                  setInlineEditText(activeSegment.text || '');
                  setIsInlineEditing(true);
                }}
                className="transition-transform duration-200 transform hover:scale-[1.02] flex flex-wrap justify-center gap-[0.22em] group relative"
                title="Drag to reposition anywhere • Double-click to edit text"
              >
                {/* Visual Hover Hint */}
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-black/80 text-[8px] text-slate-300 font-mono px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap">
                  Drag to move • Double-click to edit
                </span>

                {(() => {
                  const words = (activeSegment.text || '').split(/\s+/).filter(Boolean);
                  if (words.length === 0) return null;

                  // Approximate word timings
                  const segDuration = Math.max(0.2, activeSegment.end - activeSegment.start);
                  const timePerWord = segDuration / words.length;
                  const elapsedInSeg = localTime - activeSegment.start;
                  const currentWordIndex = Math.floor(elapsedInSeg / timePerWord);

                  return words.map((word, idx) => {
                    const isCurrent = idx === currentWordIndex;
                    const isPast = idx < currentWordIndex;

                    let wordStyle = {};
                    let visible = true;
                    const customTransition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.15s ease-out, opacity 0.2s ease-in-out';

                    switch (subtitleStyle.animation) {
                      case 'highlight':
                        if (isCurrent) {
                          wordStyle.color = subtitleStyle.highlightColor || '#FFD700';
                          wordStyle.transform = 'scale(1.1)';
                        }
                        break;
                      case 'karaoke':
                        if (isCurrent || isPast) {
                          wordStyle.color = subtitleStyle.highlightColor || '#FFD700';
                        }
                        break;
                      case 'typewriter':
                        if (idx > currentWordIndex) {
                          visible = false;
                          wordStyle.opacity = 0;
                        } else {
                          wordStyle.opacity = 1;
                        }
                        break;
                      case 'scale-up':
                        if (isCurrent) {
                          wordStyle.transform = 'scale(1.25)';
                          wordStyle.zIndex = 10;
                          wordStyle.color = subtitleStyle.highlightColor || '#FFD700';
                        }
                        break;
                      case 'bounce':
                        if (isCurrent) {
                          wordStyle.transform = 'translateY(-10px) scale(1.15)';
                          wordStyle.color = subtitleStyle.highlightColor || '#FFD700';
                        }
                        break;
                      case 'none':
                      default:
                        break;
                    }

                    if (!visible && subtitleStyle.animation === 'typewriter') {
                      wordStyle.visibility = 'hidden';
                    }

                    return (
                      <span 
                        key={idx} 
                        style={{ 
                          ...wordStyle, 
                          display: 'inline-block',
                          transition: customTransition,
                          willChange: 'transform, color, opacity'
                        }}
                      >
                        {word}
                      </span>
                    );
                  });
                })()}
              </div>
            )
          ) : (
            <div className="text-slate-500 italic text-xs bg-slate-950/70 px-3 py-1.5 rounded-full border border-slate-800/60 shadow-lg">
              (No active subtitle segment at {currentTime.toFixed(1)}s)
            </div>
          )}
        </div>
      </div>

      {/* Media Playback & Precision Scrubber Bar */}
      <div className="w-full mt-4 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5 shadow-md">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="text-slate-300 font-semibold">{formatTime(currentTime)}</span>

          {/* Core Player Controls */}
          <div className="flex items-center gap-2">
            {/* Rewind to start */}
            <button
              onClick={() => {
                onSeek(0);
                if (videoRef.current) videoRef.current.currentTime = 0;
              }}
              className="p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800"
              title="Rewind to start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Skip Back 3s */}
            <button
              onClick={() => {
                const target = Math.max(0, currentTime - 3);
                onSeek(target);
                if (videoRef.current) videoRef.current.currentTime = target;
              }}
              className="p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800 flex items-center gap-0.5 text-[10px]"
              title="Skip back 3 seconds"
            >
              <Rewind className="w-3.5 h-3.5" />
              <span>3s</span>
            </button>

            {/* Play / Pause Toggle */}
            <button
              onClick={onTogglePlay}
              className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/40 active:scale-95"
              title={isPlaying ? "Pause Video (Space)" : "Play Video (Space)"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Skip Forward 3s */}
            <button
              onClick={() => {
                const target = Math.min(duration, currentTime + 3);
                onSeek(target);
                if (videoRef.current) videoRef.current.currentTime = target;
              }}
              className="p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800 flex items-center gap-0.5 text-[10px]"
              title="Skip forward 3 seconds"
            >
              <span>3s</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>

            {/* Audio Volume & Mute */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg ml-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-slate-200 transition"
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (val > 0) setIsMuted(false);
                }}
                className="w-12 accent-indigo-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
                title="Adjust Audio Volume"
              />
            </div>
          </div>

          {/* Playback Speed Selector */}
          <div className="flex items-center gap-1">
            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[9px] font-mono">
              {[0.75, 1, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handlePlaybackRateChange(rate)}
                  className={`px-1.5 py-0.5 rounded transition ${playbackRate === rate ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  {rate}x
                </button>
              ))}
            </div>
            <span className="text-slate-500 font-mono text-[11px] ml-1">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Seek Scrubber Bar */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            onSeek(val);
            if (videoRef.current) videoRef.current.currentTime = val;
          }}
          className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer hover:bg-slate-700 transition"
        />
      </div>
    </div>
  );
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
}

export default VideoPreview;
