"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, Mail, Phone, MapPin, Calendar, Clock, CheckCircle, AlertCircle, Search, Filter, ChevronDown } from "lucide-react";
import { ContactLead, DeleteModal } from "./types";
import { updateContactStatus } from "@/lib/admin-auth/server";

interface ContactLeadsSectionProps {
    leads: ContactLead[];
    setLeads: (leads: ContactLead[]) => void;
    deleteModal: DeleteModal;
    setDeleteModal: (modal: DeleteModal) => void;
    showNotification: (type: 'success' | 'error', message: string) => void;
}

export default function ContactLeadsSection({
    leads,
    setLeads,
    deleteModal,
    setDeleteModal,
    showNotification
}: ContactLeadsSectionProps) {
    const [selectedLead, setSelectedLead] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'resolved'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState<string | null>(null);

    // Filter and search logic
    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = searchTerm === '' ||
                (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.message && lead.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.phone && lead.phone.includes(searchTerm)) ||
                (lead.ip_location && lead.ip_location.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [leads, searchTerm, statusFilter]);

    const updateLeadStatus = async (leadId: string, status: 'new' | 'contacted' | 'resolved') => {
        const result = await updateContactStatus(leadId, status);
        if (result.ok) {
            setLeads(leads.map(lead =>
                lead.id === leadId
                    ? { ...lead, status }
                    : lead
            ));
            showNotification('success', `Lead status updated to ${status}!`);
        } else {
            showNotification('error', result.message || 'Failed to update lead status');
        }
    };

    const confirmDelete = (id: string, title: string) => {
        setDeleteModal({
            isOpen: true,
            type: 'lead',
            id,
            title
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'bg-blue-400/20 text-blue-400 border border-blue-400/30';
            case 'contacted':
                return 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30';
            case 'resolved':
                return 'bg-green-400/20 text-green-400 border border-green-400/30';
            default:
                return 'bg-gray-400/20 text-gray-400 border border-gray-400/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'new':
                return <AlertCircle size={14} />;
            case 'contacted':
                return <Clock size={14} />;
            case 'resolved':
                return <CheckCircle size={14} />;
            default:
                return <Clock size={14} />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header with Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <h3 className="text-xl md:text-2xl font-bold text-white">Contact Leads ({leads.length})</h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 md:gap-4">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-white/60">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                        <span>New: {leads.filter(l => l.status === 'new').length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-white/60">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                        <span>Active: {leads.filter(l => l.status === 'contacted').length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-white/60">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                        <span>Resolved: {leads.filter(l => l.status === 'resolved').length}</span>
                    </div>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="glass-card p-4 md:p-6 rounded-[2rem] border border-white/10 relative z-[40]">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-accent-primary transition-colors text-sm"
                            />
                        </div>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative z-[50]">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors relative z-40"
                        >
                            <div className="flex items-center gap-2">
                                <Filter size={18} />
                                <span className="text-sm">
                                    {statusFilter === 'all' ? 'All Leads' :
                                        statusFilter === 'new' ? 'New' :
                                            statusFilter === 'contacted' ? 'Contacted' : 'Resolved'}
                                </span>
                            </div>
                            <ChevronDown size={14} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showFilters && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full mt-2 right-0 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-xl z-[60] overflow-hidden"
                                    >
                                        <div className="p-1">
                                            {['all', 'new', 'contacted', 'resolved'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        setStatusFilter(status as any);
                                                        setShowFilters(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${statusFilter === status
                                                        ? 'bg-accent-primary/20 text-accent-primary'
                                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    {status === 'all' ? '📋 All Status' : status === 'new' ? '🔵 New' : status === 'contacted' ? '🟡 Contacted' : '🟢 Resolved'}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Results Count */}
                {(searchTerm || statusFilter !== 'all') && (
                    <div className="mt-4 text-[10px] text-white/40 font-bold uppercase tracking-widest px-1">
                        Showing {filteredLeads.length} / {leads.length} leads
                    </div>
                )}
            </div>

            <div className="space-y-4 relative z-[30]">
                {filteredLeads.map((lead) => (
                    <div key={lead.id} className="glass-card p-4 md:p-6 rounded-[2rem] border border-white/10">
                        <div className="flex flex-col items-stretch gap-4">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h4 className="text-base md:text-lg font-bold text-white">{lead.name}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium flex items-center gap-1 ${getStatusColor(lead.status)}`}>
                                            {getStatusIcon(lead.status)}
                                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 text-xs md:text-sm text-white/60">
                                        <div className="flex items-center gap-2">
                                            <Mail size={12} className="shrink-0" />
                                            <span className="truncate max-w-[150px] md:max-w-none">{lead.email}</span>
                                        </div>
                                        {lead.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone size={12} className="shrink-0" />
                                                <span>{lead.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="shrink-0" />
                                            <span>{new Date(lead.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} className="shrink-0" />
                                            <span>{lead.ip_location || 'Local / Private'}</span>
                                        </div>
                                    </div>

                                    <div className="text-white/70 text-sm leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                                        {selectedLead === lead.id ? (
                                            <p>{lead.message || ""}</p>
                                        ) : (
                                            <p>
                                                {(lead.message?.length || 0) > 120
                                                    ? lead.message!.substring(0, 120) + '...'
                                                    : (lead.message || "")
                                                }
                                            </p>
                                        )}
                                        {(lead.message?.length || 0) > 120 && (
                                            <button
                                                onClick={() => setSelectedLead(selectedLead === lead.id ? null : lead.id)}
                                                className="text-accent-primary hover:text-accent-secondary text-[11px] font-bold mt-2 transition-colors uppercase tracking-wider"
                                            >
                                                {selectedLead === lead.id ? 'Show less' : 'Read full message'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-4 border-t border-white/5">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowFilterMenu(lead.id)}
                                        className="flex items-center justify-between gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs hover:bg-white/10 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${lead.status === 'new' ? 'bg-blue-400' :
                                                lead.status === 'contacted' ? 'bg-yellow-400' : 'bg-green-400'
                                                }`} />
                                            <span className="capitalize">{lead.status}</span>
                                        </div>
                                        <ChevronDown size={12} className={`text-white/40 transition-transform ${showFilterMenu === lead.id ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {showFilterMenu === lead.id && (
                                            <>
                                                <div className="fixed inset-0 z-[90]" onClick={() => setShowFilterMenu(null)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    className="absolute bottom-full left-0 mb-2 w-32 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden"
                                                >
                                                    <div className="p-1">
                                                        {(['new', 'contacted', 'resolved'] as const).map((status) => (
                                                            <button
                                                                key={status}
                                                                onClick={() => {
                                                                    updateLeadStatus(lead.id, status);
                                                                    setShowFilterMenu(null);
                                                                }}
                                                                className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-2 ${lead.status === status
                                                                    ? 'bg-accent-primary/20 text-accent-primary'
                                                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                                    }`}
                                                            >
                                                                <div className={`w-1.5 h-1.5 rounded-full ${status === 'new' ? 'bg-blue-400' :
                                                                    status === 'contacted' ? 'bg-yellow-400' : 'bg-green-400'
                                                                    }`} />
                                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button
                                    onClick={() => confirmDelete(lead.id, lead.name)}
                                    className="p-2.5 rounded-xl bg-red-400/10 text-red-400 hover:text-white hover:bg-red-400 transition-all border border-red-400/20"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredLeads.length === 0 && (
                    <div className="text-center py-12">
                        <Mail size={48} className="mx-auto mb-4 text-white/20" />
                        <p className="text-white/60">
                            {searchTerm || statusFilter !== 'all'
                                ? 'No leads match your search criteria'
                                : 'No contact leads yet'
                            }
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
