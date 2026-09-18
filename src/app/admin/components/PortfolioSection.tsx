"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Eye,
  EyeOff,
  Play,
  ImageIcon,
  Upload,
  Search,
  Tag,
  Filter,
  ChevronDown,
  Star,
  Link,
  CalendarClock,
  Check,
} from "lucide-react";
import Image from "next/image";
import { PortfolioItem, DeleteModal } from "./types";
import {
  createTag,
  createWork,
  deleteWork,
  featureWork,
  listTags,
  updateWork,
} from "@/lib/admin-auth/server";
import {
  buildWorkPayload,
  normalizeTags,
  TagResponse,
  WorkFormPayload,
} from "@/lib/works/contract";
import { getMediaUrl } from "@/lib/admin-auth/utils";

interface PortfolioSectionProps {
  portfolio: PortfolioItem[];
  setPortfolio: (portfolio: PortfolioItem[]) => void;
  setDeleteModal: (modal: DeleteModal) => void;
  showNotification: (type: "success" | "error", message: string) => void;
  openVideoPlayer: (videoUrl: string, title: string) => void;
  refreshPortfolio: () => Promise<PortfolioItem[]>;
}

type PortfolioFilter = "all" | "public" | "private";

interface WorkFormState {
  title: string;
  description: string;
  video_url: string;
  tag_ids: number[];
  publish_date: string;
  thumbnail: File | null;
  visibility: boolean;
  is_featured: boolean;
}

interface EnrichedTag extends TagResponse {
  color: string;
  count: number;
}

const TAG_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-sky-500",
] as const;

