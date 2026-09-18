"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Save, Video, Plus, Search, ChevronDown, Trash2 } from "lucide-react";
import { HeroContent, VideoItem, VideoPlayerModal, DeleteModal } from "./types";
import VideoEditModal from "./VideoEditModal";
import HeroContentEditModal from "./HeroContentEditModal";
import { getMediaUrl } from "@/lib/admin-auth/utils";


interface HeroSectionProps {
    heroContents: HeroContent[];
    setHeroContents: (contents: HeroContent[]) => void;
    videos: VideoItem[];
    setVideos: (videos: VideoItem[]) => void;
    videoSearch: string;
    setVideoSearch: (search: string) => void;
    videoFilter: string;
    setVideoFilter: (filter: string) => void;
    heroContentFilter: string;
    setHeroContentFilter: (filter: string) => void;
    videoPlayerModal: VideoPlayerModal;
    setVideoPlayerModal: (modal: VideoPlayerModal) => void;
    isLoading: boolean;
    saveHeroContent: (id?: number, data?: Partial<HeroContent>) => void;
    activateHeroContent: (id: number) => void;
    saveHeroVideo: (id?: string | number, data?: any) => void;
    showNotification: (type: 'success' | 'error', message: string) => void;
    addVideo: () => void;
    filteredVideos: VideoItem[];
    openVideoPlayer: (videoUrl: string, title: string) => void;
    toggleVideoVisibility: (videoId: string | number) => void;
    setDeleteModal: (modal: DeleteModal) => void;
}

