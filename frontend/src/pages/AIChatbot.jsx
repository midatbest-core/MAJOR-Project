import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../services/apiClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  FileText, 
  Copy,
  ThumbsUp,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const AIChatbot = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi there! I'm your Creator Intelligence Co-Pilot. I can help you optimize your content, generate viral hooks, or write platform-specific posts. How can I help today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [contextData, setContextData] = useState(null);
  
  const messagesEndRef = useRef(null);
  const contextInitializedRef = useRef(false);

  // Initialize with context if provided via navigation state (prevent duplicate prints)
  useEffect(() => {
    if (location.state && location.state.context && !contextInitializedRef.current) {
      contextInitializedRef.current = true;
      const ctx = location.state.context;
      setContextData(ctx);
      
      let contextMsg = "I notice you brought some context with you:\n\n";
      if (ctx.type === 'text-studio') {
        const kw = Array.isArray(ctx.keywords) ? ctx.keywords.join(', ') : '';
        contextMsg += `**Summary:** ${ctx.summary || 'Transcript summary ready'}\n**Keywords:** ${kw || 'N/A'}\n\nWhat would you like me to do with this? (e.g., "Give me 5 viral YouTube titles" or "Rewrite the opening hook")`;
      } else if (ctx.type === 'creator-intelligence') {
        contextMsg += `**Video:** ${ctx.title || 'Creator Video'}\n**Niche:** ${ctx.niche || 'General'}\n\nWould you like me to analyze the pacing, or rewrite the hook based on this video?`;
      }

      setMessages(prev => {
        if (prev.some(m => m.isContext)) return prev;
        return [
          ...prev,
          {
            id: 'context_init',
            role: 'assistant',
            content: contextMsg,
            timestamp: new Date().toISOString(),
            isContext: true
          }
        ];
      });
    }
  }, [location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (textToSend) => {
    if (!textToSend || !textToSend.trim() || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await apiClient.post('/chat', {
        messages: newMessages
      });
      
      const aiResponse = res.data.data?.reply || res.data?.reply || "I couldn't generate a response.";
      const isFallback = res.data.data?.isFallback || false;
      const provider = res.data.data?.provider || '';
      const model = res.data.data?.model || '';
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          isFallback,
          provider,
          model,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg = err.response?.data?.errors?.[0]?.description || err.response?.data?.message || 'Failed to connect to AI';
      toast.error(errMsg);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sorry, I ran into a temporary connection issue. Please click Retry below to try again.",
          isError: true,
          retryContent: textToSend.trim(),
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    sendMessage(input);
  };

  const handleAttachTextStudio = () => {
    try {
      const data = localStorage.getItem('activeStudioProject');
      if (data) {
        const parsed = JSON.parse(data);
        const snippet = parsed.fullText ? parsed.fullText.substring(0, 300) : '';
        const contextMsg = `I've attached Text Studio data:\n\n**Video/Script:** ${parsed.originalFileName || 'Current Project'}\n**Transcript Snippet:** ${snippet}...\n\nWhat would you like me to do with this?`;
        
        setMessages(prev => {
          const filtered = prev.filter(m => !m.isContext);
          return [
            ...filtered,
            { id: `context_${Date.now()}`, role: 'assistant', content: contextMsg, timestamp: new Date().toISOString(), isContext: true }
          ];
        });
        setContextData({ type: 'text-studio' });
        toast.success('Text Studio Context Attached');
      } else {
        toast.error('No recent Text Studio data found.');
      }
    } catch(e) {
      toast.error('Error loading Text Studio data');
    }
  };

  const handleAttachCreatorIntel = () => {
    try {
      const data = localStorage.getItem('latestCreatorIntelligence');
      if (data) {
        const parsed = JSON.parse(data);
        const contextMsg = `I've attached Creator Intelligence data:\n\n**Video Title:** ${parsed.metrics?.title || 'YouTube Video'}\n**Engagement Rate:** ${parsed.metrics?.engagementRate || 0}%\n**Summary:** ${parsed.audienceIntelligence?.aiSummary || 'Analytics ready'}\n\nHow can I help you optimize based on this?`;
        
        setMessages(prev => {
          const filtered = prev.filter(m => !m.isContext);
          return [
            ...filtered,
            { id: `context_${Date.now()}`, role: 'assistant', content: contextMsg, timestamp: new Date().toISOString(), isContext: true }
          ];
        });
        setContextData({ type: 'creator-intelligence' });
        toast.success('Creator Intelligence Context Attached');
      } else {
        toast.error('No recent Creator Intelligence data found.');
      }
    } catch(e) {
      toast.error('Error loading Creator Intelligence data');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 p-4 md:p-6 pb-0">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">AI Optimizer Co-Pilot</h1>
            <p className="text-xs text-slate-400 font-medium">Powered by local context & generative AI</p>
          </div>
        </div>
        {contextData && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
            <FileText className="w-3.5 h-3.5" />
            <span>Active Context: {contextData.type === 'text-studio' ? 'Text Studio Analytics' : 'YouTube Analysis'}</span>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-6 pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700/50">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
            )}
            
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-tr-sm shadow-md shadow-orange-500/10' 
                : msg.isContext 
                  ? 'bg-slate-900/80 border border-slate-700/50 text-slate-200 rounded-tl-sm'
                  : 'bg-slate-800 border border-slate-700/50 text-slate-200 rounded-tl-sm'
            }`}>
              {msg.role === 'user' ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed font-medium">
                  {msg.content}
                </div>
              ) : (
                <div className="text-sm leading-relaxed font-normal text-slate-200">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-3 rounded-xl border border-slate-700/80 bg-slate-900/90 shadow-lg">
                          <table className="min-w-full divide-y divide-slate-700/80 text-left text-xs" {...props} />
                        </div>
                      ),
                      thead: ({ node, ...props }) => <thead className="bg-slate-800/90 text-indigo-300 font-bold uppercase tracking-wider text-[11px]" {...props} />,
                      tbody: ({ node, ...props }) => <tbody className="divide-y divide-slate-800/70" {...props} />,
                      tr: ({ node, ...props }) => <tr className="hover:bg-slate-800/50 transition-colors" {...props} />,
                      th: ({ node, ...props }) => <th className="px-3.5 py-2.5 font-semibold text-white" {...props} />,
                      td: ({ node, ...props }) => <td className="px-3.5 py-2.5 leading-relaxed align-top text-slate-300" {...props} />,
                      h1: ({ node, ...props }) => <h1 className="text-base font-bold text-white mt-4 mb-2 border-b border-slate-700/50 pb-1" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-sm font-bold text-indigo-300 mt-3 mb-1.5 flex items-center gap-1.5" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mt-3 mb-1" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1 text-slate-300" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1 text-slate-300" {...props} />,
                      li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                      p: ({ node, ...props }) => <p className="my-1.5 leading-relaxed" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                      code: ({ node, inline, ...props }) => inline ? (
                        <code className="bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-700/50" {...props} />
                      ) : (
                        <code className="block bg-slate-900 text-slate-200 p-3 rounded-xl text-xs font-mono overflow-x-auto my-2 border border-slate-800" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-2 border-indigo-500 pl-3 italic text-slate-400 my-2" {...props} />
                      ),
                      hr: ({ node, ...props }) => <hr className="border-slate-700/60 my-3" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
              
              {msg.role === 'assistant' && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-3">
                  {msg.isError ? (
                    <button 
                      onClick={() => sendMessage(msg.retryContent)} 
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 text-xs text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-semibold transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retry Request
                    </button>
                  ) : (
                    <>
                      <button onClick={() => copyToClipboard(msg.content)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
                        <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                      </button>
                      {msg.model ? (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ml-auto flex items-center gap-1 font-semibold ${
                          msg.provider === 'OpenAI' 
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                            : msg.provider === 'Groq'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        }`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          {msg.model}
                        </span>
                      ) : msg.isFallback ? (
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700/50 font-mono ml-auto">
                          ⚡ Co-Pilot Intelligence
                        </span>
                      ) : null}
                    </>
                  )}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/30">
                <User className="w-4 h-4 text-orange-400" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700/50">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-4 pb-6 bg-slate-950">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to optimize, write hooks, or generate ideas..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-4 pr-14 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-lg"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg flex items-center justify-center transition shadow-md disabled:shadow-none"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-none items-center">
          {[
            '5 High-CTR YouTube Titles',
            'First-5s Retention Hook',
            'Shorts / Reels Pacing Script',
            'Thumbnail + Title A/B Angles'
          ].map((suggestion) => (
            <button 
              key={suggestion}
              type="button"
              onClick={() => setInput(suggestion)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              {suggestion}
            </button>
          ))}
          <div className="w-px h-4 bg-slate-800 mx-1 shrink-0"></div>
          <button onClick={handleAttachTextStudio} type="button" className="shrink-0 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-400 hover:bg-indigo-500/20 transition flex items-center gap-1.5">
            <FileText className="w-3 h-3" /> Attach Text Studio
          </button>
          <button onClick={handleAttachCreatorIntel} type="button" className="shrink-0 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Attach Creator Intel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
