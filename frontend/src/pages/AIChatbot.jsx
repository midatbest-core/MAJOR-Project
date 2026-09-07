import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  FileText, 
  Copy,
  ThumbsUp
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

  // Initialize with context if provided via navigation state
  useEffect(() => {
    if (location.state && location.state.context) {
      const ctx = location.state.context;
      setContextData(ctx);
      
      let contextMsg = "I notice you brought some context with you:\n\n";
      if (ctx.type === 'text-studio') {
        contextMsg += `**Summary:** ${ctx.summary}\n**Keywords:** ${ctx.keywords.join(', ')}\n\nWhat would you like me to do with this? (e.g., "Turn this into a Twitter thread" or "Give me 3 YouTube titles")`;
      } else if (ctx.type === 'creator-intelligence') {
        contextMsg += `**Video:** ${ctx.title}\n**Niche:** ${ctx.niche}\n\nWould you like me to analyze the pacing, or rewrite the hook based on this video?`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'context',
          role: 'assistant',
          content: contextMsg,
          timestamp: new Date().toISOString(),
          isContext: true
        }
      ]);
    }
  }, [location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await apiClient.post('/chat', {
        messages: [...messages, userMessage]
      });
      
      const aiResponse = res.data.data?.reply || res.data?.reply || "I couldn't generate a response.";
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      toast.error(err.response?.data?.errors?.[0]?.description || err.response?.data?.message || 'Failed to connect to AI');
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sorry, I ran into an error connecting to my brain. Please try again.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAttachTextStudio = () => {
    try {
      const data = localStorage.getItem('activeStudioProject');
      if (data) {
        const parsed = JSON.parse(data);
        const contextMsg = `I've attached Text Studio data:\n\n**Video/Script:** ${parsed.originalFileName}\n**Transcript Snippet:** ${parsed.fullText.substring(0, 300)}...\n\nWhat would you like me to do with this?`;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: contextMsg, timestamp: new Date().toISOString(), isContext: true }]);
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
        const contextMsg = `I've attached Creator Intelligence data:\n\n**Video Title:** ${parsed.metrics?.title}\n**Engagement Rate:** ${parsed.metrics?.engagementRate}%\n**Summary:** ${parsed.audienceIntelligence?.aiSummary}\n\nHow can I help you optimize based on this?`;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: contextMsg, timestamp: new Date().toISOString(), isContext: true }]);
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
              <div className="whitespace-pre-wrap text-sm leading-relaxed font-medium">
                {msg.content}
              </div>
              
              {msg.role === 'assistant' && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-3">
                  <button onClick={() => copyToClipboard(msg.content)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
                    <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                  </button>
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
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider shrink-0 mr-1">Suggestions:</span>
          {['Generate 3 YouTube Titles', 'Write a Twitter Thread', 'What are good hashtags?'].map((suggestion) => (
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