export default function HeroSection({
    heroContents,
    setHeroContents,
    videos,
    setVideos,
    videoSearch,
    setVideoSearch,
    videoFilter,
    setVideoFilter,
    heroContentFilter,
    setHeroContentFilter,
    videoPlayerModal,
    setVideoPlayerModal,
    isLoading,
    saveHeroContent,
    activateHeroContent,
    saveHeroVideo,
    showNotification,
    addVideo,
    filteredVideos,
    openVideoPlayer,
    toggleVideoVisibility,
    setDeleteModal
}: HeroSectionProps) {
    const [videoEditModalOpen, setVideoEditModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
    
    const [contentEditModalOpen, setContentEditModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<HeroContent | null>(null);

    const openVideoEditModal = (video: VideoItem | null) => {
        setEditingVideo(video);
        setVideoEditModalOpen(true);
    };

    const openContentEditModal = (content: HeroContent | null) => {
        setEditingContent(content);
        setContentEditModalOpen(true);
    };

    const handleDeleteVideo = (video: VideoItem) => {
        setDeleteModal({
            isOpen: true,
            type: 'video',
            id: video.id.toString(),
            title: video.title
        });
    };

    const handleDeleteContent = (content: HeroContent) => {
        if (content.id) {
            setDeleteModal({
                isOpen: true,
                type: 'hero_content',
                id: content.id.toString(),
                title: content.title
            });
        }
    };

    const filteredHeroContents = heroContents.filter(content => {
        if (heroContentFilter === 'all') return true;
        if (heroContentFilter === 'active') return content.is_active;
        if (heroContentFilter === 'inactive') return !content.is_active;
        return true;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Hero Iterations Manager */}
            <div className="glass-card p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/10">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                    <h3 className="text-xl md:text-2xl font-bold text-white">Hero Texts ({filteredHeroContents.length})</h3>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative">
                            <button
                                id="content-sort-button"
                                type="button"
                                onClick={() => {
                                    const dropdown = document.getElementById('content-sort-dropdown');
                                    dropdown?.classList.toggle('hidden');
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                            >
                                <span className="text-sm font-bold">
                                    {heroContentFilter === 'all' ? 'All' : heroContentFilter === 'active' ? 'Active' : 'Inactive'}
                                </span>
                                <ChevronDown size={14} />
                            </button>
                            <div id="content-sort-dropdown" className="hidden absolute right-0 mt-2 w-40 bg-background border border-white/10 rounded-xl shadow-lg z-10 overflow-hidden">
                                <button
                                    onClick={() => { setHeroContentFilter('all'); document.getElementById('content-sort-dropdown')?.classList.add('hidden'); }}
                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors border-b border-white/5"
                                >
                                    All Iterations
                                </button>
                                <button
                                    onClick={() => { setHeroContentFilter('active'); document.getElementById('content-sort-dropdown')?.classList.add('hidden'); }}
                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors border-b border-white/5"
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => { setHeroContentFilter('inactive'); document.getElementById('content-sort-dropdown')?.classList.add('hidden'); }}
                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                                >
                                    Inactive
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => openContentEditModal(null)}
                            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all hover:scale-105"
                            style={{ backgroundColor: '#0094C8', color: 'white' }}
                        >
                            <Plus size={18} />
                            Add Iteration
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {filteredHeroContents.map((content) => (
                        <div key={content.id} className="glass-card p-6 rounded-[2rem] border border-white/10 relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-white line-clamp-2">{content.title}</h4>
                                    <p className="text-sm text-white/40">{new Date(content.created_at || '').toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteContent(content)}
                                    className="p-2 text-white/20 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <p className="text-sm text-white/60 mb-6 line-clamp-3">{content.subtitle || content.description}</p>

                            <div className="flex items-center justify-between mt-auto">
                                <button
                                    onClick={() => content.id && activateHeroContent(content.id)}
                                    disabled={content.is_active || isLoading}
                                    className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${content.is_active
                                            ? 'bg-green-400 text-black'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    {content.is_active ? 'Active' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => openContentEditModal(content)}
                                    className="text-accent-primary hover:text-accent-secondary transition-colors font-bold text-sm"
                                >
                                    Edit Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Videos Manager */}
            <div className="glass-card p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/10">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                    <h3 className="text-xl md:text-2xl font-bold text-white">Hero Videos ({filteredVideos.length})</h3>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={videoSearch}
                                onChange={(e) => setVideoSearch(e.target.value)}
                                className="w-full sm:w-48 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-accent-primary transition-colors"
                            />
                        </div>
                        <div className="relative">
                            <button
                                id="video-sort-button"
                                type="button"
                                onClick={() => {
                                    const dropdown = document.getElementById('video-sort-dropdown');
                                    dropdown?.classList.toggle('hidden');
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                            >
                                <span className="text-sm font-bold truncate max-w-[80px]">
                                    {videoFilter === 'all' ? 'All' : videoFilter === 'published' ? 'Active' : 'Inactive'}
                                </span>
                                <ChevronDown size={14} />
                            </button>
                            <div id="video-sort-dropdown" className="hidden absolute right-0 mt-2 w-40 bg-background border border-white/10 rounded-xl shadow-lg z-10 overflow-hidden">
                                <button
                                    onClick={() => { setVideoFilter('all'); document.getElementById('video-sort-dropdown')?.classList.add('hidden'); }}
                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors border-b border-white/5"
                                >
                                    All Videos
                                </button>
                                <button
                                    onClick={() => { setVideoFilter('published'); document.getElementById('video-sort-dropdown')?.classList.add('hidden'); }}
                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors border-b border-white/5"
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => { setVideoFilter('draft'); document.getElementById('video-sort-dropdown')?.classList.add('hidden'); }}
                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                                >
                                    Inactive
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => openVideoEditModal(null)}
                            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all hover:scale-105"
                            style={{ backgroundColor: '#0094C8', color: 'white' }}
                        >
                            <Plus size={18} />
                            Add Video
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video) => (
                        <div key={video.id} className="glass-card p-6 rounded-[2rem] border border-white/10 relative group">
                            <div
                                onClick={() => openVideoPlayer(video.youtube_url, video.title)}
                                className="cursor-pointer mb-4"
                            >
                                <div className="w-full h-48 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden">
                                    {video.thumbnail ? (
                                        <img src={getMediaUrl(video.thumbnail)} alt={video.title} className="w-full h-full object-cover" />
                                    ) : (

                                        <Video size={48} className="text-white/20" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                            <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-bold text-white line-clamp-1">{video.title}</h4>
                                <button
                                    onClick={() => handleDeleteVideo(video)}
                                    className="p-1 text-white/20 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-white/60">
                                <span>Created: {new Date(video.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    onClick={() => toggleVideoVisibility(video.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${video.is_active
                                            ? 'bg-green-400/20 text-green-400 border border-green-400/30 hover:bg-green-400/30'
                                            : 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/30'
                                        }`}
                                >
                                    {video.is_active ? 'Active' : 'Inactive'}
                                </button>
                                <button
                                    onClick={() => openVideoEditModal(video)}
                                    className="text-accent-primary hover:text-accent-secondary transition-colors"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Video Edit Modal */}
            <VideoEditModal
                isOpen={videoEditModalOpen}
                onClose={() => setVideoEditModalOpen(false)}
                video={editingVideo}
                onSave={saveHeroVideo}
                showNotification={showNotification}
            />

            {/* Hero Content Edit Modal */}
            <HeroContentEditModal
                isOpen={contentEditModalOpen}
                onClose={() => setContentEditModalOpen(false)}
                content={editingContent}
                onSave={saveHeroContent}
                showNotification={showNotification}
            />
        </motion.div>
    );
}
