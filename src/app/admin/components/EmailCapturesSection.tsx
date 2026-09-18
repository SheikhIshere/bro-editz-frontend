"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, Mail, Calendar, Download, Filter, Search, Users, TrendingUp, ChevronDown, Shield, AlertTriangle, Check } from "lucide-react";
import { EmailCapture, DeleteModal } from "./types";
import { markEmailAsSpam, restoreEmailFromSpam, exportNewsletterPDF, downloadNewsletterPDF, listNewsletterSpamEmails } from "@/lib/admin-auth/server";

interface EmailCapturesSectionProps {
    emails: EmailCapture[];
    setEmails: (emails: EmailCapture[]) => void;
    deleteModal: DeleteModal;
    setDeleteModal: (modal: DeleteModal) => void;
    showNotification: (type: 'success' | 'error', message: string) => void;
}

interface SpamModal {
    isOpen: boolean;
    emails: EmailCapture[];
}

export default function EmailCapturesSection({
    emails,
    setEmails,
    deleteModal,
    setDeleteModal,
    showNotification
}: EmailCapturesSectionProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [spamModal, setSpamModal] = useState<SpamModal>({ isOpen: false, emails: [] });
    const [selectedSpamEmails, setSelectedSpamEmails] = useState<Set<string>>(new Set());

    const filteredEmails = emails.filter(email => {
        const matchesSearch = email.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = locationFilter === 'all' || email.ip_location === locationFilter;
        return matchesSearch && matchesLocation;
    });

    const uniqueLocations = Array.from(new Set(emails.map(email => email.ip_location)));

    const confirmDelete = (id: string, title: string) => {
        setDeleteModal({
            isOpen: true,
            type: 'email',
            id,
            title
        });
    };

    const openSpamModal = async () => {
        const result = await listNewsletterSpamEmails();
        if (result.ok) {
            setSpamModal({ isOpen: true, emails: result.data.data || result.data.results || result.data });
        } else {
            showNotification('error', 'Failed to fetch spam emails');
            setSpamModal({ isOpen: true, emails: [] });
        }
        setSelectedSpamEmails(new Set());
    };

    const toggleSpamSelection = (emailId: string) => {
        const newSelection = new Set(selectedSpamEmails);
        if (newSelection.has(emailId)) {
            newSelection.delete(emailId);
        } else {
            newSelection.add(emailId);
        }
        setSelectedSpamEmails(newSelection);
    };

    const markAsSpam = async () => {
        const selectedIds = Array.from(selectedSpamEmails);
        let successCount = 0;

        for (const id of selectedIds) {
            const result = await markEmailAsSpam(id);
            if (result.ok) successCount++;
        }

        if (successCount > 0) {
            const remainingEmails = emails.filter(email => !selectedSpamEmails.has(email.id));
            setEmails(remainingEmails);
            showNotification('success', `Marked ${successCount} email(s) as spam and removed`);
        } else {
            showNotification('error', 'Failed to mark emails as spam');
        }

        setSpamModal({ isOpen: false, emails: [] });
        setSelectedSpamEmails(new Set());
    };

    const selectAllEmails = () => {
        const allEmailIds = new Set(spamModal.emails.map(email => email.id));
        setSelectedSpamEmails(allEmailIds);
    };

    const deselectAllEmails = () => {
        setSelectedSpamEmails(new Set());
    };

    const restoreEmails = async () => {
        const selectedIds = Array.from(selectedSpamEmails);
        let successCount = 0;

        for (const id of selectedIds) {
            const result = await restoreEmailFromSpam(id);
            if (result.ok) successCount++;
        }

        if (successCount > 0) {
            showNotification('success', `Restored ${successCount} email(s) successfully`);
            // Refresh main list
            window.location.reload(); // Simple way to refresh or we could pass a refresh function
        } else {
            showNotification('error', 'Failed to restore emails');
        }

        setSpamModal({ isOpen: false, emails: [] });
        setSelectedSpamEmails(new Set());
    };

    const exportEmails = async () => {
        // First try backend PDF export
        const exportResult = await exportNewsletterPDF();
        if (exportResult.ok) {
            showNotification('success', 'PDF Export generated! Downloading...');
            
            // Wait a moment for the PDF to be generated, then download
            setTimeout(async () => {
                const downloadResult = await downloadNewsletterPDF();
                if (downloadResult.ok && downloadResult.data) {
                    // Handle blob data on client side
                    const blob = new Blob([downloadResult.data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'newsletter_emails.pdf');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                    
                    showNotification('success', 'PDF downloaded successfully!');
                } else {
                    showNotification('error', downloadResult.message || 'Failed to download PDF');
                }
            }, 2000);
            return;
        }

        // Fallback to CSV export if PDF fails or as secondary option
        const csvContent = [
            ['Email', 'Location', 'Date'],
            ...filteredEmails.map(email => [
                email.email,
                email.ip_location || 'Unknown',
                new Date(email.subscribed_at).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'newsletter_emails.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showNotification('success', 'Email list exported as CSV (Backend PDF export was unavailable)');
    };

    const getLocationColor = (location: string) => {
        if (!location || location === 'Unknown') return 'bg-gray-400/20 text-gray-400 border border-gray-400/30';
        return 'bg-blue-400/20 text-blue-400 border border-blue-400/30';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Enhanced Header with Stats */}
            <div className="glass-card p-4 md:p-6 rounded-[2rem] border border-white/10">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                    <div className="w-full sm:w-auto">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Newsletter ({emails.length})</h3>
                        <p className="text-white/60 text-xs md:text-sm">Manage your email subscribers and export lists</p>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4 shrink-0">
                        <div className="text-center">
                            <div className="text-xl md:text-2xl font-bold text-accent-primary leading-tight">{emails.length}</div>
                            <div className="text-[10px] md:text-xs text-white/60 uppercase tracking-wider">Total</div>
                        </div>
                        <div className="h-8 w-px bg-white/10 mx-1 md:mx-2"></div>
                        <div className="text-center">
                            <div className="text-xl md:text-2xl font-bold text-green-400 leading-tight">{emails.length}</div>
                            <div className="text-[10px] md:text-xs text-white/60 uppercase tracking-wider">Active</div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
                            <input
                                type="text"
                                placeholder="Search emails..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-accent-primary transition-colors text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full sm:w-auto">
                            <button
                                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                                className="w-full sm:w-[150px] flex items-center justify-between gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors relative z-40"
                            >
                                <span className="text-sm truncate">
                                    {locationFilter === 'all' ? 'All Locations' : locationFilter}
                                </span>
                                <ChevronDown size={14} className={`text-white/40 transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showLocationDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowLocationDropdown(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full mt-2 right-0 w-full sm:w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
                                        >
                                            <div className="p-1">
                                                <button
                                                    onClick={() => {
                                                        setLocationFilter('all');
                                                        setShowLocationDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${locationFilter === 'all'
                                                        ? 'bg-accent-primary/20 text-accent-primary'
                                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    All Locations
                                                </button>
                                                {uniqueLocations.map(loc => (
                                                    <button
                                                        key={loc}
                                                        onClick={() => {
                                                            setLocationFilter(loc);
                                                            setShowLocationDropdown(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${locationFilter === loc
                                                            ? 'bg-accent-primary/20 text-accent-primary'
                                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                            }`}
                                                    >
                                                        {loc}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={exportEmails}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 pr-6 pl-5 py-2.5 bg-accent-primary text-white text-sm font-bold hover:bg-accent-primary/80 transition-all rounded-xl shadow-lg shadow-accent-primary/20"
                        >
                            <Download size={16} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Results Count */}
                {searchTerm || locationFilter !== 'all' ? (
                    <div className="mt-4 text-sm text-white/60">
                        Showing {filteredEmails.length} of {emails.length} subscribers
                    </div>
                ) : null}

                {/* Spam Management */}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-red-400/5 rounded-2xl border border-red-400/10">
                    <button
                        onClick={openSpamModal}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-400/10 border border-red-400/30 text-red-400 hover:bg-red-400/20 hover:text-red-300 transition-all rounded-xl text-sm font-bold uppercase tracking-wider"
                    >
                        <Shield size={16} />
                        Spam Management
                    </button>
                    <span className="text-white/40 text-[11px] md:text-sm text-center sm:text-left">
                        Filter and remove suspicious email subscribers
                    </span>
                </div>
            </div>

            {/* Enhanced Email Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmails.map((email) => (
                    <motion.div
                        key={email.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        className="glass-card p-4 md:p-5 rounded-[1.5rem] border border-white/10 hover:border-white/20 transition-all"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Mail size={18} className="text-accent-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-white font-bold text-sm truncate">
                                            {email.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest mt-0.5">
                                            <span>{email.ip_location}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                            <span>{new Date(email.subscribed_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => confirmDelete(email.id, email.email)}
                                className="p-2.5 rounded-xl bg-red-400/10 text-red-400 hover:text-white hover:bg-red-400 transition-all flex-shrink-0 border border-red-400/20"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {filteredEmails.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full text-center py-16"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <Mail size={32} className="text-white/30" />
                        </div>
                        <h4 className="text-xl font-semibold text-white mb-2">
                            {searchTerm || locationFilter !== 'all'
                                ? 'No subscribers found'
                                : 'No newsletter subscribers yet'
                            }
                        </h4>
                        <p className="text-white/60">
                            {searchTerm || locationFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Start building your email list with newsletter signups'
                            }
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Spam Modal */}
            <AnimatePresence>
                {spamModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setSpamModal({ isOpen: false, emails: [] })}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-background border border-white/10 rounded-[2rem] p-4 md:p-8 w-full max-w-4xl max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-8 py-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center shrink-0">
                                        <AlertTriangle size={20} className="text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-bold text-white">Spam Management</h3>
                                        <p className="text-white/60 text-xs md:text-sm">Select suspicious emails to mark as spam</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSpamModal({ isOpen: false, emails: [] })}
                                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Email List */}
                            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-2 mb-8">
                                {spamModal.emails.map((email) => (
                                    <div
                                        key={email.id}
                                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${selectedSpamEmails.has(email.id)
                                            ? 'bg-red-400/10 border-red-400/30'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                            }`}
                                        onClick={() => toggleSpamSelection(email.id)}
                                    >
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedSpamEmails.has(email.id)
                                            ? 'bg-accent-primary border-accent-primary text-white'
                                            : 'border-white/20 bg-white/5'
                                            }`}>
                                            {selectedSpamEmails.has(email.id) && <Check size={12} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white font-bold text-sm truncate">{email.email}</div>
                                            <div className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">
                                                {email.ip_location} • {new Date(email.subscribed_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {selectedSpamEmails.has(email.id) && (
                                            <span className="px-2 py-0.5 bg-red-400/20 text-red-400 text-[10px] font-bold rounded-full border border-red-400/30 uppercase tracking-wider">
                                                Remove
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 py-4 border-t border-white/5">
                                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto scrollbar-hide">
                                    {selectedSpamEmails.size > 0 ? (
                                        <button
                                            onClick={deselectAllEmails}
                                            className="whitespace-nowrap px-4 py-2 bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all rounded-xl text-xs font-bold"
                                        >
                                            Deselect All
                                        </button>
                                    ) : (
                                        <button
                                            onClick={selectAllEmails}
                                            className="whitespace-nowrap px-4 py-2 bg-accent-primary/10 border border-accent-primary/30 text-accent-primary hover:bg-accent-primary/20 transition-all rounded-xl text-xs font-bold"
                                        >
                                            Select All
                                        </button>
                                    )}
                                    <button
                                        onClick={restoreEmails}
                                        className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-green-400/10 border border-green-400/30 text-green-400 hover:bg-green-400/20 transition-all rounded-xl text-xs font-bold"
                                    >
                                        <Check size={14} />
                                        Restore
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => setSpamModal({ isOpen: false, emails: [] })}
                                        className="flex-1 sm:flex-none px-6 py-2.5 bg-white/10 text-white hover:bg-white/20 transition-all rounded-xl font-bold text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={markAsSpam}
                                        disabled={selectedSpamEmails.size === 0}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-red-400 text-white hover:bg-red-500 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-lg shadow-red-400/20"
                                    >
                                        <Shield size={16} />
                                        Remove ({selectedSpamEmails.size})
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}
