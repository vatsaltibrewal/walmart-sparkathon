'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function FloatingAgentButton() {
  return (
    // Use Next.js Link for navigation instead of onClick
    <Link href="/agent" passHref>
      <motion.div
        className="fixed bottom-6 right-6 w-24 h-24 bg-transparent rounded-full flex items-center justify-center shadow-lg z-40 cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Use the Next.js Image component for optimized image loading */}
        <Image
          src="/images/blue-mascot.png"
          alt="Spark AI Assistant"
          fill // CHANGE: layout="fill" becomes the boolean prop 'fill'
          className="object-contain" // ADD/CHANGE: Use className for object-fit
        />
      </motion.div>
    </Link>
  );
}