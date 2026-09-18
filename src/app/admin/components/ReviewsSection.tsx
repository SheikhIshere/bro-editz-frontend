"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Star,
  Upload,
  Play,
  ExternalLink,
  Filter,
} from "lucide-react";
import {
  listTextReviews,
  createTextReview,
  updateTextReview,
  deleteTextReview,
  featureTextReview,
  listVideoReviews,
  createVideoReview,
  updateVideoReview,
  deleteVideoReview,
  featureVideoReview,
} from "@/lib/admin-auth/server";
import { normalizeApiList } from "@/lib/services/contract";
import { getMediaUrl } from "@/lib/admin-auth/utils";

type ReviewsTab = "text" | "video";

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

interface TextFormState {
  id?: number;
  client_name: string;
  designation: string;
  review_text: string;
  star_rating: string;
  featured: boolean;
  company_logo: File | null;
}

interface VideoFormState {
  id?: number;
  title: string;
  description: string;
  video_url: string;
  featured: boolean;
}

interface DeleteModalState {
  isOpen: boolean;
  type: ReviewsTab;
  id: number | null;
  title: string;
}

interface ReviewsSectionProps {
  showNotification: (type: "success" | "error", message: string) => void;
  openVideoPlayer: (url: string, title: string) => void;
}

const EMPTY_TEXT_FORM: TextFormState = {
  client_name: "",
  designation: "",
  review_text: "",
  star_rating: "5.0",
  featured: true,
  company_logo: null,
};

const EMPTY_VIDEO_FORM: VideoFormState = {
  title: "",
  description: "",
  video_url: "",
  featured: true,
};

function getInitials(name: string): string {
  if (!name) return "NA";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function renderStars(rating: string): React.ReactNode {
  const parsed = Number.parseFloat(rating || "0");
  const fullStars = Math.max(0, Math.min(5, Math.floor(parsed)));
  const hasHalfStar = parsed % 1 >= 0.4;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, idx) => (
        <Star
          key={idx}
          size={14}
          className={
            idx < fullStars 
              ? "fill-yellow-400 text-yellow-400" 
              : (idx === fullStars && hasHalfStar)
                ? "fill-yellow-400/40 text-yellow-400/40"
                : "text-white/20"
          }
        />
      ))}
      <span className="ml-2 text-xs font-bold text-white/60">{parsed.toFixed(1)}</span>
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);

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
}

