"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Shield, Cookie, BookOpen } from "lucide-react";

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string | null;
  type: "privacy" | "terms" | "cookie" | "guidelines";
}

const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, title, content, type }) => {
  const getIcon = () => {
    switch (type) {
      case "privacy":
        return <Shield size={24} className="text-accent-primary" />;
      case "terms":
        return <BookOpen size={24} className="text-accent-primary" />;
      case "cookie":
        return <Cookie size={24} className="text-accent-primary" />;
      case "guidelines":
        return <FileText size={24} className="text-accent-primary" />;
      default:
        return <FileText size={24} className="text-accent-primary" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-3xl max-h-[80vh] bg-background border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/2">
              <div className="flex items-center gap-3">
                {getIcon()}
                <h2 className="text-xl font-bold text-white">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {content && content.trim() ? (
                <div className="prose prose-invert max-w-none">
                  <div className="text-text-muted leading-relaxed whitespace-pre-wrap">
                    {content}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    {getIcon()}
                  </div>
                  <p className="text-text-muted text-sm">
                    This {title.toLowerCase()} is being updated. Content will be available soon.
                  </p>
                  <p className="text-text-muted/60 text-xs mt-2">
                    Please check back later for the complete {title.toLowerCase()} information.
                  </p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/2">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-accent-primary text-white text-sm font-bold hover:bg-accent-primary/80 transition-all rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PolicyModal;