function getInitialDateTimeLocal(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toDateTimeLocal(isoDate: string | null): string {
  if (!isoDate) return "";

  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "";

  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toIsoDate(localDateTime: string): string | null {
  if (!localDateTime.trim()) return null;

  const parsed = new Date(localDateTime);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString();
}

function formatDateTime(isoDate: string | null): string {
  if (!isoDate) return "Not scheduled";

  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "Invalid date";

  return parsed.toLocaleString();
}

function parseErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

const EMPTY_FORM_STATE: WorkFormState = {
  title: "",
  description: "",
  video_url: "",
  tag_ids: [],
  publish_date: getInitialDateTimeLocal(),
  thumbnail: null,
  visibility: true,
  is_featured: true,
};

export default function PortfolioSection({
  portfolio,
  setPortfolio,
  setDeleteModal,
  showNotification,
  openVideoPlayer,
  refreshPortfolio,
}: PortfolioSectionProps) {
  const [addProjectModal, setAddProjectModal] = useState(false);
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);

  const [availableTags, setAvailableTags] = useState<TagResponse[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<PortfolioFilter>("all");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [showTagManager, setShowTagManager] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [newTagName, setNewTagName] = useState("");

  const [projectForm, setProjectForm] = useState<WorkFormState>(EMPTY_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<number | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const editingProject = useMemo(() => {
    if (editingProjectId === null) return null;
    return portfolio.find((item) => item.id === editingProjectId) || null;
  }, [editingProjectId, portfolio]);

  const tagsWithMeta = useMemo<EnrichedTag[]>(() => {
    const usage = new Map<number, number>();

    portfolio.forEach((work) => {
      work.tags.forEach((tag) => {
        usage.set(tag.id, (usage.get(tag.id) || 0) + 1);
      });
    });

    return availableTags.map((tag, idx) => ({
      ...tag,
      color: TAG_COLORS[idx % TAG_COLORS.length],
      count: usage.get(tag.id) || 0,
    }));
  }, [availableTags, portfolio]);

  const filteredTags = useMemo(() => {
    const query = tagSearch.trim().toLowerCase();

    if (!query) return tagsWithMeta;

    return tagsWithMeta.filter((tag) =>
      tag.name.toLowerCase().includes(query)
    );
  }, [tagSearch, tagsWithMeta]);

  const quickFilterTags = useMemo(() => tagsWithMeta.slice(0, 6), [tagsWithMeta]);

  const filteredPortfolio = useMemo(() => {
    return portfolio.filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.video_url.toLowerCase().includes(query);

      const matchesVisibility =
        filterStatus === "all" ||
        (filterStatus === "public" && item.visibility) ||
        (filterStatus === "private" && !item.visibility);

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tagId) => item.tags.some((tag) => tag.id === tagId));

      return matchesSearch && matchesVisibility && matchesTags;
    });
  }, [portfolio, searchQuery, filterStatus, selectedTags]);

  const loadTags = useCallback(async () => {
    if (isLoadingTags) return;
    setIsLoadingTags(true);
    try {
      const result = await listTags();
      if (!result.ok) {
        showNotification("error", result.message || "Failed to load tags.");
        return;
      }

      setAvailableTags(normalizeTags(result.data));
    } catch (error) {
      showNotification("error", parseErrorMessage(error, "Failed to load tags."));
    } finally {
      setIsLoadingTags(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const resetForm = () => {
    setProjectForm({ ...EMPTY_FORM_STATE, publish_date: getInitialDateTimeLocal() });
    setTagSearch("");
    setNewTagName("");
    setShowTagManager(false);
  };

  const closeAddProjectModal = () => {
    setAddProjectModal(false);
    resetForm();
  };

  const closeEditProjectModal = () => {
    setEditProjectModal(false);
    setEditingProjectId(null);
    resetForm();
  };

  const openEditProjectModal = (projectId: number) => {
    const project = portfolio.find((item) => item.id === projectId);
    if (!project) return;

    setEditingProjectId(projectId);
    setProjectForm({
      title: project.title,
      description: project.description,
      video_url: project.video_url,
      tag_ids: project.tags.map((tag) => tag.id),
      publish_date: toDateTimeLocal(project.publish_date),
      thumbnail: null,
      visibility: project.visibility,
      is_featured: project.is_featured,
    });
    setEditProjectModal(true);
  };

  const toggleFormTag = (tagId: number) => {
    setProjectForm((prev) => {
      const alreadySelected = prev.tag_ids.includes(tagId);
      return {
        ...prev,
        tag_ids: alreadySelected
          ? prev.tag_ids.filter((id) => id !== tagId)
          : [...prev.tag_ids, tagId],
      };
    });
  };

  const validateForm = (): string | null => {
    if (!projectForm.title.trim()) return "Project title is required.";
    if (!projectForm.video_url.trim()) return "YouTube video URL is required.";
    if (projectForm.publish_date && !toIsoDate(projectForm.publish_date)) {
      return "Publish date format is invalid.";
    }

    return null;
  };

  const submitCreateProject = async () => {
    const validationError = validateForm();
    if (validationError) {
      showNotification("error", validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: WorkFormPayload = {
        title: projectForm.title.trim(),
        description: projectForm.description.trim(),
        video_url: projectForm.video_url.trim(),
        publish_date: toIsoDate(projectForm.publish_date),
        visibility: projectForm.visibility,
        is_featured: projectForm.is_featured,
        tags: projectForm.tag_ids,
        thumbnail: projectForm.thumbnail,
      };

      const createResult = await createWork(buildWorkPayload(payload));
      if (!createResult.ok) {
        showNotification("error", createResult.message || "Failed to create project.");
        return;
      }

      const updatedWorks = await refreshPortfolio();
      setPortfolio(updatedWorks);
      closeAddProjectModal();
      showNotification("success", "Project created successfully.");
    } catch (error) {
      showNotification(
        "error",
        parseErrorMessage(error, "Failed to create project.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitUpdateProject = async () => {
    if (editingProjectId === null) return;

    const validationError = validateForm();
    if (validationError) {
      showNotification("error", validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: WorkFormPayload = {
        title: projectForm.title.trim(),
        description: projectForm.description.trim(),
        video_url: projectForm.video_url.trim(),
        publish_date: toIsoDate(projectForm.publish_date),
        tags: projectForm.tag_ids,
        thumbnail: projectForm.thumbnail,
      };

      const updateResult = await updateWork(editingProjectId, buildWorkPayload(payload));
      if (!updateResult.ok) {
        showNotification("error", updateResult.message || "Failed to update project.");
        return;
      }

      const featureResult = await featureWork(editingProjectId, {
        visibility: projectForm.visibility,
        is_featured: projectForm.is_featured,
      });

      if (!featureResult.ok) {
        showNotification(
          "error",
          featureResult.message || "Project updated, but flags failed to update."
        );
      }

      const updatedWorks = await refreshPortfolio();
      setPortfolio(updatedWorks);
      closeEditProjectModal();
      showNotification("success", "Project updated successfully.");
    } catch (error) {
      showNotification(
        "error",
        parseErrorMessage(error, "Failed to update project.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProjectVisibility = async (item: PortfolioItem) => {
    try {
      const result = await featureWork(item.id, { visibility: !item.visibility });
      if (!result.ok) {
        showNotification("error", result.message || "Failed to update visibility.");
        return;
      }

      const updatedWorks = await refreshPortfolio();
      setPortfolio(updatedWorks);
      showNotification("success", "Project visibility updated.");
    } catch (error) {
      showNotification(
        "error",
        parseErrorMessage(error, "Failed to update visibility.")
      );
    }
  };

  const toggleProjectFeatured = async (item: PortfolioItem) => {
    try {
      const result = await featureWork(item.id, { is_featured: !item.is_featured });
      if (!result.ok) {
        showNotification("error", result.message || "Failed to update featured status.");
        return;
      }

      const updatedWorks = await refreshPortfolio();
      setPortfolio(updatedWorks);
      showNotification("success", "Project featured status updated.");
    } catch (error) {
      showNotification(
        "error",
        parseErrorMessage(error, "Failed to update featured status.")
      );
    }
  };

  const confirmDelete = (id: number, title: string) => {
    setDeleteModal({
      isOpen: true,
      type: "portfolio",
      id,
      title,
    });
  };

  // Bulk Action Functions
  const toggleSelect = (id: number, index: number, isShiftKey: boolean) => {
    if (isShiftKey && lastSelectedId !== null) {
      const lastIndex = filteredPortfolio.findIndex(p => p.id === lastSelectedId);
      if (lastIndex !== -1) {
        const start = Math.min(index, lastIndex);
        const end = Math.max(index, lastIndex);
        const rangeIds = filteredPortfolio.slice(start, end + 1).map(p => p.id);
        
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          rangeIds.forEach(rid => newSet.add(rid));
          return Array.from(newSet);
        });
        setLastSelectedId(id);
        return;
      }
    }

    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    setLastSelectedId(id);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPortfolio.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPortfolio.map(p => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    setIsBulkDeleting(true);
    setShowBulkDeleteModal(false);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const id of selectedIds) {
        console.log(`Starting deletion of project ID: ${id}`);
        const result = await deleteWork(id);
        
        if (result.ok) {
          successCount++;
        } else {
          failCount++;
          console.error(`Failed to delete ID ${id}:`, result.message);
        }
        
        // Slightly longer delay for stability
        await new Promise(r => setTimeout(r, 200));
      }

      const updatedWorks = await refreshPortfolio();
      setPortfolio(updatedWorks);
      setSelectedIds([]);

      if (failCount === 0) {
        showNotification("success", `Successfully deleted ${successCount} projects.`);
      } else {
        showNotification("error", `Deleted ${successCount} projects, but ${failCount} failed. Please try again.`);
      }
    } catch (error: any) {
      console.error("Bulk deletion exception:", error);
      showNotification("error", `Critical error during deletion: ${error.message || "Unknown error"}`);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const createNewTagFromInput = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    if (availableTags.some((tag) => tag.name.toLowerCase() === trimmed.toLowerCase())) {
      showNotification("error", "Tag already exists.");
      return;
    }

    try {
      const result = await createTag({ name: trimmed });
      if (!result.ok) {
        showNotification("error", result.message || "Failed to create tag.");
        return;
      }

      await loadTags();
      setNewTagName("");
      setTagSearch("");
      showNotification("success", "Tag created successfully.");
    } catch (error) {
      showNotification("error", parseErrorMessage(error, "Failed to create tag."));
    }
  };

  const toggleSelectedFilterTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl md:text-2xl font-bold text-white">Portfolio Projects</h3>
          {filteredPortfolio.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              {selectedIds.length === filteredPortfolio.length ? "Deselect All" : `Select All (${filteredPortfolio.length})`}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => setShowBulkDeleteModal(true)}
                disabled={isBulkDeleting}
                className="flex-1 sm:flex-none py-3 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
              >
                {isBulkDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 size={20} />
                )}
                Delete ({selectedIds.length})
              </motion.button>
            )}
          </AnimatePresence>
          <button
            onClick={() => {
              resetForm();
              setAddProjectModal(true);
            }}
            className="flex-1 sm:flex-none py-3 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider transition-all hover:scale-105"
            style={{ backgroundColor: "#0094C8", color: "white" }}
          >
            <Plus size={20} />
            Add Project
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search projects by title, description, or video URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent-primary transition-colors"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors text-sm"
              >
                <Filter size={14} />
                <span>
                  {filterStatus === "all" && "All"}
                  {filterStatus === "public" && "Public"}
                  {filterStatus === "private" && "Private"}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {showFilters && (
                  <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setShowFilters(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-40 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden"
                    >
                      <div className="p-1 space-y-1">
                        {[
                          { value: "all", label: "All Projects", icon: Filter },
                          { value: "public", label: "Public", icon: Eye },
                          { value: "private", label: "Private", icon: EyeOff },
                        ].map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              onClick={() => {
                                setFilterStatus(option.value as PortfolioFilter);
                                setShowFilters(false);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                                filterStatus === option.value
                                  ? "bg-accent-primary/20 text-accent-primary"
                                  : "text-white/60 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <Icon size={14} />
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {quickFilterTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleSelectedFilterTag(tag.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                  selectedTags.includes(tag.id)
                    ? `${tag.color} text-white`
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>

          <div className="sm:ml-auto text-xs text-white/40 font-bold uppercase tracking-widest leading-none">
            {filteredPortfolio.length} / {portfolio.length} Projects
          </div>
        </div>
      </div>

      {filteredPortfolio.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/60">
          No projects found for the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolio.map((item) => (
            <div
              key={item.id}
              className={`glass-card p-6 rounded-[2rem] border relative group transition-all duration-300 ${
                selectedIds.includes(item.id) 
                  ? "border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary/30" 
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Selection Checkbox */}
              <div 
                className="absolute top-4 left-4 z-30"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => toggleSelect(item.id, filteredPortfolio.indexOf(item), e.shiftKey)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                    selectedIds.includes(item.id)
                      ? "bg-accent-primary border-accent-primary text-white"
                      : "bg-black/40 border-white/20 text-transparent hover:border-white/40"
                  }`}
                >
                  <Check size={14} strokeWidth={4} />
                </button>
              </div>
              <button
                onClick={(e) => {
                  if (e.shiftKey) {
                    toggleSelect(item.id, filteredPortfolio.indexOf(item), true);
                  } else {
                    openVideoPlayer(item.video_url, item.title);
                  }
                }}
                className="w-full text-left cursor-pointer mb-4"
                aria-label={`Play or Select ${item.title}`}
              >
                <div className="w-full h-48 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden">
                  {item.thumbnail ? (
                    <img
                      src={getMediaUrl(item.thumbnail)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon size={48} className="text-white/20" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={40} className="text-white" />
                  </div>
                </div>
              </button>

              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-lg font-bold text-white line-clamp-2">{item.title}</h4>
                {item.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                    <Star size={10} className="fill-yellow-300" /> Featured
                  </span>
                )}
              </div>

              <p className="text-sm text-white/60 mb-3 line-clamp-2">
                {item.description || "No description provided."}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {item.tags.length === 0 ? (
                  <span className="text-xs text-white/40">No tags</span>
                ) : (
                  item.tags.map((tag) => (
                    <span
                      key={`${item.id}-${tag.id}`}
                      className="px-2 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-xs"
                    >
                      {tag.name}
                    </span>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-white/40 mb-4">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock size={12} /> {formatDateTime(item.publish_date)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => toggleProjectVisibility(item)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    item.visibility
                      ? "bg-green-400/20 text-green-300 border border-green-400/30"
                      : "bg-gray-400/20 text-gray-300 border border-gray-400/30"
                  }`}
                >
                  {item.visibility ? "Public" : "Private"}
                </button>

                <button
                  onClick={() => toggleProjectFeatured(item)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    item.is_featured
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      : "bg-white/10 text-white/70 border border-white/20"
                  }`}
                >
                  {item.is_featured ? "Featured" : "Not Featured"}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditProjectModal(item.id)}
                  className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => confirmDelete(item.id, item.title)}
                  className="p-2 rounded-lg bg-red-400/10 text-red-400 hover:text-white hover:bg-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {addProjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl p-3 sm:p-4 overflow-y-auto"
            onClick={closeAddProjectModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative mx-auto my-1 sm:my-6 bg-background border border-white/10 rounded-[1.75rem] w-full max-w-4xl h-[min(92vh,920px)] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 px-4 sm:px-6 py-4 sm:py-5 border-b border-white/10 bg-background/95 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">Add New Project</h3>
                    <p className="text-xs sm:text-sm text-white/50 mt-1">
                      Create a project using backend-aligned fields.
                    </p>
                  </div>
                  <button
                    onClick={closeAddProjectModal}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div
                data-lenis-prevent
                data-lenis-prevent-wheel
                className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6"
              >
                <div className="space-y-6 pr-1 sm:pr-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-white/60 mb-2">Project Title</label>
                      <input
                        type="text"
                        value={projectForm.title}
                        onChange={(e) => setProjectForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-primary transition-colors"
                        placeholder="Enter project title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Publish Date</label>
                      <input
                        type="datetime-local"
                        value={projectForm.publish_date}
                        onChange={(e) => setProjectForm((prev) => ({ ...prev, publish_date: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-primary"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                      <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                        <input
                          type="checkbox"
                          checked={projectForm.visibility}
                          onChange={(e) =>
                            setProjectForm((prev) => ({ ...prev, visibility: e.target.checked }))
                          }
                        />
                        <span className="text-white text-sm">Visible to public</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                        <input
                          type="checkbox"
                          checked={projectForm.is_featured}
                          onChange={(e) =>
                            setProjectForm((prev) => ({ ...prev, is_featured: e.target.checked }))
                          }
                        />
                        <span className="text-white text-sm">Featured</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">YouTube Video URL</label>
                    <div className="relative">
                      <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="url"
                        value={projectForm.video_url}
                        onChange={(e) => setProjectForm((prev) => ({ ...prev, video_url: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-primary"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Tags</label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-white/5 border border-white/10 rounded-xl">
                        {projectForm.tag_ids.length === 0 ? (
                          <span className="text-white/40 text-sm">No tags selected.</span>
                        ) : (
                          projectForm.tag_ids.map((tagId) => {
                            const selectedTag = tagsWithMeta.find((tag) => tag.id === tagId);
                            if (!selectedTag) return null;

                            return (
                              <span
                                key={tagId}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-sm"
                              >
                                <Tag size={12} />
                                {selectedTag.name}
                                <button
                                  onClick={() => toggleFormTag(tagId)}
                                  className="ml-1 hover:text-red-400 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            );
                          })
                        )}
                      </div>

                      <button
                        onClick={() => setShowTagManager((prev) => !prev)}
                        className="w-full py-2 px-4 bg-accent-primary text-white rounded-xl hover:bg-accent-primary/80 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        {showTagManager ? "Hide Tag Manager" : "Show Tag Manager"}
                      </button>

                      <AnimatePresence>
                        {showTagManager && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1">
                                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                  <input
                                    type="text"
                                    placeholder="Search tags..."
                                    value={tagSearch}
                                    onChange={(e) => setTagSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent-primary"
                                  />
                                </div>
                                <input
                                  type="text"
                                  placeholder="Create tag"
                                  value={newTagName}
                                  onChange={(e) => setNewTagName(e.target.value)}
                                  className="sm:w-40 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent-primary"
                                />
                                <button
                                  onClick={createNewTagFromInput}
                                  disabled={!newTagName.trim()}
                                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>

                              {isLoadingTags ? (
                                <p className="text-sm text-white/60">Loading tags...</p>
                              ) : (
                                  <div
                                    data-lenis-prevent
                                    data-lenis-prevent-wheel
                                    className="max-h-52 overflow-y-auto space-y-2 pr-1"
                                  >
                                  {filteredTags.map((tag) => {
                                    const isSelected = projectForm.tag_ids.includes(tag.id);
                                    return (
                                      <button
                                        type="button"
                                        key={tag.id}
                                        className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
                                          isSelected
                                            ? "bg-accent-primary/20 border-accent-primary/50"
                                            : "bg-white/5 border-white/10 hover:border-white/20"
                                        }`}
                                        onClick={() => toggleFormTag(tag.id)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className={`w-3 h-3 rounded-full ${tag.color}`} />
                                          <span className="text-white text-sm">{tag.name}</span>
                                          <span className="text-white/40 text-xs">({tag.count})</span>
                                        </div>
                                        <span className="text-xs text-white/60">
                                          {isSelected ? "Selected" : "Add"}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Thumbnail</label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-accent-primary/50 transition-colors">
                      <Upload size={32} className="mx-auto mb-3 text-white/40" />
                      <p className="text-white/60 text-sm mb-2">Upload optional thumbnail image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setProjectForm((prev) => ({
                            ...prev,
                            thumbnail: e.target.files?.[0] || null,
                          }))
                        }
                        className="hidden"
                        id="new-thumbnail-upload"
                      />
                      <label
                        htmlFor="new-thumbnail-upload"
                        className="inline-flex px-4 py-2 bg-accent-primary text-white rounded-lg cursor-pointer hover:bg-accent-primary/80 transition-colors"
                      >
                        Choose Image
                      </label>
                      {projectForm.thumbnail ? (
                        <div className="mt-4 relative inline-block group">
                          <img
                            src={URL.createObjectURL(projectForm.thumbnail)}
                            alt="Thumbnail preview"
                            className="w-40 h-24 object-cover rounded-lg border border-white/20"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setProjectForm((prev) => ({ ...prev, thumbnail: null }));
                            }}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                          <p className="text-xs text-white/60 mt-2">{projectForm.thumbnail.name}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-white/40 mt-2 italic">
                          Optional: Backend will automatically extract from YouTube if left empty.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Description</label>
                    <textarea
                      value={projectForm.description}
                      onChange={(e) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-primary transition-colors resize-none"
                      rows={5}
                      placeholder="Describe your project..."
                    />
                  </div>
                </div>
              </div>

              <div className="shrink-0 px-4 sm:px-6 py-4 border-t border-white/10 bg-background/95 backdrop-blur">
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <button
                    onClick={closeAddProjectModal}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitCreateProject}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent-primary text-white hover:bg-accent-primary/80 transition-all font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Saving..." : "Add Project"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editProjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl p-3 sm:p-4 overflow-y-auto"
            onClick={closeEditProjectModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative mx-auto my-1 sm:my-6 bg-background border border-white/10 rounded-[1.75rem] w-full max-w-4xl h-[min(92vh,920px)] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 px-4 sm:px-6 py-4 sm:py-5 border-b border-white/10 bg-background/95 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">Edit Project</h3>
                    <p className="text-xs sm:text-sm text-white/50 mt-1">
                      Update project details and publishing settings.
                    </p>
                  </div>
                  <button
                    onClick={closeEditProjectModal}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div
                data-lenis-prevent
                data-lenis-prevent-wheel
                className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6"
              >
                <div className="space-y-6 pr-1 sm:pr-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-white/60 mb-2">Project Title</label>
                      <input
                        type="text"
                        value={projectForm.title}
                        onChange={(e) => setProjectForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-primary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Publish Date</label>
                      <input
                        type="datetime-local"
                        value={projectForm.publish_date}
                        onChange={(e) => setProjectForm((prev) => ({ ...prev, publish_date: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-primary"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                      <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                        <input
                          type="checkbox"
                          checked={projectForm.visibility}
                          onChange={(e) =>
                            setProjectForm((prev) => ({ ...prev, visibility: e.target.checked }))
                          }
                        />
                        <span className="text-white text-sm">Visible to public</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                        <input
                          type="checkbox"
                          checked={projectForm.is_featured}
                          onChange={(e) =>
                            setProjectForm((prev) => ({ ...prev, is_featured: e.target.checked }))
                          }
                        />
                        <span className="text-white text-sm">Featured</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">YouTube Video URL</label>
                    <div className="relative">
                      <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="url"
                        value={projectForm.video_url}
                        onChange={(e) => setProjectForm((prev) => ({ ...prev, video_url: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Tags</label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-white/5 border border-white/10 rounded-xl">
                        {projectForm.tag_ids.length === 0 ? (
                          <span className="text-white/40 text-sm">No tags selected.</span>
                        ) : (
                          projectForm.tag_ids.map((tagId) => {
                            const selectedTag = tagsWithMeta.find((tag) => tag.id === tagId);
                            if (!selectedTag) return null;

                            return (
                              <span
                                key={tagId}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-sm"
                              >
                                <Tag size={12} />
                                {selectedTag.name}
                                <button
                                  onClick={() => toggleFormTag(tagId)}
                                  className="ml-1 hover:text-red-400 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            );
                          })
                        )}
                      </div>

                      <button
                        onClick={() => setShowTagManager((prev) => !prev)}
                        className="w-full py-2 px-4 bg-accent-primary text-white rounded-xl hover:bg-accent-primary/80 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        {showTagManager ? "Hide Tag Manager" : "Show Tag Manager"}
                      </button>

                      <AnimatePresence>
                        {showTagManager && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1">
                                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                  <input
                                    type="text"
                                    placeholder="Search tags..."
                                    value={tagSearch}
                                    onChange={(e) => setTagSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent-primary"
                                  />
                                </div>
                                <input
                                  type="text"
                                  placeholder="Create tag"
                                  value={newTagName}
                                  onChange={(e) => setNewTagName(e.target.value)}
                                  className="sm:w-40 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent-primary"
                                />
                                <button
                                  onClick={createNewTagFromInput}
                                  disabled={!newTagName.trim()}
                                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>

                              {isLoadingTags ? (
                                <p className="text-sm text-white/60">Loading tags...</p>
                              ) : (
                                <div
                                  data-lenis-prevent
                                  data-lenis-prevent-wheel
                                  className="max-h-52 overflow-y-auto space-y-2 pr-1"
                                >
                                  {filteredTags.map((tag) => {
                                    const isSelected = projectForm.tag_ids.includes(tag.id);
                                    return (
                                      <button
                                        type="button"
                                        key={tag.id}
                                        className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
                                          isSelected
                                            ? "bg-accent-primary/20 border-accent-primary/50"
                                            : "bg-white/5 border-white/10 hover:border-white/20"
                                        }`}
                                        onClick={() => toggleFormTag(tag.id)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className={`w-3 h-3 rounded-full ${tag.color}`} />
                                          <span className="text-white text-sm">{tag.name}</span>
                                          <span className="text-white/40 text-xs">({tag.count})</span>
                                        </div>
                                        <span className="text-xs text-white/60">
                                          {isSelected ? "Selected" : "Add"}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Thumbnail</label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-accent-primary/50 transition-colors">
                      <Upload size={32} className="mx-auto mb-3 text-white/40" />
                      <p className="text-white/60 text-sm mb-2">Upload optional thumbnail image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setProjectForm((prev) => ({
                            ...prev,
                            thumbnail: e.target.files?.[0] || null,
                          }))
                        }
                        className="hidden"
                        id="edit-thumbnail-upload"
                      />
                      <label
                        htmlFor="edit-thumbnail-upload"
                        className="inline-flex px-4 py-2 bg-accent-primary text-white rounded-lg cursor-pointer hover:bg-accent-primary/80 transition-colors"
                      >
                        Choose Image
                      </label>
                      {projectForm.thumbnail ? (
                        <div className="mt-4 relative inline-block group">
                          <img
                            src={URL.createObjectURL(projectForm.thumbnail)}
                            alt="Thumbnail preview"
                            className="w-40 h-24 object-cover rounded-lg border border-white/20"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setProjectForm((prev) => ({ ...prev, thumbnail: null }));
                            }}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                          <p className="text-xs text-white/60 mt-2">{projectForm.thumbnail.name}</p>
                        </div>
                      ) : editingProject?.thumbnail ? (
                        <div className="mt-4">
                          <div className="relative inline-block">
                            <img
                              src={getMediaUrl(editingProject.thumbnail)}
                              alt="Current thumbnail"
                              className="w-40 h-24 object-cover rounded-lg border border-white/20 opacity-60"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 px-2 py-1 rounded-md text-white/80">
                                Current
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-white/40 mt-2 italic">
                            Current thumbnail will be kept. Upload new one to replace.
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-white/40 mt-2 italic">
                          Optional: Backend will automatically extract from YouTube if left empty.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Description</label>
                    <textarea
                      value={projectForm.description}
                      onChange={(e) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-primary transition-colors resize-none"
                      rows={5}
                    />
                  </div>
                </div>
              </div>

              <div className="shrink-0 px-4 sm:px-6 py-4 border-t border-white/10 bg-background/95 backdrop-blur">
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <button
                    onClick={closeEditProjectModal}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitUpdateProject}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-accent-primary text-white rounded-xl hover:bg-accent-primary/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Saving..." : "Update Project"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulkDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            onClick={() => !isBulkDeleting && setShowBulkDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Delete Projects</h3>
              <p className="text-white/60 mb-8">
                You are about to delete <span className="text-white font-bold">{selectedIds.length}</span> projects. This action is permanent and cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-wider hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isBulkDeleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  disabled={isBulkDeleting}
                  className="w-full py-4 bg-white/5 text-white rounded-2xl font-black uppercase tracking-wider hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
