"use client";

import React from "react";
import { motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";

interface ErrorFallbackProps {
  reset?: () => void;
}

/**
 * Compact, inline fallback for individual sections (used by ErrorBoundary).
 * Appears in-place when a single component like Hero or Services fails,
 * while the rest of the page remains fully functional.
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ reset }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <p className="text-text-muted text-base mb-6">
        This section couldn&apos;t load right now.
      </p>

      {reset && (
        <button
          onClick={reset}
          className="flex items-center gap-2 text-sm text-accent-secondary hover:text-white font-semibold transition-colors"
        >
          <RefreshCcw size={14} />
          Retry
        </button>
      )}
    </motion.div>
  );
};

export default ErrorFallback;
