"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Play, X, Star, Quote, MoveRight, MoveLeft, CheckCircle2, Award, RotateCcw, RotateCw, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { normalizeApiList } from "@/lib/services/contract";
import { getMediaUrl } from "@/lib/admin-auth/utils";
import { DUMMY_TEXT_REVIEWS as CENTRAL_TEXT_REVIEWS, DUMMY_VIDEO_REVIEWS as CENTRAL_VIDEO_REVIEWS } from "@/data/dummy";

type ReviewStatus = "PENDING" | "RUNNING" | "VERIFIED" | "REJECTED";

interface TextReview {
  id: number;
  client_name: string;
  designation: string;
  company_logo: string | null;
  review_text: string;
  star_rating: string;
  featured: boolean;
  created_at: string;
}

interface VideoReview {
  id: number;
  title: string;
  description: string;
  video_url: string;
  featured: boolean;
  created_at: string;
}

const DUMMY_TEXT_REVIEWS: TextReview[] = CENTRAL_TEXT_REVIEWS as TextReview[];
const DUMMY_VIDEO_REVIEWS: VideoReview[] = CENTRAL_VIDEO_REVIEWS as VideoReview[];

function getInitials(name: string): string {
  if (!name) return "NA";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.replace("/", "").trim() || null;
    if (parsed.hostname.includes("youtube.com")) {
      const watchId = parsed.searchParams.get("v");
      if (watchId) return watchId;
      const parts = parsed.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((part) => ["embed", "shorts"].includes(part));
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
  } catch { return null; }
  return null;
}

