"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Play, ThumbsUp, ArrowRight, Loader2, Volume2, VolumeX, Pause, RotateCcw, RotateCw, Maximize } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { getMediaUrl } from "@/lib/admin-auth/utils";
import { DUMMY_HERO_CONTENT, DUMMY_HERO_VIDEO } from "@/data/dummy";

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}


const Orb = ({ className, delay = 0 }: { className: string; delay?: number }) => (
    <motion.div
        animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
        }}
        transition={{
            duration: 8,
            repeat: Infinity,
            delay: delay,
            ease: "linear",
        }}
        className={`glow-orb blur-[60px] opacity-10 will-change-transform transform-gpu ${className}`}
    />
);

interface HeroContent {
    title: string;
    subtitle: string;
    description: string;
}

interface HeroVideo {
    video_url: string;
    thumbnail_url: string;
}

const Hero = () => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isIntersecting, setIsIntersecting] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [content, setContent] = useState<HeroContent | null>(null);
    const [video, setVideo] = useState<HeroVideo | null>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isApiReady, setIsApiReady] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();

    // Audit: Media Throttling - Pause video when it exits the viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsIntersecting(entry.isIntersecting),
            { threshold: 0.1 }
        );
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // ERROR SIMULATION FOR TESTING
    if (searchParams.get("simulate_error") === "hero") {
        throw new Error("Simulated Hero Component Error for testing ErrorBoundary!");
    }

    // Scroll-linked fade and scale for section exit
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contentRes, videoRes] = await Promise.all([
                    axiosInstance.get("/heroes/hero-card/text/"),
                    axiosInstance.get("/heroes/hero-card/videos/")
                ]);
                const hasContent = contentRes.data && (contentRes.data.title || contentRes.data.subtitle);
                const hasVideo = videoRes.data && videoRes.data.video_url;
                if (hasContent) setContent(contentRes.data);
                else setContent(DUMMY_HERO_CONTENT as HeroContent);
                if (hasVideo) setVideo(videoRes.data);
                else setVideo(DUMMY_HERO_VIDEO as HeroVideo);
            } catch (error) {
                console.warn("Hero API unavailable, using dummy data:", (error as Error).message);
                setContent(DUMMY_HERO_CONTENT as HeroContent);
                setVideo(DUMMY_HERO_VIDEO as HeroVideo);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = video?.video_url ? getYoutubeId(video.video_url) : null;

    useEffect(() => {
        if (!youtubeId) return;

        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const initPlayer = () => {
            if (window.YT && window.YT.Player && !playerRef.current) {
                playerRef.current = new window.YT.Player('youtube-player', {
                    videoId: youtubeId,
                    playerVars: {
                        autoplay: 1,
                        mute: 1,
                        controls: 0,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                        loop: 1,
                        playlist: youtubeId,
                        enablejsapi: 1,
                        origin: typeof window !== 'undefined' ? window.location.origin : '',
                    },
                    events: {
                        onReady: () => setIsApiReady(true),
                        onStateChange: (event: any) => {
                            if (event.data === window.YT.PlayerState.ENDED) {
                                playerRef.current?.playVideo();
                            }
                        }
                    }
                });
            }
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [youtubeId]);

    const scrollToVideo = () => {
        const element = document.getElementById('video-showcase');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                setIsPlaying(true);
            }, 800);
        }
    };

    // Autoplay is enabled by default; users can still pause via custom controls.

    useEffect(() => {
        const activePlaying = isPlaying && isIntersecting;
        
        if (youtubeId && playerRef.current && isApiReady) {
            if (activePlaying) {
                playerRef.current.playVideo();
            } else {
                playerRef.current.pauseVideo();
            }
        }

        if (videoRef.current) {
            if (activePlaying) {
                videoRef.current.play().catch(e => console.error("Autoplay prevented:", e));
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying, isIntersecting, youtubeId, isApiReady]);

    useEffect(() => {
        if (youtubeId && playerRef.current && isApiReady) {
            if (isMuted) {
                playerRef.current.mute();
            } else {
                playerRef.current.unMute();
                playerRef.current.setVolume(100);
            }
        }

        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted, youtubeId, isApiReady]);

    const handlePlayPause = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsPlaying(!isPlaying);
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    const handleSeek = (e: React.MouseEvent, offset: number) => {
        e.stopPropagation();
        if (youtubeId && playerRef.current && isApiReady) {
            const currentTime = playerRef.current.getCurrentTime();
            playerRef.current.seekTo(currentTime + offset, true);
        } else if (videoRef.current) {
            videoRef.current.currentTime += offset;
        }
    };

    const toggleFullscreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
            videoContainerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const heroTitle =
        typeof content?.title === "string" && content.title.trim() !== ""
            ? content.title
            : "Cinematic\nVisual Storytelling";





    return (
        <section ref={containerRef} id="intro" className="relative min-h-[90vh] pt-32 md:pt-12 pb-20 flex flex-col items-center justify-center overflow-hidden">
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-20%" }}
                    transition={{ duration: 1 }}
                    className="max-w-6xl mx-auto px-6 text-center z-10 w-full gpu-fix"
                >

                {/* Background Orbs */}
                <Orb className="bg-accent-primary w-[600px] h-[600px] -top-64 -left-32 opacity-30" />
                <Orb className="bg-accent-tertiary w-[500px] h-[500px] top-1/2 -right-32 opacity-20" delay={2} />
                <Orb className="bg-accent-secondary w-[400px] h-[400px] -bottom-32 left-1/4 opacity-15" delay={4} />

                {/* Social Proof Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-sm"
                >
                    <div className="flex -space-x-1.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-5 h-5 rounded-full border border-background bg-accent-primary flex items-center justify-center text-[8px]">
                                <ThumbsUp size={10} fill="white" stroke="none" />
                            </div>
                        ))}
                    </div>
                    <p className="text-[11px] font-bold tracking-wider uppercase text-accent-secondary">
                        {content?.subtitle || "Creative Solutions, Trusted Globally"}
                    </p>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1] whitespace-pre-line"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#023E8A] via-[#49CADF] to-[#023E8A]">
                        {heroTitle}
                    </span>
                </motion.h1>

                {/* Sub-headline */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed font-light whitespace-pre-line"
                >
                    {content?.description || "We turn ideas into visuals through AI-enhanced video production \n and cinematic editing that captivates audiences."}
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-6"
                >
                    {/* <button className="flex items-center gap-2 group py-3 px-8 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_#0094C8]" style={{ backgroundColor: '#0094C8', color: 'white' }}>
                        Start Your Project <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button> */}
                    {video?.video_url && (
                        <button
                            onClick={scrollToVideo}
                            className="flex items-center gap-3 text-foreground font-semibold hover:text-accent-secondary transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/5 transition-all">
                                <Play size={18} fill="currentColor" stroke="none" />
                            </div>
                            Watch Our Reel
                        </button>
                    )}
                </motion.div>
 
                {/* Video Showcase Section */}
                {video?.video_url && (
                    <motion.div
                        id="video-showcase"
                        ref={videoContainerRef}
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="mt-24 relative max-w-5xl mx-auto scroll-mt-32"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary to-accent-tertiary rounded-[2.5rem] blur opacity-25"></div>
                        <div 
                            className="relative aspect-video rounded-[2rem] overflow-hidden glass-card shadow-2xl group border border-white/10"
                            onClick={handlePlayPause}
                        >
                            {youtubeId && (
                                <div className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="absolute inset-[-4%] w-[108%] h-[108%]">
                                        <div id="youtube-player" className="w-full h-full" />
                                    </div>
                                </div>
                            )}
                            {!youtubeId && (
                                <video
                                    ref={videoRef}
                                    className={`w-full h-full object-cover transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
                                    src={video.video_url}
                                    poster={getMediaUrl(video.thumbnail_url)}
                                    autoPlay
                                    muted={isMuted}
                                    loop
                                    playsInline
                                />
                            )}

                            <div className={`absolute inset-0 pointer-events-none z-20 transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            </div>
                            
                            {!isPlaying && (
                                <div className="absolute inset-0 z-10 transition-opacity duration-500">
                                    <img
                                        src={getMediaUrl(video.thumbnail_url) || "/hero-showcase.png"}
                                        alt="Agency Showreel"
                                        className="w-full h-full object-cover opacity-60"
                                    />
                                    <div className="absolute inset-0 bg-accent-primary/5 flex items-center justify-center">
                                        <div className="w-24 h-24 bg-accent-primary rounded-full flex items-center justify-center text-white border border-white/20 scale-110">
                                            <Play size={32} fill="white" stroke="none" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="absolute bottom-6 right-6 flex items-center gap-3 z-30 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                                <button
                                    onClick={(e) => handleSeek(e, -10)}
                                    className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-all"
                                    title="Back 10s"
                                >
                                    <RotateCcw size={20} />
                                </button>
                                <button
                                    onClick={handlePlayPause}
                                    className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                >
                                    {isPlaying ? <Pause size={20} fill="white" stroke="none" /> : <Play size={20} fill="white" stroke="none" />}
                                </button>
                                <button
                                    onClick={(e) => handleSeek(e, 10)}
                                    className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-all"
                                    title="Forward 10s"
                                >
                                    <RotateCw size={20} />
                                </button>
                                <button
                                    onClick={toggleMute}
                                    className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-all ml-2"
                                >
                                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>
                                <button
                                    onClick={toggleFullscreen}
                                    className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-all ml-2"
                                    title="Toggle Fullscreen"
                                >
                                    <Maximize size={20} />
                                </button>
                            </div>

                            {isPlaying && isMuted && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-6 left-6 z-30"
                                >
                                    <button
                                        onClick={toggleMute}
                                        className="px-4 py-2 bg-accent-primary/90 backdrop-blur-md rounded-lg text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-accent-primary transition-colors"
                                    >
                                        <VolumeX size={14} /> Unmute for Sound
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        )}
</section>
    );
};

export default Hero;
