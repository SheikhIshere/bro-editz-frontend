"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Upload, Video, Youtube } from "lucide-react";
import { VideoItem } from "./types";
import { getMediaUrl } from "@/lib/admin-auth/utils";


interface VideoEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    video: VideoItem | null;
    onSave: (id?: string | number, data?: any) => void;
    showNotification: (type: 'success' | 'error', message: string) => void;
}

export default function VideoEditModal({
    isOpen,
    onClose,
    video,
    onSave,
    showNotification
}: VideoEditModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        youtube_url: '',
        is_active: false,
        thumbnail: null as File | null
    });


    useEffect(() => {
        if (video) {
            setFormData({
                title: video.title,
                youtube_url: video.youtube_url,
                is_active: video.is_active,
                thumbnail: null
            });

        } else {
            setFormData({
                title: '',
                youtube_url: '',
                is_active: false,
                thumbnail: null
            });

        }
    }, [video, isOpen]);

    const handleSubmit = () => {
        if (!formData.title.trim()) {
            showNotification('error', 'Title is required');
            return;
        }
        if (!formData.youtube_url.trim()) {
            showNotification('error', 'YouTube URL is required');
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('youtube_url', formData.youtube_url);
        data.append('is_active', formData.is_active.toString());
        if (formData.thumbnail) {
            data.append('thumbnail', formData.thumbnail);
        }


        onSave(video?.id, data);
        onClose();
    };

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = getYoutubeId(formData.youtube_url);

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
                            {video ? 'Edit Hero Video' : 'Add Hero Video'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Video Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent-primary transition-colors"
                                placeholder="Enter video title..."
                            />
                        </div>

                        {/* YouTube URL */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                YouTube URL
                            </label>
                            <div className="relative">
                                <Youtube size={18} className="absolute left-4 top-3.5 text-white/40" />
                                <input
                                    type="text"
                                    value={formData.youtube_url}
                                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent-primary transition-colors"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>
                            
                            {/* Live Preview */}
                            {youtubeId && (
                                <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-white/10 relative group">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${youtubeId}`}
                                        className="w-full h-full"
                                        allowFullScreen
                                    />
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                                        LINK VALID
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-accent-primary focus:ring-accent-primary"
                                />
                                Active
                            </label>
                            <span className="text-[10px] text-white/40">(Only one active video is shown)</span>
                        </div>


                        {/* Thumbnail Upload */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Fallback Thumbnail (optional)
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })}
                                    className="hidden"
                                    id="thumbnail-upload"
                                />
                                <label
                                    htmlFor="thumbnail-upload"
                                    className="flex items-center gap-3 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                >
                                    <Upload size={20} />
                                    <span className="flex-1 truncate">
                                        {formData.thumbnail ? formData.thumbnail.name : 'Choose thumbnail image...'}
                                    </span>
                                </label>
                                {formData.thumbnail && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <img
                                            src={URL.createObjectURL(formData.thumbnail)}
                                            alt="Thumbnail preview"
                                            className="w-16 h-12 rounded object-cover"
                                        />
                                        <span className="text-xs text-white/60">Local preview</span>
                                    </div>
                                )}
                                {!formData.thumbnail && video?.thumbnail && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <img
                                            src={getMediaUrl(video.thumbnail)}
                                            alt="Current thumbnail"
                                            className="w-16 h-12 rounded object-cover"
                                        />

                                        <span className="text-xs text-white/60">Current thumbnail</span>
                                    </div>
                                )}
                            </div>
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
                            {video ? 'Save Changes' : 'Create Video'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