// Custom Video Player Component (Matches Portfolio logic)
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const TestimonialVideoPlayer = ({ videoId, title }: { videoId: string; title: string }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerContainerId = useMemo(() => `testimonial-player-${videoId}-${Math.random().toString(36).substr(2, 9)}`, [videoId]);

  useEffect(() => {
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
      if (isPlaying) playerRef.current.playVideo();
      else playerRef.current.pauseVideo();
    }
  }, [isPlaying, isApiReady]);

  useEffect(() => {
    if (playerRef.current && isApiReady) {
      if (isMuted) playerRef.current.mute();
      else {
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
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black group overflow-hidden">
      {/* YouTube Player Container */}
      <div className="absolute inset-[-4%] w-[108%] h-[108%] pointer-events-none">
        <div id={playerContainerId} className="w-full h-full" />
      </div>

      {/* Gradient Masks */}
      <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-500">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      {/* Custom Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-[100] opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); handleSeek(-10); }}
          className="w-12 h-12 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black transition-all"
        >
          <RotateCcw size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
          className="w-14 h-14 bg-[#0094C8] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleSeek(10); }}
          className="w-12 h-12 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black transition-all"
        >
          <RotateCw size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
          className="w-12 h-12 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black transition-all ml-2"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button
          onClick={toggleFullscreen}
          className="w-12 h-12 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black transition-all ml-2"
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
            className="absolute bottom-8 left-8 z-[100]"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setIsMuted(false); }}
              className="px-4 py-2 bg-[#0094C8]/90 backdrop-blur-md rounded-lg text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#0094C8] transition-colors"
            >
              <VolumeX size={14} /> Unmute
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Testimonials = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoScrollRef = useRef<HTMLDivElement | null>(null);
  const textScrollRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const [textReviews, setTextReviews] = useState<TextReview[]>(DUMMY_TEXT_REVIEWS);
  const [videoReviews, setVideoReviews] = useState<VideoReview[]>(DUMMY_VIDEO_REVIEWS);
  const [activeVideo, setActiveVideo] = useState<VideoReview | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [activeTextIndex, setActiveTextIndex] = useState(0);

  const scrollByAmount = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const childWidth = (ref.current.firstChild as HTMLElement)?.offsetWidth || 350;
      const scrollAmount = childWidth + 32; // Include gap exactly
      ref.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  };

  const handleVideoScroll = () => {
    if (!videoScrollRef.current || videoReviews.length === 0) return;
    const { scrollLeft } = videoScrollRef.current;
    const childWidth = (videoScrollRef.current.firstChild as HTMLElement)?.offsetWidth || 0;
    const itemWidth = childWidth + 32;
    if (itemWidth > 0) {
      const index = Math.round(scrollLeft / itemWidth);
      setActiveVideoIndex(index % videoReviews.length);
    }
  };

  const handleTextScroll = () => {
    if (!textScrollRef.current || textReviews.length === 0) return;
    const { scrollLeft } = textScrollRef.current;
    const childWidth = (textScrollRef.current.firstChild as HTMLElement)?.offsetWidth || 0;
    const itemWidth = childWidth + 32;
    if (itemWidth > 0) {
      const index = Math.round(scrollLeft / itemWidth);
      setActiveTextIndex(index % textReviews.length);
    }
  };

  useEffect(() => {
    const videoInterval = setInterval(() => {
      if (videoScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = videoScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 50) {
          videoScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollByAmount(videoScrollRef, "right");
        }
      }
    }, 4000);

    const textInterval = setInterval(() => {
      if (textScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = textScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 50) {
          textScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollByAmount(textScrollRef, "right");
        }
      }
    }, 5000);

    return () => {
      clearInterval(videoInterval);
      clearInterval(textInterval);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [textRes, videoRes] = await Promise.all([
          axiosInstance.get("/review/text/", { params: { size: 100 } }),
          axiosInstance.get("/review/video/", { params: { size: 100 } }),
        ]);

        const rawText = normalizeApiList<TextReview>(textRes.data);
        const rawVideo = normalizeApiList<VideoReview>(videoRes.data);

        // Deduplicate by ID to prevent any accidental redundancy from backend
        const uniqueText = Array.from(new Map(rawText.map(r => [r.id, r])).values());
        const uniqueVideo = Array.from(new Map(rawVideo.map(r => [r.id, r])).values());

        const featuredText = uniqueText.filter(r => r.featured);
        const featuredVideo = uniqueVideo.filter(r => r.featured);

        if (featuredText.length > 0) {
          setTextReviews(featuredText);
        }

        if (featuredVideo.length > 0) {
          setVideoReviews(featuredVideo);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    };
    load();
  }, []);

  // Remove doubling to fix the "Data Redundant" issue. 
  // The auto-scroll logic already handles resetting to the beginning when reaching the end.
  const repeatedVideoReviews = useMemo(() => videoReviews, [videoReviews]);
  const repeatedTextReviews = useMemo(() => textReviews, [textReviews]);

  const activeVideoId = activeVideo?.video_url ? extractYouTubeId(activeVideo.video_url) : null;

  return (
    <section ref={containerRef} id="reviews" className="py-32 bg-[#050505] overflow-x-clip">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header Section */}
        <div className="text-center mb-32">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black mb-8 tracking-tighter uppercase italic leading-[1.2] py-4"
          >
            <span className="text-white">CLIENT</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0094C8] via-[#49CADE] to-[#0094C8] pr-4">REVIEWS</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-white/60 text-xs md:text-sm font-black uppercase tracking-[0.6em] max-w-2xl mx-auto leading-loose"
          >
            WHAT OUR CLIENTS SAY ABOUT WORKING WITH US
          </motion.p>
        </div>

        {/* Video Reviews - Infinite Marquee */}
        <div className="mb-48 group/video relative">
          <div className="flex items-center justify-between mb-16 px-4">
            <h3 className="text-[13px] font-black tracking-[0.5em] text-white uppercase flex items-center gap-6">
              <span className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#0094C8] shadow-[0_0_10px_#0094C8]" />
                Video Feedbacks
              </span>
              <div className="h-px w-24 bg-gradient-to-r from-[#0094C8]/40 to-transparent" />
            </h3>
            <div className="flex gap-4">
              <button onClick={() => scrollByAmount(videoScrollRef, "left")} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95">
                <MoveLeft size={20} />
              </button>
              <button onClick={() => scrollByAmount(videoScrollRef, "right")} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95">
                <MoveRight size={20} />
              </button>
            </div>
          </div>

          <div className="relative overflow-visible pb-12">
            <div ref={videoScrollRef} onScroll={handleVideoScroll} className="flex gap-8 py-10 overflow-x-auto scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {repeatedVideoReviews.map((review, idx) => {
                const youtubeId = review.video_url ? extractYouTubeId(review.video_url) : null;
                const thumbnail = youtubeId
                  ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                  : "/video-project.png";

                return (
                    <div
                      key={`${review.id}-${idx}`}
                      className={`snap-center shrink-0 min-w-[240px] md:min-w-[280px] aspect-[9/16] relative rounded-[2.5rem] overflow-hidden group/card cursor-pointer bg-neutral-900 border border-white/5 shadow-2xl transition-all duration-700 hover:border-[#0094C8]/40 ${activeVideo?.id === review.id ? 'ring-2 ring-[#0094C8] scale-[1.02]' : 'hover:scale-[1.02]'}`}
                      onClick={() => setActiveVideo(activeVideo?.id === review.id ? null : review)}
                    >
                      {activeVideo?.id === review.id && youtubeId ? (
                        <div className="absolute inset-0 z-50">
                           <TestimonialVideoPlayer videoId={youtubeId} title={review.title} />
                           <button 
                             onClick={(e) => { e.stopPropagation(); setActiveVideo(null); }}
                             className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/40 hover:text-white z-[100] transition-all border border-white/10"
                           >
                             <X size={20} />
                           </button>
                        </div>
                      ) : (
                        <>
                          <img
                            src={thumbnail}
                            alt={review.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110 grayscale-[30%] group-hover/card:grayscale-0"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-95 group-hover/card:opacity-80 transition-opacity" />

                          <div className="absolute inset-x-0 bottom-0 p-6 space-y-4 translate-y-2 group-hover/card:translate-y-0 transition-transform duration-500">
                            <div className="flex items-center justify-between border-t border-white/10 pt-4 opacity-60 group-hover/card:opacity-100 transition-opacity">
                              <div className="min-w-0">
                                <h4 className="text-white font-black text-[11px] md:text-[12px] uppercase truncate italic tracking-tight">
                                  {review.title.split('-')[0]?.trim() || "Client"}
                                </h4>
                                <p className="text-[#0094C8] text-[8px] uppercase font-black tracking-widest truncate mt-0.5">
                                  {review.title.split('-')[1]?.trim() || "Creative Partner"}
                                </p>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white scale-90 group-hover/card:scale-100 transition-transform shadow-lg border border-white/5">
                                <Play size={16} className="fill-white ml-0.5" />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                );
              })}
            </div>

            {/* Video Carousel Dots */}
            <div className="flex justify-center gap-2 absolute bottom-2 left-0 right-0">
              {videoReviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (videoScrollRef.current) {
                      const childWidth = (videoScrollRef.current.firstChild as HTMLElement)?.offsetWidth || 0;
                      videoScrollRef.current.scrollTo({ left: (childWidth + 32) * idx, behavior: "smooth" });
                    }
                  }}
                  className={`h-2 rounded-full transition-all duration-500 ${activeVideoIndex === idx ? "w-8 bg-[#0094C8]" : "w-2 bg-white/20 hover:bg-white/40"}`}
                  aria-label={`Go to video slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Text Reviews - Infinite Marquee (Reverse Direction) */}
        <div className="group/text mb-20">
          <div className="flex items-center justify-between mb-16 px-4">
            <h3 className="text-[13px] font-black tracking-[0.5em] text-white uppercase flex items-center gap-6">
              <span className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#0094C8] shadow-[0_0_10px_#0094C8]" />
                Text Feedbacks
              </span>
              <div className="h-px w-24 bg-gradient-to-r from-[#0094C8]/40 to-transparent" />
            </h3>
            <div className="flex gap-4">
              <button onClick={() => scrollByAmount(textScrollRef, "left")} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95">
                <MoveLeft size={20} />
              </button>
              <button onClick={() => scrollByAmount(textScrollRef, "right")} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95">
                <MoveRight size={20} />
              </button>
            </div>
          </div>

          <div className="relative overflow-visible pb-12">
            <div ref={textScrollRef} onScroll={handleTextScroll} className="flex gap-6 py-10 overflow-x-auto scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {repeatedTextReviews.map((review, idx) => (
                <div
                  key={`${review.id}-${idx}`}
                  className="snap-center shrink-0 w-[280px] md:w-[320px] bg-neutral-900 border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between group/tcard hover:border-[#0094C8]/40 shadow-2xl hover:shadow-[0_0_40px_rgba(0,148,200,0.15)] transition-all duration-700 relative hover:scale-[1.02]"
                >
                  <div className="absolute top-8 right-8 opacity-[0.04] group-hover/tcard:opacity-20 group-hover/tcard:scale-110 transition-all text-white group-hover/tcard:text-[#0094C8]">
                    <Quote size={50} className="fill-current" />
                  </div>

                  <div>
                    <div className="flex items-start gap-4 mb-8">
                      {review.company_logo ? (
                        <div className="w-14 h-14 rounded-xl bg-[#151515] overflow-hidden flex items-center justify-center border border-white/5 group-hover/tcard:border-[#0094C8]/30 transition-all">
                          <img src={getMediaUrl(review.company_logo)} alt="" className="w-full h-full object-cover transition-all duration-700" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0094C8]/20 to-[#0094C8]/5 flex items-center justify-center border border-[#0094C8]/20 shadow-[inset_0_0_15px_rgba(0,148,200,0.1)] group-hover/tcard:border-[#0094C8]/50 group-hover/tcard:shadow-[inset_0_0_15px_rgba(0,148,200,0.3)] transition-all duration-500 shrink-0">
                          <span className="text-xl font-black text-white/90 drop-shadow-md uppercase tracking-widest">{review.client_name ? getInitials(review.client_name) : "CL"}</span>
                        </div>
                      )}
                      <div className="pt-1">
                        <h4 className="text-white text-lg font-black uppercase italic tracking-tighter leading-tight">{review.client_name}</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0094C8] shadow-[0_0_8px_#0094C8]" />
                          <span className="text-[#0094C8] text-[9px] font-black uppercase tracking-widest">{review.designation || "Executive"}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-white/80 text-sm md:text-base font-medium italic leading-relaxed mb-8 group-hover/tcard:text-white transition-colors line-clamp-6">
                      "{review.review_text}"
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < Math.floor(Number(review.star_rating)) ? "fill-[#0094C8] text-[#0094C8]" : "text-white/10"} />
                      ))}
                      <span className="text-white font-black text-sm ml-2 italic">{Number(review.star_rating).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/[0.03]">
                      <CheckCircle2 size={10} className="text-[#0094C8]" />
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Verified</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Text Carousel Dots */}
            <div className="flex justify-center gap-2 absolute bottom-2 left-0 right-0">
              {textReviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (textScrollRef.current) {
                      const childWidth = (textScrollRef.current.firstChild as HTMLElement)?.offsetWidth || 0;
                      textScrollRef.current.scrollTo({ left: (childWidth + 32) * idx, behavior: "smooth" });
                    }
                  }}
                  className={`h-2 rounded-full transition-all duration-500 ${activeTextIndex === idx ? "w-8 bg-[#0094C8]" : "w-2 bg-white/20 hover:bg-white/40"}`}
                  aria-label={`Go to text slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Testimonials;