export default function ReviewsSection({ showNotification, openVideoPlayer }: ReviewsSectionProps) {
  const [activeTab, setActiveTab] = useState<ReviewsTab>("text");
  const [isLoading, setIsLoading] = useState(false);

  const [textReviews, setTextReviews] = useState<TextReview[]>([]);
  const [videoReviews, setVideoReviews] = useState<VideoReview[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const [textModalOpen, setTextModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [textForm, setTextForm] = useState<TextFormState>(EMPTY_TEXT_FORM);
  const [videoForm, setVideoForm] = useState<VideoFormState>(EMPTY_VIDEO_FORM);

  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: "text",
    id: null,
    title: "",
  });

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch more items to avoid pagination issues for now
      const [textRes, videoRes] = await Promise.all([
        listTextReviews({ size: 100 }), 
        listVideoReviews({ size: 100 })
      ]);

      if (textRes.ok) {
        setTextReviews(normalizeApiList<TextReview>(textRes.data));
      } else {
        showNotification("error", textRes.message || "Failed to load text reviews.");
      }

      if (videoRes.ok) {
        setVideoReviews(normalizeApiList<VideoReview>(videoRes.data));
      } else {
        showNotification("error", videoRes.message || "Failed to load video reviews.");
      }
    } catch {
      showNotification("error", "Failed to load reviews.");
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filteredTextReviews = useMemo(() => {
    return textReviews.filter((review) => {
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        review.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.review_text.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFeatured = !featuredOnly || review.featured;

      return matchesSearch && matchesFeatured;
    });
  }, [textReviews, searchQuery, featuredOnly]);

  const filteredVideoReviews = useMemo(() => {
    return videoReviews.filter((review) => {
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (review.video_url || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFeatured = !featuredOnly || review.featured;

      return matchesSearch && matchesFeatured;
    });
  }, [videoReviews, searchQuery, featuredOnly]);

  const openNewTextModal = () => {
    setTextForm(EMPTY_TEXT_FORM);
    setTextModalOpen(true);
  };

  const openEditTextModal = (item: TextReview) => {
    setTextForm({
      id: item.id,
      client_name: item.client_name,
      designation: item.designation || "",
      review_text: item.review_text,
      star_rating: item.star_rating,
      featured: item.featured,
      company_logo: null,
    });
    setTextModalOpen(true);
  };

  const openNewVideoModal = () => {
    setVideoForm(EMPTY_VIDEO_FORM);
    setVideoModalOpen(true);
  };

  const openEditVideoModal = (item: VideoReview) => {
    setVideoForm({
      id: item.id,
      title: item.title,
      description: item.description || "",
      video_url: item.video_url || "",
      featured: item.featured,
    });
    setVideoModalOpen(true);
  };

  const submitTextReview = async () => {
    const rating = Number.parseFloat(textForm.star_rating);
    if (!textForm.client_name.trim() || !textForm.review_text.trim()) {
      showNotification("error", "Client name and review text are required.");
      return;
    }

    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      showNotification("error", "Star rating must be between 1.0 and 5.0.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("client_name", textForm.client_name.trim());
      formData.append("designation", textForm.designation.trim());
      formData.append("review_text", textForm.review_text.trim());
      formData.append("star_rating", rating.toFixed(1));
      formData.append("featured", String(textForm.featured));
      if (textForm.company_logo) {
        formData.append("company_logo", textForm.company_logo);
      }

      const result = textForm.id
        ? await updateTextReview(textForm.id, formData)
        : await createTextReview(formData);

      if (!result.ok) {
        showNotification("error", result.message || "Failed to save text review.");
        return;
      }

      showNotification("success", `Text review ${textForm.id ? "updated" : "created"} successfully.`);
      setTextModalOpen(false);
      setTextForm(EMPTY_TEXT_FORM);
      await loadReviews();
    } catch {
      showNotification("error", "Failed to save text review.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitVideoReview = async () => {
    if (!videoForm.title.trim()) {
      showNotification("error", "Video title is required.");
      return;
    }

    if (!videoForm.video_url.trim()) {
      showNotification("error", "Video URL is required.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: videoForm.title.trim(),
        description: videoForm.description.trim(),
        video_url: videoForm.video_url.trim(),
        featured: videoForm.featured,
      };

      const result = videoForm.id
        ? await updateVideoReview(videoForm.id, payload)
        : await createVideoReview(payload);

      if (!result.ok) {
        showNotification("error", result.message || "Failed to save video review.");
        return;
      }

      showNotification("success", `Video review ${videoForm.id ? "updated" : "created"} successfully.`);
      setVideoModalOpen(false);
      setVideoForm(EMPTY_VIDEO_FORM);
      await loadReviews();
    } catch {
      showNotification("error", "Failed to save video review.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTextFeatured = async (item: TextReview) => {
    const result = await featureTextReview(item.id, !item.featured);
    if (!result.ok) {
      showNotification("error", result.message || "Failed to update featured status.");
      return;
    }
    showNotification("success", "Text review featured status updated.");
    await loadReviews();
  };

  const toggleVideoFeatured = async (item: VideoReview) => {
    const result = await featureVideoReview(item.id, !item.featured);
    if (!result.ok) {
      showNotification("error", result.message || "Failed to update featured status.");
      return;
    }
    showNotification("success", "Video review featured status updated.");
    await loadReviews();
  };

  const confirmDelete = (type: ReviewsTab, id: number, title: string) => {
    setDeleteModal({ isOpen: true, type, id, title });
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setIsLoading(true);

    try {
      const result =
        deleteModal.type === "text"
          ? await deleteTextReview(deleteModal.id)
          : await deleteVideoReview(deleteModal.id);

      if (!result.ok) {
        showNotification("error", result.message || "Failed to delete review.");
        return;
      }

      showNotification("success", "Review deleted successfully.");
      setDeleteModal({ isOpen: false, type: "text", id: null, title: "" });
      await loadReviews();
    } catch {
      showNotification("error", "Failed to delete review.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentCount = activeTab === "text" ? filteredTextReviews.length : filteredVideoReviews.length;
  const totalCount = activeTab === "text" ? textReviews.length : videoReviews.length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-xl md:text-2xl font-bold text-white">Client Reviews</h3>
        <button
          onClick={activeTab === "text" ? openNewTextModal : openNewVideoModal}
          className="w-full sm:w-auto py-3 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider transition-all hover:scale-105"
          style={{ backgroundColor: "#0094C8", color: "white" }}
          disabled={isLoading}
        >
          <Plus size={20} />
          {activeTab === "text" ? "Add Text Review" : "Add Video Review"}
        </button>
      </div>

      <div className="glass-card p-4 md:p-6 rounded-[2rem] border border-white/10 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("text")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "text" ? "bg-accent-primary text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Text Reviews ({textReviews.length})
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "video" ? "bg-accent-primary text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Video Reviews ({videoReviews.length})
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === "text" ? "Search by client or review text..." : "Search by title or description..."}
              className="w-full pl-4 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFeaturedOnly((prev) => !prev)}
              className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                featuredOnly ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" : "bg-white/5 text-white/70 border border-white/10"
              }`}
            >
              Featured Only
            </button>

            <div className="text-xs text-white/40 font-bold uppercase tracking-wider px-2">
              {currentCount}/{totalCount}
            </div>
          </div>
        </div>
      </div>

      {activeTab === "text" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTextReviews.map((review) => (
            <div key={review.id} className="glass-card p-6 rounded-[2rem] border border-white/10 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {review.company_logo ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={getMediaUrl(review.company_logo)}
                        alt={review.client_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center">
                      <span className="text-[16px] font-black text-white/50 uppercase tracking-widest">{review.client_name ? getInitials(review.client_name) : "CL"}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-lg font-bold text-white truncate">{review.client_name}</h4>
                    <p className="text-xs text-white/60 truncate">{review.designation || "No designation"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleTextFeatured(review)}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
                    title="Toggle featured"
                  >
                    <Star size={15} className={review.featured ? "fill-yellow-400 text-yellow-400" : ""} />
                  </button>
                  <button
                    onClick={() => openEditTextModal(review)}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
                    title="Edit"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => confirmDelete("text", review.id, review.client_name)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-300 hover:bg-red-500/20"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {renderStars(review.star_rating)}

              <p className="text-sm text-white/80 leading-relaxed line-clamp-4">{review.review_text}</p>

              <div className="flex items-center justify-end text-xs">
                <span className="text-white/40">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}

          {!isLoading && filteredTextReviews.length === 0 && (
            <div className="col-span-full text-center text-white/50 py-10">No text reviews found.</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVideoReviews.map((review) => {
            const youtubeId = review.video_url ? extractYouTubeId(review.video_url) : null;

            return (
              <div key={review.id} className="glass-card p-6 rounded-[2rem] border border-white/10 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-lg font-bold text-white truncate">{review.title}</h4>
                    <p className="text-xs text-white/60 truncate">YouTube URL</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVideoFeatured(review)}
                      className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
                      title="Toggle featured"
                    >
                      <Star size={15} className={review.featured ? "fill-yellow-400 text-yellow-400" : ""} />
                    </button>
                    <button
                      onClick={() => openEditVideoModal(review)}
                      className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => confirmDelete("video", review.id, review.title)}
                      className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-300 hover:bg-red-500/20"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-white/80 leading-relaxed line-clamp-3">{review.description || "No description"}</p>

                <div className="flex items-center gap-2">
                  {review.featured && <span className="text-xs text-yellow-300">Featured</span>}
                </div>

                <div className="flex items-center justify-between gap-3">
                  {youtubeId ? (
                    <button
                      onClick={() => openVideoPlayer(youtubeId, review.title)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-primary text-white text-sm font-semibold hover:bg-accent-primary/80 transition-all active:scale-95"
                    >
                      <Play size={14} />
                      Preview
                    </button>
                  ) : (
                    <span className="text-xs text-white/40 font-medium italic">No playable source</span>
                  )}

                  {review.video_url && (
                    <button
                      onClick={() => window.open(review.video_url as string, "_blank", "noopener,noreferrer")}
                      className="inline-flex items-center gap-1 text-xs text-accent-primary hover:text-accent-primary/80"
                    >
                      Open URL <ExternalLink size={12} />
                    </button>
                  )}

                  <span className="text-xs text-white/40 ml-auto">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}

          {!isLoading && filteredVideoReviews.length === 0 && (
            <div className="col-span-full text-center text-white/50 py-10">No video reviews found.</div>
          )}
        </div>
      )}

      {/* Text Review Modal */}
      <AnimatePresence>
        {textModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setTextModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-2xl bg-background border border-white/10 rounded-[2rem] p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-white">{textForm.id ? "Edit Text Review" : "Add Text Review"}</h4>
                <button
                  onClick={() => setTextModalOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div data-lenis-prevent className="space-y-5 max-h-[65vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Client Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={textForm.client_name}
                      onChange={(e) => setTextForm({ ...textForm, client_name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-accent-primary focus:bg-white/10 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Designation (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. CEO at Company"
                      value={textForm.designation}
                      onChange={(e) => setTextForm({ ...textForm, designation: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-accent-primary focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Review Text *</label>
                  <textarea
                    rows={4}
                    placeholder="What did they say?"
                    value={textForm.review_text}
                    onChange={(e) => setTextForm({ ...textForm, review_text: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 resize-none focus:outline-none focus:border-accent-primary focus:bg-white/10 transition-all"
                  />
                </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center justify-between">
                      Star Rating * 
                      <span className="text-yellow-400 flex items-center gap-1"><Star size={12} className="fill-current"/>{textForm.star_rating}</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={textForm.star_rating}
                      onChange={(e) => setTextForm({ ...textForm, star_rating: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-primary focus:bg-white/10 transition-all"
                    />
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Company Logo (Optional)</label>
                    <label className="flex items-center gap-3 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/70 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all">
                      <Upload size={18} className="text-accent-primary" />
                      <span className="text-sm truncate">
                        {textForm.company_logo ? textForm.company_logo.name : (textForm.id ? "Replace existing logo" : "Upload image...")}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setTextForm({ ...textForm, company_logo: e.target.files?.[0] || null })}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <label className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={textForm.featured}
                        onChange={(e) => setTextForm({ ...textForm, featured: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-white/10 rounded-full peer peer-checked:bg-accent-primary transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Featured Review</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setTextModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={submitTextReview}
                  className="px-5 py-3 rounded-xl bg-accent-primary text-white font-semibold"
                  disabled={isLoading}
                >
                  {textForm.id ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Review Modal */}
      <AnimatePresence>
        {videoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-2xl bg-background border border-white/10 rounded-[2rem] p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-white">{videoForm.id ? "Edit Video Review" : "Add Video Review"}</h4>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div data-lenis-prevent className="space-y-5 max-h-[65vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Video Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Product Demo Highlights"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-accent-primary focus:bg-white/10 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Description (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Short description of the video content..."
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 resize-none focus:outline-none focus:border-accent-primary focus:bg-white/10 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">YouTube Video URL *</label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoForm.video_url}
                    onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-accent-primary focus:bg-white/10 transition-all"
                  />
                </div>

                <label className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={videoForm.featured}
                      onChange={(e) => setVideoForm({ ...videoForm, featured: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-white/10 rounded-full peer peer-checked:bg-accent-primary transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                  </div>
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Featured Review</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={submitVideoReview}
                  className="px-5 py-3 rounded-xl bg-accent-primary text-white font-semibold"
                  disabled={isLoading}
                >
                  {videoForm.id ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDeleteModal({ isOpen: false, type: "text", id: null, title: "" })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-background border border-white/10 rounded-[2rem] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-xl font-bold text-white mb-3">Delete Review</h4>
              <p className="text-white/70 mb-6">
                Are you sure you want to delete <span className="text-white font-semibold">{deleteModal.title}</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, type: "text", id: null, title: "" })}
                  className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-3 rounded-xl bg-red-500 text-white font-semibold"
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
