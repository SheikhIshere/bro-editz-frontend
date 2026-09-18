"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-accent-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-accent-secondary/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm text-accent-primary">
          <Search size={48} strokeWidth={1.5} />
        </div>

        <h1 className="text-7xl md:text-9xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#023E8A] via-[#49CADF] to-[#023E8A]">
          404
        </h1>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
          Page Not Found
        </h2>
        
        <p className="text-text-muted text-lg mb-12 max-w-lg mx-auto leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button
            onClick={() => window.history.back()}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold border border-white/10 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          
          <Link
            href="/"
            className="w-full md:w-auto flex items-center justify-center gap-2 btn-primary"
          >
            <Home size={20} />
            Back to Home
          </Link>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 left-0 right-0 text-center"
      >
        <p className="text-white/20 text-sm font-bold tracking-[0.2em] uppercase">
          BROEDITZ VIDEO AGENCY
        </p>
      </motion.div>
    </div>
  );
}
