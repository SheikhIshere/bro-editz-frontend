"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, Play, X, ExternalLink, RotateCcw, RotateCw, Pause, Volume2, VolumeX, Maximize, Monitor, Smartphone } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { getMediaUrl } from "@/lib/admin-auth/utils";
import { normalizeWorks, WorkResponse } from "@/lib/works/contract";
import { DUMMY_WORKS } from "@/data/dummy";

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").trim() || null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const watchId = parsed.searchParams.get("v");
      if (watchId) return watchId;

      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const embeddedIndex = pathParts.findIndex((part) =>
        ["embed", "shorts"].includes(part)
      );
      if (embeddedIndex >= 0 && pathParts[embeddedIndex + 1]) {
        return pathParts[embeddedIndex + 1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

const PortfolioCardContent = ({ work, isShorts, isPlaying, onFlush }: { 
  work: WorkResponse, 
  isShorts: boolean,
  isPlaying: boolean,
  onFlush: () => void
}) => {
  const videoId = extractYouTubeId(work.video_url);

  if (isPlaying && videoId) {
    return (
      <div className="absolute inset-0 bg-black">
        <PortfolioVideoPlayer 
          videoId={videoId} 
          title={work.title} 
          isShorts={isShorts}
          onFlush={onFlush}
        />
      </div>
    );
  }

  return (
    <>
      <div className="absolute inset-0">
        <img
          src={work.thumbnail ? getMediaUrl(work.thumbnail) : "/video-project.png"}
          alt={work.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <div className="flex flex-row flex-nowrap gap-2 mb-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x">
          {work.tags.map((tag) => (
            <span
              key={`${work.id}-${tag.id}`}
              className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-white/10 border border-white/10 text-white/90 backdrop-blur-md shrink-0 snap-start"
            >
              {tag.name}
            </span>
          ))}
        </div>

        <h3 className="text-xs md:text-sm font-black text-white mb-1 tracking-widest uppercase italic line-clamp-2 leading-tight">
          {work.title}
        </h3>

        <div className="flex items-center justify-between border-t border-white/5 pt-2">
          <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white/90 transition-colors">
            Watch <ArrowRight size={14} className="text-accent-primary group-hover:translate-x-2 transition-transform" />
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white scale-90 group-hover:scale-100 group-hover:bg-accent-primary group-hover:border-transparent transition-all duration-500">
            <Play size={16} className="fill-white ml-0.5" />
          </div>
        </div>
      </div>
    </>
  );
};

// Video Player Component to handle YouTube logic
const PortfolioVideoPlayer = ({ videoId, title, isShorts, onFlush }: { videoId: string; title: string; isShorts: boolean; onFlush: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerContainerId = useMemo(() => `portfolio-player-${videoId}-${Math.random().toString(36).substr(2, 9)}`, [videoId]);

  useEffect(() => {
    // Load YouTube IFrame API if not present
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (window.YT && window.YT.Player && !playerRef.current) {
        playerRef.current = new window.YT.Player(playerContainerId, {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            enablejsapi: 1,
            origin: typeof window !== "undefined" ? window.location.origin : "",
          },
          events: {
            onReady: () => {
              setIsApiReady(true);
              playerRef.current.playVideo();
            },
          },
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
  }, [videoId, playerContainerId]);

  useEffect(() => {
    if (playerRef.current && isApiReady) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, isApiReady]);

  useEffect(() => {
    if (playerRef.current && isApiReady) {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(100);
      }
    }
  }, [isMuted, isApiReady]);

  const handleSeek = (offset: number) => {
    if (playerRef.current && isApiReady) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(currentTime + offset, true);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
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
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${isShorts ? 'aspect-[9/16]' : 'aspect-video'} bg-black group overflow-hidden`}>
      {/* YouTube Player Container */}
      <div className="absolute inset-[-4%] w-[108%] h-[108%] pointer-events-none">
        <div id={playerContainerId} className="w-full h-full" />
      </div>

      {/* Gradient Masks to obscure YouTube UI */}
      <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-500">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      {/* Custom Controls */}
      <div className="absolute bottom-8 right-8 flex items-center gap-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); handleSeek(-10); }}
          className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-all"
        >
          <RotateCcw size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
          className="w-14 h-14 bg-accent-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleSeek(10); }}
          className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-all"
        >
          <RotateCw size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
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

      {/* Unmute Prompt */}
      <AnimatePresence>
        {isPlaying && isMuted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-8 left-8 z-30"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setIsMuted(false); }}
              className="px-4 py-2 bg-accent-primary/90 backdrop-blur-md rounded-lg text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-accent-primary transition-colors"
            >
              <VolumeX size={14} /> Unmute for Sound
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Portfolio() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, { once: false, margin: "-10%" });

  const [works, setWorks] = useState<WorkResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeWork, setActiveWork] = useState<WorkResponse | null>(null);

  const fetchWorks = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/works/list/");
      const normalized = normalizeWorks(response.data);
      if (normalized.length > 0) {
        setWorks(normalized);
      } else {
        console.warn("Portfolio API returned empty, using dummy works");
        setWorks(DUMMY_WORKS as WorkResponse[]);
      }
    } catch (err) {
      console.warn("Portfolio API unavailable, using dummy works:", (err as Error).message);
      setWorks(DUMMY_WORKS as WorkResponse[]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const categories = useMemo(() => {
    const uniqueTags = new Set<string>();

    works.forEach((work) => {
      work.tags.forEach((tag) => {
        const tagName = tag.name.trim();
        if (tagName) uniqueTags.add(tagName);
      });
    });

    return ["All", ...Array.from(uniqueTags)];
  }, [works]);

  useEffect(() => {
    if (activeCategory !== "All" && !categories.includes(activeCategory)) {
      setActiveCategory("All");
    }
  }, [activeCategory, categories]);

  const filteredWorks = useMemo(() => {
    if (activeCategory === "All") {
      // "All" specifically means "All Long Videos"
      return works.filter((work) => 
        !work.tags.some((tag) => tag.name.toLowerCase() === "shorts")
      );
    }

    return works.filter((work) =>
      work.tags.some((tag) => tag.name === activeCategory)
    );
  }, [works, activeCategory]);

  const activeVideoId = activeWork ? extractYouTubeId(activeWork.video_url) : null;

  return (
    <section ref={containerRef} id="work" className="pt-32 pb-16 relative">
      <AnimatePresence>
        {activeWork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-2xl"
            onClick={() => setActiveWork(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full ${activeWork?.video_url.includes('/shorts/') ? 'max-w-md' : 'max-w-6xl'} rounded-[2.5rem] overflow-hidden shadow-2xl relative bg-black border border-white/10`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveWork(null)}
                className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/20 transition-all z-[40]"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col">
                <div className="relative">
                  {activeVideoId ? (
                    <PortfolioVideoPlayer 
                      videoId={activeVideoId} 
                      title={activeWork.title} 
                      isShorts={activeWork.video_url.includes('/shorts/')}
                      onFlush={() => setActiveWork(null)}
                    />
                  ) : (
                    <div className="aspect-video w-full flex flex-col items-center justify-center gap-4 p-8 text-center bg-white/5">
                      <p className="text-white/80">This video cannot be embedded. Open it directly:</p>
                      <a
                        href={activeWork.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-primary text-white font-bold transition-transform hover:scale-105"
                      >
                        Open Video <ExternalLink size={18} />
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="p-8 sm:p-10 bg-gradient-to-b from-white/[0.05] to-transparent">
                  <div className="flex flex-wrap gap-2 mb-4 text-accent-secondary font-bold text-xs uppercase tracking-[0.2em]">
                    {activeWork.tags.map(tag => tag.name).join(' • ')}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                    {activeWork.title}
                  </h3>
                  <p className="text-white/60 text-lg leading-relaxed max-w-4xl">
                    {activeWork.description || "No description provided."}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 gpu-fix">
        <div className="flex flex-col items-center text-center mb-16 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-7xl font-black mb-6 tracking-tight"
          >
            Next-Generation Video{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#023E8A] via-[#49CADF] to-[#023E8A]">
              Production
            </span>
          </motion.h2>
          <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed mb-12">
            Explore our featured projects crafted for brands that care about impact.
          </p>

          <div className="flex flex-col items-center gap-8 w-full">
            {/* Unified Category Tags Filter */}
            {categories.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-row flex-nowrap overflow-x-auto w-full md:w-auto justify-start md:justify-center p-1.5 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-2xl gap-2 shadow-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-8 py-4 rounded-[1.5rem] text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 shrink-0 ${
                      activeCategory === category
                        ? "bg-accent-primary text-white shadow-[0_0_25px_rgba(2,62,138,0.4)] scale-105"
                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-12">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-video w-full rounded-[2.5rem] bg-white/5 animate-pulse border border-white/10"
              />
            ))}
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-white/60">
            No portfolio work found for this filter.
          </div>
        ) : activeCategory.toLowerCase() === 'shorts' ? (
          /* Shorts View: Horizontal Swipe */
          <div className="flex gap-6 overflow-x-auto pb-12 snap-x snap-mandatory no-scrollbar px-[7.5vw] scroll-px-[7.5vw]">
            {filteredWorks.map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                onClick={() => setPlayingId(String(work.id))}
                className="group relative shrink-0 snap-center aspect-[9/16] w-[75vw] md:w-[350px] rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/[0.02] cursor-pointer"
              >
                <PortfolioCardContent 
                  work={work} 
                  isShorts={true} 
                  isPlaying={playingId === String(work.id)}
                  onFlush={() => setPlayingId(null)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          /* Long Video View: Compact 2-Column Grid on PC */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
            {filteredWorks.map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                onClick={() => setPlayingId(String(work.id))}
                className="group relative aspect-video w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/10 bg-white/[0.02] cursor-pointer hover:border-white/20 transition-all duration-300"
              >
                <PortfolioCardContent 
                  work={work} 
                  isShorts={false} 
                  isPlaying={playingId === String(work.id)}
                  onFlush={() => setPlayingId(null)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
