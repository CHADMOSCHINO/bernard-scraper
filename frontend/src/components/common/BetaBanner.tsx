import { X } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function BetaBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="relative z-50 bg-gradient-to-r from-blue-900 via-slate-900 to-blue-900 border-b border-border/20 text-center text-xs font-medium text-slate-300 overflow-hidden"
            >
                <div className="py-2 px-4 flex items-center justify-center gap-2 relative">
                    <span>
                        <span className="text-cyan-400 font-bold mr-2">BETA ACCESS</span>
                        Bernard v1.1 is currently free for early adopters.
                    </span>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
