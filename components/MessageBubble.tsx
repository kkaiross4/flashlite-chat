import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Bot, User, Cpu } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-emerald-500 text-white shadow-sm'
        }`}>
          {isUser ? <User size={18} /> : <Cpu size={18} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3.5 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-sm' 
              : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
          }`}>
             {isUser ? (
               <div className="whitespace-pre-wrap">{message.content}</div>
             ) : (
               <div className="markdown-content prose prose-sm prose-slate max-w-none dark:prose-invert">
                 <ReactMarkdown>{message.content}</ReactMarkdown>
               </div>
             )}
          </div>
          
          {/* Timestamp or Status */}
          <span className="text-xs text-slate-400 mt-1.5 px-1 select-none">
             {message.isStreaming ? (
               <span className="flex items-center gap-1 text-emerald-600 font-medium animate-pulse">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                 Generating...
               </span>
             ) : (
               new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
             )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
