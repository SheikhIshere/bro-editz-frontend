"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, ListFilter, FileText, MessageSquare, Mail, Settings, Star, LogOut, KeyRound, UserPlus, ChevronDown, Globe } from "lucide-react";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onLogout: () => Promise<void> | void;
}

const sidebarItems = [
    { id: "hero", label: "Hero Section", icon: LayoutDashboard },
    { id: "services", label: "Services", icon: ListFilter },
    { id: "portfolio", label: "Work", icon: FileText },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "faqs", label: "FAQs", icon: MessageSquare },
    { id: "leads", label: "Contact Leads", icon: FileText },
    { id: "emails", label: "Newsletter", icon: Mail },
    { id: "footer", label: "Footer", icon: Globe },
    { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
    activeTab,
    setActiveTab,
    isOpen,
    setIsOpen,
    onLogout,
}: SidebarProps) {
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const [email, setEmail] = React.useState<string | null>(null);

    React.useEffect(() => {
        setEmail(localStorage.getItem("admin_user_email"));
    }, []);

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);
        try {
            await onLogout();
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                onClick={() => setIsOpen(false)}
            />

            <aside className={`fixed left-0 top-0 w-64 h-screen bg-background border-r border-white/10 p-6 overflow-y-auto z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } flex flex-col`}>
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="group flex items-center gap-4">
                        <div className="relative group/logo">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-accent-primary/40 to-accent-secondary/40 rounded-2xl blur-sm opacity-0 group-hover/logo:opacity-100 transition duration-500"></div>
                            <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 group-hover/logo:scale-105 group-hover/logo:rotate-2">
                                <img src="/logo.png" alt="BroEditz Logo" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="text-lg font-black tracking-tighter leading-none uppercase">
                                    <span className="text-white">Bro</span>
                                    <span style={{ color: '#0094C8' }}>Editz</span>
                                </span>
                            </div>
                        </div>
                    </Link>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <nav className="space-y-1.5 flex-1">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${isActive
                                    ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/25"
                                    : "text-text-muted hover:text-white hover:bg-white/5"
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon size={20} className={isActive ? "text-white" : "text-accent-primary"} />
                                {item.label}
                            </motion.button>
                        );
                    })}
                </nav>

                <div className="pt-8 space-y-4">
                    {email && (
                        <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Signed in as</p>
                            <p className="text-xs font-medium text-white truncate">
                                {email}
                            </p>
                        </div>
                    )}
                    <motion.button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all border border-red-400/10 disabled:opacity-60 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <LogOut size={18} />
                        {isLoggingOut ? "Logging out..." : "Logout"}
                    </motion.button>
                </div>
            </aside>
        </>
    );
}
