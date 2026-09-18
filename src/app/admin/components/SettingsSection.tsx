"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Search, Plus, X, Trash2, Hash, KeyRound, UserPlus, Check } from "lucide-react";
import ChangePasswordSection from "./ChangePasswordSection";
import CreateAdminSection from "./CreateAdminSection";
import {
  listTags,
  createTag as createTagApi,
  deleteTag as deleteTagApi,
} from "@/lib/admin-auth/server";
import { normalizeTags, TagResponse } from "@/lib/works/contract";

interface SettingsSectionProps {
    showNotification: (type: 'success' | 'error', message: string) => void;
}

type ManagedTag = TagResponse & { count: number };

function parseErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

export default function SettingsSection({ showNotification }: SettingsSectionProps) {
    const [activeSection, setActiveSection] = useState('tags');
    
    
    
    
    const settingsSections = [
        { id: 'tags', label: 'Tags', icon: Tag },
        { id: 'change-password', label: 'Change Password', icon: KeyRound },
        { id: 'create-admin', label: 'Create Admin', icon: UserPlus },
    ];

    // Tags Management State
    const [tags, setTags] = useState<ManagedTag[]>([]);
    const [tagSearch, setTagSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [isLoadingTags, setIsLoadingTags] = useState(false);
    const [isProcessingTag, setIsProcessingTag] = useState(false);
    const [deletingTagId, setDeletingTagId] = useState<number | null>(null);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [tagToDeleteConfirm, setTagToDeleteConfirm] = useState<number | null>(null);


    // Tag Management Functions
    const filteredTags = tags.filter((tag) => {
        const query = tagSearch.trim().toLowerCase();
        const description = (tag.description ?? "").toLowerCase();

        return (
            query.length === 0 ||
            tag.name.toLowerCase().includes(query) ||
            description.includes(query)
        );
    });

    const loadTags = useCallback(async () => {
        if (isLoadingTags) return; // Guard against multiple simultaneous calls
        setIsLoadingTags(true);
        try {
            const result = await listTags();
            if (!result.ok) {
                showNotification("error", result.message || "Failed to load tags.");
                return;
            }

            const normalized = normalizeTags(result.data).map((tag) => ({
                ...tag,
                count: 0,
            }));

            setTags(normalized);
        } catch (error) {
            showNotification(
                "error",
                parseErrorMessage(error, "Failed to load tags.")
            );
        } finally {
            setIsLoadingTags(false);
        }
    }, [showNotification]);

    useEffect(() => {
        loadTags();
    }, [loadTags]);

    const handleAddTag = async () => {
        const trimmed = newTagName.trim();
        if (!trimmed) return;

        setIsProcessingTag(true);
        // Do NOT set isLoadingTags(true) here to keep current tags visible during creation
        try {
            const result = await createTagApi({
                name: trimmed,
                description: `${trimmed} projects`,
            });

            if (!result.ok) {
                showNotification("error", result.message || "Failed to create tag.");
                return;
            }

            showNotification("success", "Tag created successfully.");
            setNewTagName("");
            setShowAddModal(false);
            
            // Silently refresh the list
            const refreshResult = await listTags();
            if (refreshResult.ok) {
                const normalized = normalizeTags(refreshResult.data).map((tag) => ({
                    ...tag,
                    count: 0,
                }));
                setTags(normalized);
            }
        } catch (error) {
            showNotification("error", parseErrorMessage(error, "Failed to create tag."));
        } finally {
            setIsProcessingTag(false);
        }
    };

    const handleDeleteTag = async (tagId: number) => {
        setIsProcessingTag(true);
        try {
            const result = await deleteTagApi(tagId);
            if (!result.ok) {
                showNotification("error", result.message || "Failed to delete tag.");
                return;
            }

            showNotification("success", "Tag deleted successfully.");
            await loadTags();
            setTagToDeleteConfirm(null);
        } catch (error) {
            showNotification("error", parseErrorMessage(error, "Failed to delete tag."));
        } finally {
            setIsProcessingTag(false);
        }
    };

    const handleBulkDeleteTags = async () => {
        if (selectedTagIds.length === 0) return;

        setIsBulkDeleting(true);
        setShowBulkDeleteModal(false);
        let successCount = 0;
        try {
            for (const id of selectedTagIds) {
                const result = await deleteTagApi(id);
                if (result.ok) successCount++;
                await new Promise(r => setTimeout(r, 100));
            }
            showNotification("success", `Successfully deleted ${successCount} tags.`);
            await loadTags();
            setSelectedTagIds([]);
        } catch (error) {
            showNotification("error", "An error occurred during bulk deletion.");
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleTagSelection = (id: number) => {
        setSelectedTagIds(prev => 
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-6 h-full"
        >
            {/* Settings Sidebar */}
            <div className="w-full lg:w-64 bg-background border-b lg:border-r border-white/10 p-4 lg:p-6">
                <h3 className="text-xl font-bold text-white mb-6 hidden lg:block">Settings</h3>
                <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-2 scrollbar-hide">
                    {settingsSections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        
                        return (
                            <motion.button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap lg:w-full ${
                                    isActive
                                        ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/20"
                                        : "text-text-muted hover:text-white hover:bg-white/5"
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon size={18} className="shrink-0" />
                                {section.label}
                            </motion.button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1">
                {activeSection === 'change-password' && (
                    <ChangePasswordSection showNotification={showNotification} />
                )}

                {activeSection === 'create-admin' && (
                    <CreateAdminSection showNotification={showNotification} />
                )}

                {/* Tags Section */}
                {activeSection === 'tags' && (
                    <div className="glass-card p-4 md:p-8 rounded-[2rem] border border-white/10">
                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center shrink-0">
                                <Tag size={24} className="text-accent-primary" />
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl md:text-2xl font-bold text-white">Tags Management</h3>
                                <p className="text-white/60 text-xs md:text-sm mt-1">Organize your content with custom tags</p>
                            </div>
                            <div className="flex-1" />
                            {selectedTagIds.length > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => setShowBulkDeleteModal(true)}
                                    disabled={isBulkDeleting}
                                    className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isBulkDeleting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : <Trash2 size={16} />}
                                    Delete ({selectedTagIds.length})
                                </motion.button>
                            )}
                        </div>

                        {/* Tags Grid Container - Permanently Mounted */}
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 md:p-6 mb-6">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Manage Tags</span>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Manage Tags</span>
                            </div>
                            </div>

                            <div 
                                data-lenis-prevent
                                className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide min-h-[400px]"
                            >
                                {isLoadingTags && tags.length === 0 ? (
                                    // Hardcoded 5-Item Skeleton for Initial Load
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <div 
                                            key={`skeleton-${i}`}
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded bg-white/10" />
                                                    <div className="h-4 w-24 bg-white/10 rounded" />
                                                </div>
                                                <div className="w-8 h-8 rounded bg-white/10" />
                                            </div>
                                            <div className="h-3 w-full bg-white/5 rounded mb-2 ml-8" />
                                            <div className="h-3 w-2/3 bg-white/5 rounded ml-8" />
                                        </div>
                                    ))
                                ) : filteredTags.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-white/20 italic">
                                        No tags found matching your search.
                                    </div>
                                ) : (
                                    filteredTags.map((tag) => {
                                        const isSelected = selectedTagIds.includes(tag.id);
                                        const isConfirming = tagToDeleteConfirm === tag.id;

                                        return (
                                            <motion.div
                                                layout
                                                key={tag.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={`bg-white/5 border rounded-xl p-4 relative group transition-all duration-300 ${
                                                    isSelected 
                                                        ? "border-red-500/50 bg-red-500/5" 
                                                        : "border-white/10 hover:border-white/20"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => toggleTagSelection(tag.id)}
                                                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                                                isSelected
                                                                    ? "bg-red-500 border-red-500 text-white"
                                                                    : "bg-black/40 border-white/20 text-transparent hover:border-white/40"
                                                            }`}
                                                        >
                                                            <Check size={12} strokeWidth={4} />
                                                        </button>
                                                        <div className="flex items-center gap-2">
                                                            <Hash size={14} className="text-white/60" />
                                                            <span className="font-medium text-white">{tag.name}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1">
                                                        {isConfirming ? (
                                                            <div className="flex items-center gap-1 bg-red-500/20 rounded-lg p-1">
                                                                <button
                                                                    onClick={() => handleDeleteTag(tag.id)}
                                                                    className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
                                                                >
                                                                    <Check size={12} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setTagToDeleteConfirm(null)}
                                                                    className="p-1.5 bg-white/10 text-white rounded-md hover:bg-white/20"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setTagToDeleteConfirm(tag.id)}
                                                                className="p-2 text-white/40 hover:text-red-400"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-white/60 mb-2 pl-8">
                                                    {tag.description ?? "No description provided."}
                                                </p>
                                                <div className="flex items-center justify-between pl-8">
                                                    <span className="text-xs text-white/40">
                                                        {tag.count ?? 0} projects
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Add Tag Button */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="w-full py-3 px-4 bg-accent-primary text-white rounded-xl hover:bg-accent-primary/80 transition-colors flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#0094C8' }}
                        >
                            <Plus size={16} />
                            Add New Tag
                        </button>

                        {/* Add Tag Modal */}
                        {showAddModal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                onClick={() => setShowAddModal(false)}
                            >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-background border border-white/10 rounded-[2rem] p-4 md:p-8 max-w-md w-full max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-10 py-2">
                                <h3 className="text-xl md:text-2xl font-bold text-white">Add New Tag</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white/60 mb-2">Tag Name</label>
                                            <input
                                                type="text"
                                                value={newTagName}
                                                onChange={(e) => setNewTagName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-primary transition-colors"
                                                placeholder="Enter tag name..."
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 sticky bottom-0 bg-background/80 backdrop-blur-md z-10 py-4 border-t border-white/5 mx-[-1rem] px-4 md:mx-[-2rem] md:px-8">
                                        <button
                                            onClick={() => setShowAddModal(false)}
                                            className="w-full sm:w-auto px-6 py-3 bg-white/10 text-white hover:bg-white/20 transition-all rounded-xl font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddTag}
                                            disabled={isProcessingTag || !newTagName.trim()}
                                            className="w-full sm:w-auto px-6 py-3 bg-accent-primary text-white rounded-xl hover:bg-accent-primary/80 transition-all font-bold shadow-lg shadow-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{ backgroundColor: '#0094C8' }}
                                        >
                                            {isProcessingTag ? "Saving..." : "Add Tag"}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

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
                            <h3 className="text-2xl font-black text-white mb-2">Delete Tags</h3>
                            <p className="text-white/60 mb-8">
                                You are about to delete <span className="text-white font-bold">{selectedTagIds.length}</span> tags. This will remove them from all projects.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleBulkDeleteTags}
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
