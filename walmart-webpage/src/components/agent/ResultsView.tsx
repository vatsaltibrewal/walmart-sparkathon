'use client';

import { useAgent } from '@/contexts/AgentContext';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import MarkdownRenderer from './MarkdownRenderer'; // Import our new component

export default function ResultsView({ onNewSearch }: { onNewSearch: () => void }) {
  const { recommendedProducts, messages, isLoading, isListening, startListening } = useAgent();
  const lastAgentMessage = messages.filter(m => m.role === 'model').pop();

  return (
    // Main container: Mobile-first (flex-col), desktop (md:flex-row)
    <div className="flex flex-col md:flex-row h-full w-full bg-white">

      {/* Left Column (Desktop) / Bottom Section (Mobile) */}
      <div className="w-full md:w-2/5 flex flex-col p-6 bg-gray-50 order-2 md:order-1">
        <div className="flex-shrink-0 flex items-center space-x-4 mb-4">
          <div className="relative w-20 h-20">
             <Image src="/images/yellow-mascot.png" alt="Spark AI Mascot" layout="fill" objectFit="contain" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Spark</h2>
            <p className="text-gray-500">Your Shopping Assistant</p>
          </div>
        </div>

        <div className="flex-grow my-4 text-gray-700 leading-relaxed overflow-y-auto">
          {lastAgentMessage && <MarkdownRenderer content={lastAgentMessage.content} />}
        </div>

        <div className="flex-shrink-0 flex items-center justify-between">
          <button onClick={onNewSearch} className="text-sm font-medium text-[#0071ce] hover:underline">
            Start New Search
          </button>
          <div className="relative w-16 h-16">
             <AnimatePresence>
                {isListening && (
                    <motion.div 
                        className="absolute inset-0 bg-red-500 rounded-full"
                        initial={{ scale: 0.5, opacity: 0.7 }} animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                )}
             </AnimatePresence>
             <button onClick={startListening} disabled={isLoading || isListening} className="relative w-full h-full rounded-full bg-[#0071ce] text-white flex items-center justify-center">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
             </button>
          </div>
        </div>
      </div>

      {/* Right Column (Desktop) / Top Section (Mobile) */}
      <div className="w-full md:w-3/5 flex flex-col p-6 order-1 md:order-2">
        <h3 className="font-bold text-xl text-gray-800 mb-4 flex-shrink-0">My Recommendations for You</h3>
        <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedProducts.map((product, index) => (
              <motion.div
                key={product.product_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/product/${product.product_id}`} legacyBehavior>
                  <a className="block bg-white rounded-lg border border-gray-200 p-4 text-center group hover:shadow-md transition-shadow">
                    <img src={product.main_image || '/images/placeholder.jpg'} alt={product.product_name} className="h-32 w-full object-contain mb-3" />
                    <p className="text-base font-semibold truncate text-gray-800 group-hover:text-[#0071ce]">{product.product_name}</p>
                    <p className="text-sm text-gray-600">${product.final_price}</p>
                    {product.model_3d_url && (
                      <span className="text-xs mt-2 inline-block bg-blue-100 text-[#0071ce] font-bold py-0.5 px-2 rounded-full">AR View</span>
                    )}
                  </a>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}