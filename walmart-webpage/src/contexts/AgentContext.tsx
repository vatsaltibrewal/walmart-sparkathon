'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import axios from 'axios';

// --- Type Definitions ---
interface Product {
  product_id: number;
  product_name: string;
  brand: string;
  final_price: number;
  rating: number;
  category_name: string;
  main_image?: string;
  model_3d_url?: string;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface AgentContextType {
  messages: Message[];
  recommendedProducts: Product[];
  isLoading: boolean;
  isListening: boolean;
  sendMessage: (messageText: string, onSuccessWithProducts?: () => void) => void;
  startListening: () => void;
}

// --- Context Creation ---
const AgentContext = createContext<AgentContextType | undefined>(undefined);

// --- Provider Component ---
export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Hi! I am Spark. How can I help you find the perfect product today?' }
  ]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

    const speak = (text: string) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
        }
    };
    
    const sendMessage = async (messageText: string, onSuccessWithProducts?: () => void) => {
    // This function is now correct from our last fix.
    if (!messageText.trim()) return;
    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setRecommendedProducts([]);
    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_AGENT_API_URL!, { message: messageText, userId: 'walmart-demo-user-123' });
      const { reply, data } = response.data;
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
      speak(reply);
      if (data && data.length > 0) {
        setRecommendedProducts(data);
        onSuccessWithProducts?.();
      }
    } catch (error) {
      console.error("Agent API Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I had trouble connecting. Please ensure the agent server is running." }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // This useEffect is now correct from our last fix.
    if (typeof window === 'undefined' || !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => { console.error("Speech recognition error:", event.error); setIsListening(false); };
    recognition.onresult = (event: any) => { sendMessage(event.results[0][0].transcript, () => document.getElementById('agent-experience')?.focus()); };
    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []); // Empty array ensures it runs once.

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const value = { messages, recommendedProducts, isLoading, isListening, sendMessage, startListening };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) throw new Error('useAgent must be used within an AgentProvider');
  return context;
};