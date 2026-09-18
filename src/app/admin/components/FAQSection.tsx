"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit3, X, Save, ChevronDown, ChevronUp, Eye, EyeOff, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, Calendar, Star, Mail, MailOpen, CheckCircle, XCircle } from "lucide-react";
import { FAQItem, DeleteModal } from "./types";
import { createFAQ, updateFAQ as updateFAQApi, featureFAQ, readFAQ, updateFAQAnswered } from "@/lib/admin-auth/server";

interface FAQSectionProps {
    faqs: FAQItem[];
    setFaqs: (faqs: FAQItem[]) => void;
    deleteModal: DeleteModal;
    setDeleteModal: (modal: DeleteModal) => void;
    showNotification: (type: 'success' | 'error', message: string) => void;
}

export default function FAQSection({
    faqs,
    setFaqs,
    deleteModal,
    setDeleteModal,
    showNotification
}: FAQSectionProps) {
    const [addFAQModal, setAddFAQModal] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<string>('');
    const [newFAQ, setNewFAQ] = useState({
        question: '',
        answer: '',
        is_answered: true,
        is_read: false,
        is_featured: true
    });

    // Filter and Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<'createdAt' | 'viewed' | 'displayed' | 'answered'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterStatus, setFilterStatus] = useState<'all' | 'displayed' | 'hidden' | 'answered' | 'notAnswered' | 'seen' | 'unseen'>('all');

    // Ref for filter dropdown
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
                setShowFilters(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const closeAddFAQModal = () => {
        setAddFAQModal(false);
        setNewFAQ({ question: '', answer: '', is_answered: true, is_read: false, is_featured: true });
    };

    const openEditFAQModal = (faqId: string) => {
        const faq = faqs.find(f => f.id === faqId);
        if (faq) {
            setEditingFAQ(faqId);
            setNewFAQ({
                question: faq.question,
                answer: faq.answer,
                is_answered: faq.is_answered,
                is_read: faq.is_read,
                is_featured: faq.is_featured
            });
            setAddFAQModal(true);
        }
    };

    const addFAQ = async () => {
        if (newFAQ.question.trim() && newFAQ.answer.trim()) {
            const result = await createFAQ({
                question: newFAQ.question,
                answer: newFAQ.answer,
                is_featured: newFAQ.is_featured,
                is_answered: newFAQ.is_answered,
                is_read: newFAQ.is_read
            });

            if (result.ok) {
                // In a real app we'd refresh the whole list from parent
                // For now, let's just add it to local state to show immediate feedback if needed, 
                // but usually we call a refresh function.
                // Since setFaqs is passed down, we can update it.
                // However, the backend returns the new object.
                const newObj = result.data;
                setFaqs([...faqs, newObj]);
                closeAddFAQModal();
                showNotification('success', 'FAQ added successfully!');
            } else {
                showNotification('error', result.message || 'Failed to add FAQ');
            }
        }
    };

    const updateFAQ = async () => {
        if (newFAQ.question.trim() && newFAQ.answer.trim() && editingFAQ) {
            const result = await updateFAQApi(editingFAQ, {
                question: newFAQ.question,
                answer: newFAQ.answer,
                is_answered: newFAQ.is_answered,
                is_featured: newFAQ.is_featured,
                is_read: newFAQ.is_read
            });

            if (result.ok) {
                setFaqs(faqs.map(faq =>
                    faq.id === editingFAQ
                        ? { ...faq, ...result.data }
                        : faq
                ));
                closeAddFAQModal();
                setEditingFAQ('');
                showNotification('success', 'FAQ updated successfully!');
            } else {
                showNotification('error', result.message || 'Failed to update FAQ');
            }
        }
    };

    const toggleFAQFeatured = async (faqId: string) => {
        const faq = faqs.find(f => f.id === faqId);
        if (!faq) return;
        
        const result = await featureFAQ(faqId, !faq.is_featured);
        if (result.ok) {
            setFaqs(faqs.map(f =>
                f.id === faqId
                    ? { ...f, is_featured: !f.is_featured }
                    : f
            ));
            showNotification('success', 'FAQ featured status updated!');
        } else {
            showNotification('error', result.message || 'Failed to update featured status');
        }
    };

    const toggleFAQAnswered = async (faqId: string) => {
        const faq = faqs.find(f => f.id === faqId);
        if (!faq) return;

        const result = await updateFAQAnswered(faqId, !faq.is_answered);
        if (result.ok) {
            setFaqs(faqs.map(f =>
                f.id === faqId
                    ? { ...f, is_answered: !f.is_answered }
                    : f
            ));
            showNotification('success', 'FAQ answered status updated!');
        } else {
            showNotification('error', result.message || 'Failed to update answered status');
        }
    };

    const toggleFAQRead = async (faqId: string) => {
        const faq = faqs.find(f => f.id === faqId);
        if (!faq) return;

        const result = await readFAQ(faqId, !faq.is_read);
        if (result.ok) {
            setFaqs(faqs.map(f =>
                f.id === faqId
                    ? { ...f, is_read: !f.is_read }
                    : f
            ));
            showNotification('success', 'FAQ read status updated!');
        } else {
            showNotification('error', result.message || 'Failed to update read status');
        }
    };

    // Filter and Sort Logic
    const filteredAndSortedFaqs = faqs
        .filter(faq => {
            // Search filter
            const matchesSearch = searchQuery === '' ||
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter
            const matchesFilter = filterStatus === 'all' ||
                (filterStatus === 'displayed' && faq.is_featured) ||
                (filterStatus === 'hidden' && !faq.is_featured) ||
                (filterStatus === 'answered' && faq.is_answered) ||
                (filterStatus === 'notAnswered' && !faq.is_answered) ||
                (filterStatus === 'seen' && faq.is_read) ||
                (filterStatus === 'unseen' && !faq.is_read);

            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'createdAt':
                    comparison = parseInt(a.id) - parseInt(b.id);
                    break;
                case 'viewed':
                    comparison = (a.is_read ? 1 : 0) - (b.is_read ? 1 : 0);
                    break;
                case 'displayed':
                    comparison = (a.is_featured ? 1 : 0) - (b.is_featured ? 1 : 0);
                    break;
                case 'answered':
                    comparison = (a.is_answered ? 1 : 0) - (b.is_answered ? 1 : 0);
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const confirmDelete = (id: string, title: string) => {
        setDeleteModal({
            isOpen: true,
            type: 'faq',
            id,
            title
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center shrink-0">
                        <CheckCircle size={20} className="text-accent-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white">Frequently Asked Questions</h3>
                        <p className="text-white/60 text-xs md:text-sm mt-1">Manage your FAQ content and settings</p>
                    </div>
                </div>
                <button
                    onClick={() => setAddFAQModal(true)}
                    className="w-full sm:w-auto py-3 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider transition-all hover:scale-105"
                    style={{ backgroundColor: '#0094C8', color: 'white' }}
                >
                    <Plus size={20} />
                    Add FAQ
                </button>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 md:p-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search FAQs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-accent-primary transition-colors text-sm"
                    />
                </div>

                {/* Filter and Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Filter Dropdown */}
                        <div className="relative flex-1 sm:flex-none" ref={filterDropdownRef}>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full flex items-center justify-between sm:justify-start gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Filter size={14} />
                                    <span className="text-sm truncate max-w-[80px] sm:max-w-none">
                                        {filterStatus === 'all' && 'All'}
                                        {filterStatus === 'displayed' && 'Public'}
                                        {filterStatus === 'hidden' && 'Hidden'}
                                        {filterStatus === 'answered' && 'Answered'}
                                        {filterStatus === 'notAnswered' && 'Pending'}
                                        {filterStatus === 'seen' && 'Read'}
                                        {filterStatus === 'unseen' && 'Unread'}
                                    </span>
                                </div>
                                <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>

                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full left-0 mt-2 w-48 bg-background border border-white/10 rounded-lg shadow-lg z-50 overflow-hidden"
                                >
                                    <div className="p-1">
                                        {[
                                            { value: 'all', label: 'All FAQs', icon: Filter },
                                            { value: 'displayed', label: 'Public', icon: Star },
                                            { value: 'hidden', label: 'Hidden', icon: EyeOff },
                                            { value: 'answered', label: 'Answered', icon: CheckCircle },
                                            { value: 'notAnswered', label: 'Pending', icon: XCircle },
                                            { value: 'seen', label: 'Read', icon: MailOpen },
                                            { value: 'unseen', label: 'Unread', icon: Mail }
                                        ].map((option) => {
                                            const Icon = option.icon;
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setFilterStatus(option.value as any);
                                                        setShowFilters(false);
                                                    }}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors ${filterStatus === option.value
                                                        ? 'bg-accent-primary/20 text-accent-primary'
                                                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                >
                                                    <Icon size={14} />
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Sort Controls */}
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="flex-1 sm:flex-none flex items-center justify-between sm:justify-start gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <ArrowUpDown size={14} />
                                <span className="text-sm">Sort</span>
                            </div>
                            {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </button>
                    </div>

                    {/* Desktop Legend */}
                    <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/20">
                        <div className="flex items-center gap-1"><Star size={10} /> Public</div>
                        <div className="flex items-center gap-1"><MailOpen size={10} /> Read</div>
                    </div>

                    {/* Results Count */}
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest hidden sm:block ml-auto">
                        {filteredAndSortedFaqs.length} / {faqs.length} FAQs
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {filteredAndSortedFaqs.map((faq) => (
                    <div key={faq.id} className="glass-card p-4 md:p-6 rounded-[2rem] border border-white/10">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                                    <h4 className="text-base md:text-lg font-bold text-white">{faq.question}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${faq.is_featured
                                            ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                                            : 'bg-white/5 text-white/40 border border-white/10'
                                            }`}>
                                            {faq.is_featured ? 'Public' : 'Hidden'}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${faq.is_answered
                                            ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
                                            : 'bg-orange-400/10 text-orange-400 border border-orange-400/20'
                                            }`}>
                                            {faq.is_answered ? 'Answered' : 'Pending'}
                                        </span>
                                        {!faq.is_read && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] md:text-xs font-black bg-accent-primary text-white animate-pulse">
                                                NEW!
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-white/60 text-sm leading-relaxed">{faq.answer || "--- No Answer Yet ---"}</p>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-start">
                                <button
                                    onClick={() => toggleFAQRead(faq.id)}
                                    title={faq.is_read ? "Mark as unread" : "Mark as read"}
                                    className={`p-3 rounded-xl transition-all ${faq.is_read 
                                        ? 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10' 
                                        : 'bg-accent-primary/20 text-accent-primary hover:bg-accent-primary hover:text-white'}`}
                                >
                                    {faq.is_read ? <MailOpen size={16} /> : <Mail size={16} />}
                                </button>
                                <button
                                    onClick={() => toggleFAQFeatured(faq.id)}
                                    title={faq.is_featured ? "Hide from public" : "Show on public"}
                                    className={`p-3 rounded-xl transition-all ${faq.is_featured 
                                        ? 'bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400 hover:text-black' 
                                        : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
                                >
                                    <Star size={16} fill={faq.is_featured ? "currentColor" : "none"} />
                                </button>
                                <button
                                    onClick={() => openEditFAQModal(faq.id)}
                                    className="p-3 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all font-bold"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => confirmDelete(faq.id, faq.question)}
                                    className="p-3 rounded-xl bg-red-400/10 text-red-400 hover:text-white hover:bg-red-400 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit FAQ Modal */}
            <AnimatePresence>
                {addFAQModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
                        onClick={closeAddFAQModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-background border border-white/10 rounded-[2rem] p-4 md:p-8 w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-10 py-2">
                                <h3 className="text-xl md:text-2xl font-bold text-white">
                                    {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
                                </h3>
                                <button
                                    onClick={closeAddFAQModal}
                                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">Question</label>
                                    <input
                                        type="text"
                                        value={newFAQ.question}
                                        onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-primary transition-colors"
                                        placeholder="Enter your question..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">Answer</label>
                                    <textarea
                                        value={newFAQ.answer}
                                        onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-primary transition-colors resize-none"
                                        rows={6}
                                        placeholder="Enter your answer..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">Status</label>
                                    <button
                                        type="button"
                                        onClick={() => setNewFAQ({ ...newFAQ, is_answered: !newFAQ.is_answered })}
                                        className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${newFAQ.is_answered
                                            ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30 hover:bg-blue-400/30'
                                            : 'bg-orange-400/20 text-orange-400 border border-orange-400/30 hover:bg-orange-400/30'
                                            }`}
                                    >
                                        {newFAQ.is_answered ? '✓ Answered' : '? Not Answered'}
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">Visibility</label>
                                    <button
                                        type="button"
                                        onClick={() => setNewFAQ({ ...newFAQ, is_featured: !newFAQ.is_featured })}
                                        className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${newFAQ.is_featured
                                            ? 'bg-green-400/20 text-green-400 border border-green-400/30 hover:bg-green-400/30'
                                            : 'bg-gray-400/20 text-gray-400 border border-gray-400/30 hover:bg-gray-400/30'
                                            }`}
                                    >
                                        {newFAQ.is_featured ? '👁 Displayed' : '👁‍🗨 Hidden'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 sticky bottom-0 bg-background/80 backdrop-blur-md z-10 py-4 border-t border-white/5 mx-[-1rem] px-4 md:mx-[-2rem] md:px-8">
                                <button
                                    onClick={closeAddFAQModal}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingFAQ ? updateFAQ : addFAQ}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent-primary text-white hover:bg-accent-primary/80 transition-all font-bold shadow-lg shadow-accent-primary/20"
                                >
                                    {editingFAQ ? 'Update FAQ' : 'Add FAQ'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
