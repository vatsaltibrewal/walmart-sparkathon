'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GreetingView from './GreetingView';
import ResultsView from './ResultsView';
import { AnimatePresence, motion } from 'framer-motion';

type ViewState = 'greeting' | 'results';

export default function AgentExperience() {
  const [view, setView] = useState<ViewState>('greeting');
  const router = useRouter();

  const handleResultsFound = () => {
    setView('results');
  };

  const handleNewSearch = () => {
    setView('greeting');
  };

  return (
    // This is now the main container for the page, designed to be full-screen.
    <div className="w-screen h-screen bg-white flex flex-col items-center justify-center relative">      
      
      {/* This container ensures the content is centered and sized correctly */}
      <div className="w-full max-w-7xl h-full mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="h-full w-full"
          >
            {view === 'greeting' ? (
              <GreetingView onResultsFound={handleResultsFound} />
            ) : (
              <ResultsView onNewSearch={handleNewSearch} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}