import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Combine, 
  Scissors, 
  Sparkles, 
  Copy, 
  Scale, 
  Check, 
  AlertCircle 
} from 'lucide-react';

/**
 * Caption List Component conforming to Chapter 7 Specs
 * Inline double-click text editing, split, merge, auto duration balance, and AI micro-assistant.
 */
const CaptionList = ({
  segments = [],
  activeSegIndex,
  onSelectSegment,
  onUpdateSegment,
  onAddSegment,
  onDeleteSegment,
  onMergeSubtitles,
  onSplitSubtitle,
  onDuplicateSegment,
  onAutoBalance
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [aiLoading, setAiLoading] = useState(null);

  const startInlineEdit = (seg) => {
    setEditingId(seg.id);
    setEditingText(seg.text);
  };

  const saveInlineEdit = (id) => {
    if (editingId) {
      onUpdateSegment(id, 'text', editingText);
      setEditingId(null);
    }
  };

  // Helper: AI Contextual Emoji Generator matching sentence topics & sentiment
  const getContextualAiEmojis = (text) => {
    if (!text || typeof text !== 'string') return '✨';
    const lower = text.toLowerCase();
    const emojis = [];

    const mappings = [
      { keywords: ['welcome', 'hello', 'hi', 'hey', 'intro', 'start', 'greet'], emojis: ['👋', '✨', '🎉'] },
      { keywords: ['video', 'studio', 'caption', 'subtitle', 'film', 'movie', 'record', 'watch', 'view'], emojis: ['🎬', '🎥', '📺'] },
      { keywords: ['style', 'design', 'custom', 'font', 'color', 'background', 'pretty', 'cool', 'art'], emojis: ['🎨', '💎', '✨'] },
      { keywords: ['create', 'make', 'build', 'render', 'generate', 'magic', 'ai', 'tech', 'code'], emojis: ['⚡', '🤖', '🚀'] },
      { keywords: ['fast', 'speed', 'quick', 'easy', 'instant', 'rapid', 'run', 'fly'], emojis: ['⚡', '🏃‍♂️', '💨'] },
      { keywords: ['money', 'cash', 'dollar', 'rich', 'profit', 'earn', 'sale', 'business', 'win', 'crypto'], emojis: ['💰', '💵', '📈'] },
      { keywords: ['love', 'like', 'great', 'awesome', 'best', 'fire', 'lit', 'amazing', 'perfect', 'good'], emojis: ['🔥', '❤️', '🌟'] },
      { keywords: ['warning', 'stop', 'error', 'danger', 'alert', 'important', 'notice', 'careful'], emojis: ['⚠️', '🚨', '❗'] },
      { keywords: ['question', 'why', 'what', 'how', 'think', 'idea', 'mind', 'wonder'], emojis: ['💡', '❓', '🤔'] },
      { keywords: ['time', 'clock', 'wait', 'now', 'today', 'future', 'hour'], emojis: ['⏳', '⏱️', '📅'] },
      { keywords: ['music', 'sound', 'audio', 'song', 'listen', 'speak', 'voice', 'hear'], emojis: ['🎧', '🎵', '🎙️'] },
      { keywords: ['winner', 'victory', 'trophy', 'top', 'king', 'queen', 'champ'], emojis: ['🏆', '🥇', '👑'] }
    ];

    for (const map of mappings) {
      if (map.keywords.some(k => lower.includes(k))) {
        emojis.push(...map.emojis);
      }
    }

    if (emojis.length === 0) {
      if (lower.length > 30) emojis.push('✨', '🚀');
      else emojis.push('🔥', '💡');
    }

    const unique = [...new Set(emojis)];
    return unique.slice(0, 2).join(' ');
  };

  // AI Micro-Assistant Action Handlers (local micro-generators)
  const handleAiTransform = (index, action) => {
    setAiLoading(`${index}-${action}`);
    const seg = segments[index];
    let newText = seg.text || '';

    setTimeout(() => {
      switch (action) {
        case 'uppercase':
          newText = newText.toUpperCase();
          break;
        case 'emojis':
          // Clean existing trailing emojis before appending fresh contextual AI emojis
          const cleanText = newText.replace(/[\u1F600-\u1F64F\u1F300-\u1F5FF\u1F680-\u1F6FF\u1F700-\u1F77F\u2600-\u26FF\u2700-\u27BF]/g, '').trim();
          const contextualEmojis = getContextualAiEmojis(cleanText);
          newText = `${cleanText} ${contextualEmojis}`.trim();
          break;
        case 'punchier':
          newText = newText.replace(/very /gi, '').replace(/really /gi, '').replace(/basically /gi, '');
          break;
        case 'shorten':
          const words = newText.split(' ');
          newText = words.slice(0, Math.ceil(words.length * 0.75)).join(' ');
          break;
        case 'genz':
          newText = `No cap, ${newText.toLowerCase()} FR!`;
          break;
        case 'grammar':
        default:
          newText = newText.charAt(0).toUpperCase() + newText.slice(1);
          if (!/[.!?]$/.test(newText)) newText += '.';
          break;
      }

      onUpdateSegment(seg.id, 'text', newText);
      setAiLoading(null);
    }, 300);
  };

  return (
    <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 backdrop-blur-md shadow-2xl flex flex-col h-full">
      {/* Header Actions */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200 text-xs">Caption Segments</span>
          <span className="bg-indigo-500/20 text-indigo-400 font-mono text-[10px] px-2 py-0.5 rounded-full">
            {segments.length} Items
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto Balance Button */}
          <button
            onClick={onAutoBalance}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Auto balance subtitle durations evenly"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto Balance</span>
          </button>

          {/* Add Caption Button */}
          <button
            onClick={onAddSegment}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Segment</span>
          </button>
        </div>
      </div>

      {/* Segments Scrollable List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[500px]">
        {segments.map((seg, idx) => {
          const isActive = idx === activeSegIndex;
          const wordCount = (seg.text || '').trim().split(/\s+/).filter(Boolean).length;
          const duration = Math.max(0.5, seg.end - seg.start);
          const wpm = Math.round((wordCount / duration) * 60);

          return (
            <div
              key={seg.id || `seg_${idx}`}
              onClick={() => onSelectSegment(idx)}
              className={`p-3 rounded-xl border transition-all duration-150 flex flex-col gap-2 ${
                isActive
                  ? 'bg-slate-900 border-indigo-500/80 ring-1 ring-indigo-500/40 shadow-lg'
                  : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80'
              }`}
            >
              {/* Timing Controls Header */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-300">#{idx + 1}</span>
                  <input
                    type="number"
                    step="0.1"
                    value={seg.start}
                    onChange={(e) => onUpdateSegment(seg.id, 'start', parseFloat(e.target.value) || 0)}
                    className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center text-slate-200"
                  />
                  <span>→</span>
                  <input
                    type="number"
                    step="0.1"
                    value={seg.end}
                    onChange={(e) => onUpdateSegment(seg.id, 'end', parseFloat(e.target.value) || 0)}
                    className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center text-slate-200"
                  />
                  <span className="text-[10px] text-slate-500">({duration.toFixed(1)}s)</span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Split Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onSplitSubtitle(idx); }}
                    className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                    title="Split caption in half (or press Enter when editing)"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                  </button>

                  {/* Merge Button */}
                  {idx < segments.length - 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onMergeSubtitles(idx); }}
                      className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                      title="Merge with next caption"
                    >
                      <Combine className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Duplicate Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicateSegment(idx); }}
                    className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                    title="Duplicate segment"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteSegment(seg.id); }}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Delete segment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline Editable Text Area */}
              {editingId === seg.id ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <textarea
                    rows={2}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={() => saveInlineEdit(seg.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        saveInlineEdit(seg.id);
                      }
                    }}
                    className="w-full bg-slate-950 border border-indigo-500 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button
                    onClick={() => saveInlineEdit(seg.id)}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDoubleClick={() => startInlineEdit(seg)}
                  className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 cursor-text hover:border-slate-700 transition"
                  title="Double click to edit subtitle text"
                >
                  {seg.text || <span className="italic text-slate-500">Double click to add subtitle text...</span>}
                </div>
              )}

              {/* Quick AI Micro-Assistant Actions */}
              {isActive && (
                <div className="flex items-center flex-wrap gap-1.5 pt-1 border-t border-slate-800/60 text-[10px]">
                  <span className="text-slate-500 flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3 h-3 text-indigo-400" /> AI Quick Fix:
                  </span>
                  
                  <button
                    onClick={() => handleAiTransform(idx, 'grammar')}
                    className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
                  >
                    ✨ Grammar
                  </button>

                  <button
                    onClick={() => handleAiTransform(idx, 'punchier')}
                    className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
                  >
                    💥 Punchier
                  </button>

                  <button
                    onClick={() => handleAiTransform(idx, 'emojis')}
                    className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
                  >
                    🔥 Emojis
                  </button>

                  <button
                    onClick={() => handleAiTransform(idx, 'uppercase')}
                    className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
                  >
                    🔤 UPPER
                  </button>

                  <button
                    onClick={() => handleAiTransform(idx, 'genz')}
                    className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
                  >
                    ⚡ Gen Z
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaptionList;
