"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";
import { HeroContent } from "./types";

interface HeroContentEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: HeroContent | null;
    onSave: (id?: number, data?: Partial<HeroContent>) => void;
    showNotification: (type: 'success' | 'error', message: string) => void;
}

export default function HeroContentEditModal({
    isOpen,
    onClose,
    content,
    onSave,
    showNotification
}: HeroContentEditModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        is_active: false
    });

    useEffect(() => {
        if (content) {
            setFormData({
                title: content.title || '',
                subtitle: content.subtitle || '',
                description: content.description || '',
                is_active: content.is_active || false
            });
        } else {
            setFormData({
                title: '',
                subtitle: '',
                description: '',
                is_active: false
            });
        }
    }, [content, isOpen]);

    const handleSubmit = () => {
        if (!formData.title.trim()) {
            showNotification('error', 'Title is required');
            return;
        }

        onSave(content?.id, formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-background border border-white/10 rounded-[2rem] p-4 md:p-8 max-w-2xl w-full max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6 py-2">
                        <h3 className="text-xl md:text-2xl font-bold text-white">
                            {content ? 'Edit Hero Iteration' : 'Add Hero Iteration'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Headline</label>
                            <textarea
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-primary transition-colors resize-none"
                                rows={3}
                                placeholder="Enter headline..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Subheadline</label>
                            <textarea
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-primary transition-colors resize-none"
                                rows={2}
                                placeholder="Enter subheadline..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-primary transition-colors resize-none"
                                rows={4}
                                placeholder="Enter description..."
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-accent-primary focus:ring-accent-primary"
                                />
                                Active (Only one can be active)
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 py-4 border-t border-white/5">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent-primary text-white hover:bg-accent-primary/80 transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-accent-primary/20"
                        >
                            <Save size={18} />
                            Save Iteration
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
