import './globals.css';
import { CartProvider } from '../contexts/CartContext';
import { AgentProvider } from '../contexts/AgentContext';
import FloatingAgentButton from '../components/agent/FloatingAgentButton';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Walmart - Save Money. Live Better.',
  description: 'Shop online for electronics, home, groceries, and more at Walmart Clone.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AgentProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-grow">
                {children}
              </main>
            </div>
            <FloatingAgentButton />
          </CartProvider>
        </AgentProvider>
      </body>
    </html>
  );
}