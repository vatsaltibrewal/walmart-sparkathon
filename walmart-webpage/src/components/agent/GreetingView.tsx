'use client';

import { useState, useEffect, useRef } from 'react';
import { useAgent } from '../../contexts/AgentContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import MarkdownRenderer from './MarkdownRenderer'; // Assuming you have this component

const TypingIndicator = () => (
    <div className="flex items-center space-x-1.5 p-3 bg-gray-200 rounded-full w-fit">
      <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, delay: 0.4, repeat: Infinity, ease: "easeInOut" }} />
    </div>
);


export default function GreetingView({ onResultsFound }: { onResultsFound: () => void }) {
  const { messages, sendMessage, isLoading, isListening, startListening } = useAgent();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine if the conversation has started beyond the initial greeting
  const hasChatStarted = messages.length > 1;

  // Auto-scroll to the latest message
  useEffect(() => {
    if (hasChatStarted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, hasChatStarted]);

  const handleSendMessage = () => {
    if (!input.trim() && !isListening) return;
    sendMessage(input, onResultsFound);
    setInput('');
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleVoiceSearch = () => {
    startListening();
  };

  // --- Initial Greeting UI ---
  if (!hasChatStarted) {
    return (
      <div className="flex flex-col items-center justify-between h-full p-8 text-center bg-gray-50">
        <div/> {/* Spacer */}
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
        >
          <div className="relative w-40 h-40 mx-auto">
              <Image 
                  src="/images/yellow-mascot.png"
                  alt="Spark AI Mascot" 
                  fill
                  className="object-contain"
                  priority // Load this image first
              />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mt-6">Hi, I'm Spark!</h1>
          <p className="text-lg text-gray-500 mt-2">What can I help you find today?</p>
        </motion.div>

        {isLoading ? <TypingIndicator /> : (
          <div className="w-full">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <AnimatePresence>
                {isListening && (
                  <motion.div 
                    className="absolute inset-0 bg-[#0071ce] rounded-full"
                    initial={{ scale: 0.5, opacity: 0.7 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </AnimatePresence>
              <button onClick={handleVoiceSearch} className="relative w-full h-full rounded-full bg-[#0071ce] text-white flex items-center justify-center shadow-md">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="w-full flex items-center space-x-2">
              <input
                type="text"
                className="flex-1 w-full border-gray-300 rounded-full py-3 px-5 focus:ring-2 focus:ring-[#ffc120] focus:border-transparent transition"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Or write here..."
              />
               <button type="submit" className="p-3 rounded-full bg-[#0071ce] text-white hover:bg-blue-700 shadow-sm transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
               </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // --- Conversation UI (after the first message is sent) ---
  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-gray-50">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.slice(1).map((msg, index) => ( // Slice(1) to skip the initial "Hi I'm Spark"
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`py-2 px-4 rounded-2xl max-w-[85%] text-left shadow-sm ${msg.role === 'user' ? 'bg-[#0071ce] text-white' : 'bg-white text-gray-800'}`}>
              <MarkdownRenderer content={msg.content} />
            </div>
          </motion.div>
        ))}
        {isLoading && <div className="flex justify-start"><TypingIndicator /></div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="pt-4 mt-2 border-t">
        <form onSubmit={handleFormSubmit} className="w-full flex items-center space-x-2">
          <input
            type="text"
            className="flex-1 w-full border-gray-300 rounded-full py-3 px-5 focus:ring-2 focus:ring-[#ffc120] focus:border-transparent transition"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up or write here..."
            disabled={isLoading}
          />
          <button type="button" onClick={handleVoiceSearch} disabled={isLoading || isListening} className={`p-3 rounded-full text-white shadow-sm transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-[#0071ce] hover:bg-blue-700'}`}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}