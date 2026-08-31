/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessageToAgency } from '../services/geminiService';
import { ChatMessage } from '../types';

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm MO-Bot, your Transformation & Automation Specialist at Mo-Blind Solutions LLC. Ask me how our 7 core services and signature Blueprint™ help small and mid-sized businesses scale and modernize securely! ⚡️🤖" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpen);
    
    const checkHash = () => {
      if (window.location.hash === '#chatbot' || window.location.hash === '#chat') {
        setIsOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    
    return () => {
      window.removeEventListener('open-chatbot', handleOpen);
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Minor delay for virtual layout adjustment
    setTimeout(scrollToBottom, 100);

    const responseText = await sendMessageToAgency(input);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[90vw] md:w-96 bg-[#0D1321]/95 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl shadow-[#1AD1B5]/10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-4 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1AD1B5] animate-pulse" />
                <div>
                  <h3 className="font-heading font-bold text-sm text-white tracking-wider">MO-Bot</h3>
                  <p className="text-[10px] text-[#1AD1B5] font-mono uppercase">Agency Expert</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white" data-hover="true">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={chatContainerRef}
              className="h-64 md:h-80 overflow-y-auto p-4 space-y-3 scroll-smooth"
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ 
                    opacity: 0, 
                    y: 10, 
                    scale: 0.96, 
                    x: msg.role === 'user' ? 8 : -8 
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1, 
                    x: 0 
                  }}
                  transition={{ 
                    duration: 0.25, 
                    ease: [0.22, 1, 0.36, 1] 
                  }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#1AD1B5] text-black rounded-tr-none font-medium'
                        : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#1AD1B5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#1AD1B5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#1AD1B5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5 bg-slate-950/40">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about voice agents, custom CRMs..."
                  className="flex-1 bg-transparent text-white text-xs placeholder-white/30 text-sm focus:outline-none px-2"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-[#1AD1B5] text-black p-2 rounded-xl hover:bg-[#15bda3] transition-colors disabled:opacity-50"
                  data-hover="true"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-[#0A0D14] via-slate-950 to-[#0c1322] flex items-center justify-center shadow-lg shadow-[#1AD1B5]/25 border border-[#1AD1B5]/30 z-50 group"
        data-hover="true"
      >
        {isOpen ? (
          <X className="w-5 h-5 md:w-6 md:h-6 text-[#1AD1B5]" />
        ) : (
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-[#1AD1B5] group-hover:text-white transition-colors animate-pulse" />
        )}
      </motion.button>
    </div>
  );
};

export default AIChat;
