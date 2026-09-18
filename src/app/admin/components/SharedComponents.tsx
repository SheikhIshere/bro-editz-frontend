"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { DeleteModal, Notification, VideoPlayerModal } from "./types";

interface DeleteModalProps {
    deleteModal: DeleteModal;
    setDeleteModal: (modal: DeleteModal) => void;
    onConfirm: () => void;
}

export function DeleteConfirmationModal({ deleteModal, setDeleteModal, onConfirm }: DeleteModalProps) {
    return (
        <AnimatePresence>
            {deleteModal.isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
                    onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-background border border-white/10 rounded-[2rem] p-6 max-w-md w-full max-h-[calc(100vh-2rem)] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Confirm Delete</h3>
                            <button
                                onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-red-400/10 flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} className="text-red-400" />
                            </div>
                            <p className="text-white mb-2">Are you sure you want to delete this item?</p>
                            <p className="text-white/60 text-sm">This action cannot be undone.</p>
                            {deleteModal.title && (
                                <p className="text-accent-primary font-medium mt-2">&quot;{deleteModal.title}&quot;</p>
                            )}
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">
                            <button
                                onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                                className="w-full sm:w-auto px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="w-full sm:w-auto px-6 py-3 bg-red-400 text-white rounded-xl hover:bg-red-500 transition-colors font-bold shadow-lg shadow-red-400/20"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface NotificationProps {
    notification: Notification | null;
}

export function NotificationToast({ notification }: NotificationProps) {
    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 z-[100] max-w-sm"
                >
                    <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur-md ${notification.type === 'success'
                            ? 'bg-green-400/10 border-green-400/30 text-green-400'
                            : 'bg-red-400/10 border-red-400/30 text-red-400'
                        }`}>
                        {notification.type === 'success' ? (
                            <CheckCircle size={20} className="shrink-0" />
                        ) : (
                            <AlertCircle size={20} className="shrink-0" />
                        )}
                        <p className="flex-1 text-sm font-medium leading-tight">{notification.message}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface VideoPlayerModalProps {
    videoPlayerModal: VideoPlayerModal;
    setVideoPlayerModal: (modal: VideoPlayerModal) => void;
}

export function VideoPlayer({ videoPlayerModal, setVideoPlayerModal }: VideoPlayerModalProps) {
    const extractYouTubeId = (value: string): string | null => {
        const trimmed = value.trim();
        if (!trimmed) return null;

        // Supports direct ID input from legacy callers
        if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

        try {
            const parsed = new URL(trimmed);

            if (parsed.hostname.includes("youtu.be")) {
                return parsed.pathname.replace("/", "").trim() || null;
            }

            if (parsed.hostname.includes("youtube.com")) {
                const watchId = parsed.searchParams.get("v");
                if (watchId) return watchId;

                const parts = parsed.pathname.split("/").filter(Boolean);
                const idx = parts.findIndex((part) => ["embed", "shorts"].includes(part));
                if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
            }
        } catch {
            return null;
        }

        return null;
    };

    const activeVideoId = extractYouTubeId(videoPlayerModal.videoUrl);

    return (
        <AnimatePresence>
            {videoPlayerModal.isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
                    onClick={() => setVideoPlayerModal({ ...videoPlayerModal, isOpen: false })}
                >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-4xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <h3 className="text-white text-lg font-bold truncate pr-10">{videoPlayerModal.title}</h3>
                                <button
                                    onClick={() => setVideoPlayerModal({ ...videoPlayerModal, isOpen: false })}
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {activeVideoId ? (
                                <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                                        title={videoPlayerModal.title}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : videoPlayerModal.videoUrl ? (
                                <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                                    <video 
                                        src={videoPlayerModal.videoUrl} 
                                        controls 
                                        autoPlay 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative flex items-center justify-center">
                                    <p className="text-white/40">No video source available</p>
                                </div>
                            )}
                        </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
