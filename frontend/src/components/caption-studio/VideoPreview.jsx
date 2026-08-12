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
  VolumeX
} from 'lucide-react';

/**
 * Video Preview Component conforming to Chapter 7 Specs
 * Live synchronized HTML5 Video Player with active audio playback and canvas subtitle overlay.
 * Default aspect ratio: 9:16 Vertical (Shorts/Reels/TikTok)
 */
const VideoPreview = ({
  videoUrl,
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  activeCaptionText,
  subtitleStyle,
  aspectRatio = '9:16',
  onChangeAspectRatio
}) => {
  const videoRef = useRef(null);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);

  // Sync play/pause with video element
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.muted = isMuted;
        videoRef.current.volume = volume;
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
  }, [isPlaying, isMuted, volume]);

  // Sync current time with video element
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Sync audio volume & mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  const aspectClasses = {
    '9:16': 'w-[300px] h-[533px] sm:w-[340px] sm:h-[604px]',
    '16:9': 'w-full max-w-[640px] aspect-video',
    '1:1': 'w-[400px] h-[400px]'
  };

  const subtitleInlineStyle = {
    fontFamily: subtitleStyle.fontFamily || 'Outfit',
    fontSize: `${subtitleStyle.fontSize || 24}px`,
    color: subtitleStyle.primaryColor || '#FFFFFF',
    backgroundColor: subtitleStyle.backgroundColor 
      ? `rgba(${hexToRgb(subtitleStyle.backgroundColor)}, ${subtitleStyle.backgroundOpacity || 0.8})`
      : 'transparent',
    padding: subtitleStyle.backgroundColor ? '6px 14px' : '0px',
    borderRadius: '8px',
    WebkitTextStroke: subtitleStyle.strokeWidth 
      ? `${subtitleStyle.strokeWidth}px ${subtitleStyle.strokeColor || '#000000'}`
      : 'none',
    textShadow: subtitleStyle.shadowOffset 
      ? `${subtitleStyle.shadowOffset}px ${subtitleStyle.shadowOffset}px ${subtitleStyle.shadowOffset * 2}px ${subtitleStyle.shadowColor || 'rgba(0,0,0,0.8)'}`
      : 'none',
    textTransform: subtitleStyle.uppercase ? 'uppercase' : 'none',
    letterSpacing: `${subtitleStyle.letterSpacing || 0}px`,
    fontWeight: subtitleStyle.fontWeight || 'bold',
    textAlign: 'center',
    maxWidth: '90%',
    lineHeight: 1.2
  };

  function hexToRgb(hex) {
    if (!hex) return '0, 0, 0';
    const c = hex.replace('#', '');
    const bigint = parseInt(c, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }

  const getPositionClass = () => {
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

  return (
    <div className="flex flex-col items-center bg-slate-950/80 rounded-2xl p-4 border border-slate-800 backdrop-blur-md shadow-2xl relative">
      {/* Top Preview Controls */}
      <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-400">1:1 Burn Export Preview</span>
          <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-mono text-[10px]">
            {aspectRatio} Vertical Default
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => onChangeAspectRatio('9:16')}
              className={`p-1.5 rounded ${aspectRatio === '9:16' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="9:16 Vertical (Shorts/Reels)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeAspectRatio('16:9')}
              className={`p-1.5 rounded ${aspectRatio === '16:9' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="16:9 Landscape (YouTube)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeAspectRatio('1:1')}
              className={`p-1.5 rounded ${aspectRatio === '1:1' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="1:1 Square"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowSafeArea(!showSafeArea)}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium transition ${
              showSafeArea 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Toggle Instagram/Shorts Safe Overlay"
          >
            {showSafeArea ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Safe Zone</span>
          </button>
        </div>
      </div>

      {/* Video Canvas Container Box */}
      <div className={`relative overflow-hidden bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center transition-all duration-300 shadow-inner ${aspectClasses[aspectRatio] || aspectClasses['9:16']}`}>
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            onTimeUpdate={() => {
              if (videoRef.current && isPlaying) {
                onSeek(videoRef.current.currentTime);
              }
            }}
            onEnded={onTogglePlay}
            playsInline
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 animate-pulse">
              <Smartphone className="w-8 h-8" />
            </div>
            <p className="text-xs text-slate-400 max-w-[200px]">
              Live Subtitle Preview Canvas
            </p>
          </div>
        )}

        {/* Instagram/Shorts Safe Zone Overlay */}
        {showSafeArea && aspectRatio === '9:16' && (
          <div className="absolute inset-0 border-2 border-dashed border-rose-500/30 pointer-events-none rounded-xl m-4 flex flex-col justify-between p-3">
            <div className="bg-rose-500/10 text-rose-300 text-[9px] font-mono self-center px-2 py-0.5 rounded border border-rose-500/20">
              Header Safe Bounds
            </div>
            <div className="bg-rose-500/10 text-rose-300 text-[9px] font-mono self-center px-2 py-0.5 rounded border border-rose-500/20">
              Instagram Safe Zone
            </div>
          </div>
        )}

        {/* Real-time Subtitle Overlay Canvas */}
        <div className={`absolute inset-x-0 p-4 flex justify-center pointer-events-none transition-all duration-150 ${getPositionClass()}`}>
          {activeCaptionText ? (
            <div style={subtitleInlineStyle} className="transition-all duration-150 transform hover:scale-105">
              {activeCaptionText}
            </div>
          ) : (
            <div className="text-slate-600 italic text-xs bg-slate-950/60 px-3 py-1 rounded-md border border-slate-800/40">
              (No active subtitle segment at {currentTime.toFixed(1)}s)
            </div>
          )}
        </div>
      </div>

      {/* Media Playback Controls */}
      <div className="w-full mt-4 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onSeek(0);
                if (videoRef.current) videoRef.current.currentTime = 0;
              }}
              className="p-1.5 text-slate-400 hover:text-white transition"
              title="Rewind to start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onTogglePlay}
              className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Audio Volume & Mute Controls */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg">
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
                className="w-14 accent-indigo-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
                title="Adjust Audio Volume"
              />
            </div>
          </div>
          <span>{formatTime(duration)}</span>
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
          className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
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
