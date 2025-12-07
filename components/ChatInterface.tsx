import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Zap, Loader2, Eraser } from 'lucide-react';
import { Message } from '../types';
import { geminiService } from '../services/geminiService';
import MessageBubble from './MessageBubble';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userText = inputValue.trim();
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Create placeholder for AI response
      const aiMessageId = (Date.now() + 1).toString();
      const initialAiMessage: Message = {
        id: aiMessageId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages(prev => [...prev, initialAiMessage]);

      let fullResponse = "";
      
      // Stream response
      for await (const chunk of geminiService.sendMessageStream(userText)) {
        fullResponse += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: fullResponse } 
              : msg
          )
        );
      }

      // Finalize message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: "I'm having trouble connecting right now. Please check your network or API key.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = useCallback(() => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
      geminiService.resetChat();
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
            <Zap size={24} fill="currentColor" className="animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Flash Lite Chat</h1>
            <p className="text-xs text-slate-500 font-medium">Powered by gemini-2.5-flash-lite</p>
          </div>
        </div>
        <button 
          onClick={handleClearChat}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          title="Clear Chat"
        >
          <Eraser size={20} />
        </button>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto min-h-full flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 max-w-sm">
                <Zap size={48} className="mx-auto text-emerald-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Super Fast Responses</h3>
                <p className="text-sm text-slate-500">
                  Experience low-latency interactions with the new Flash Lite model. Ask anything!
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none p-4 bg-white/80 backdrop-blur-md border-t border-slate-200">
        <div className="max-w-3xl mx-auto relative">
          <div className="flex items-end gap-2 bg-white border border-slate-300 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 max-h-[120px] min-h-[24px] bg-transparent border-none focus:ring-0 resize-none py-3 px-3 text-slate-800 placeholder:text-slate-400 leading-relaxed"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className={`p-3 rounded-xl flex-shrink-0 transition-all duration-200 ${
                inputValue.trim() && !isProcessing
                  ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600 hover:scale-105 active:scale-95'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          <div className="text-center mt-2">
             <p className="text-[10px] text-slate-400">
               Gemini can make mistakes. Check important info.
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;
