'use client';

import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export function AgentTypingIndicator() {
  return (
    <div className="flex gap-3 px-4">
      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-purple-500" />
      </div>
      <div className="bg-white/40 dark:bg-white/10 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-gray-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
