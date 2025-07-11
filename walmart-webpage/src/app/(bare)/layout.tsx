import React from 'react';
import { AgentProvider } from '@/contexts/AgentContext';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AgentProvider>
      <div className="w-full h-full">
        <main>{children}</main>
      </div>
    </AgentProvider>
  );
}
