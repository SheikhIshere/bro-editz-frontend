"use client";

import React from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Home } from "lucide-react";

interface PageErrorProps {
  reset?: () => void;
}

/**
 * Full-page error UI for when the entire page crashes.
 * Used by error.tsx and global-error.tsx.
 */
const PageError: React.FC<PageErrorProps> = ({ reset }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-accent-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-accent-tertiary/8 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg"
      >
        {/* Animated Illustration */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <div className="w-36 h-36 relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-white/10"
            />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-tertiary/20 border border-white/10 flex items-center justify-center backdrop-blur-sm">
              <span className="text-5xl">🎬</span>
            </div>
          </div>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-black mb-5 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70">
          We&apos;ll be right back
        </h1>

        <p className="text-text-muted text-lg mb-12 leading-relaxed">
          We&apos;re experiencing a temporary issue. Please try refreshing the page, or come back in a moment.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {reset && (
            <button
              onClick={reset}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-accent-primary text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(0,148,200,0.3)]"
            >
              <RefreshCcw size={18} />
              Refresh Page
            </button>
          )}

          <a
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-full font-semibold border border-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Home size={18} />
            Go Home
          </a>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute bottom-10 text-white/15 text-xs font-bold tracking-[0.2em] uppercase"
      >
        BroEditz Video Agency
      </motion.p>
    </div>
  );
};

export default PageError;
