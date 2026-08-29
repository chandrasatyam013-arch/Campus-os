import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, AlertCircle, User } from 'lucide-react';
import { api } from '../lib/api';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AIChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! How can I help you with your academics today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const history = [...messages];
    
    setMessages([...history, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Exclude the initial greeting from history sent to the model to save tokens, 
      // or send it all if preferred. We'll send it all.
      const response = await api.sendAIMessage(userMessage.content, history.filter(m => m.role !== 'system'));
      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
    } catch (err: any) {
      console.error('[CHAT ERROR]', err);
      // If error, leave the user message and show error message
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message || 'Something went wrong.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 mb-4 pt-safe shrink-0">
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">AI Assistant</h1>
          <p className="text-xs text-gray-500 mt-0.5">Your personal academic intelligence copilot</p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-200/60 rounded-2xl md:rounded-[32px] overflow-hidden flex flex-col shadow-sm min-h-0">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === 'user' 
                  ? 'bg-black text-white rounded-tr-sm' 
                  : msg.content.startsWith('Error:')
                    ? 'bg-red-50 text-red-900 rounded-tl-sm border border-red-100'
                    : 'bg-gray-100/80 text-gray-900 rounded-tl-sm'
              }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-100/80 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-end gap-2 max-w-3xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about your attendance, grades, or schedule..."
              className="w-full bg-gray-50 border-0 rounded-2xl px-4 py-3.5 pr-12 text-sm focus:ring-1 focus:ring-black resize-none min-h-[52px] max-h-[120px]"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-gray-800"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">AI can make mistakes. Verify important academic information.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
