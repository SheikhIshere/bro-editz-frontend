"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Instagram, MessageCircle, Globe, ArrowLeft, CheckCircle2, Loader2, Linkedin, Twitter, Youtube } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { FooterData } from "@/types/footer";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<"options" | "form" | "success">("options");
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [footerData, setFooterData] = useState<FooterData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        const fetchFooterData = async () => {
            try {
                const response = await axiosInstance.get("/footer/");
                setFooterData(response.data);
            } catch (err) {
                console.error("Failed to fetch footer data for modal:", err);
            }
        };
        if (isOpen) fetchFooterData();
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await axiosInstance.post("/contacts/create/", {
                name: formData.name,
                email: formData.email,
                description: formData.message,
            });
            setStep("success");
            setFormData({ name: "", email: "", message: "" });
        } catch (err: any) {
            console.error("Failed to submit contact form:", err);
            setError("Something went wrong. Please try again or reach out via WhatsApp/Instagram.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetModal = () => {
        setStep("options");
        setFormData({ name: "", email: "", message: "" });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={resetModal}
                        className="fixed inset-0 bg-background/60 backdrop-blur-3xl z-[1000] cursor-pointer"
                    />

                    {/* Centered Floating Modal (Responsive) */}
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-[1001] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="w-full max-w-lg bg-[#111111] border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] overflow-y-auto max-h-[90vh] pointer-events-auto relative no-scrollbar"
                            data-lenis-prevent
                        >
                            {/* Header */}
                            <div className="p-5 sm:p-8 flex justify-between items-center bg-white/[0.02] border-b border-white/5">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    {step !== "options" && (
                                        <button
                                            onClick={() => setStep("options")}
                                            className="p-1.5 sm:p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
                                        >
                                            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                                        </button>
                                    )}
                                    <h3 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase italic">
                                        {step === "options" ? "Let's Connect" : step === "form" ? "Send Message" : "Thank You"}
                                    </h3>
                                </div>
                                <button
                                    onClick={resetModal}
                                    className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90"
                                >
                                    <X size={20} className="sm:w-6 sm:h-6" />
                                </button>
                            </div>

                            <div className="p-5 sm:p-8">
                                <AnimatePresence mode="wait">
                                    {step === "options" && (
                                        <motion.div
                                            key="options"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-3 sm:space-y-4"
                                        >
                                            {footerData?.phone && (
                                                <a
                                                    href={`https://wa.me/${footerData.phone.replace(/\D/g, "")}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3 sm:gap-4 text-[#25D366]">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#25D366] flex items-center justify-center text-white shrink-0">
                                                            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" fill="white" />
                                                        </div>
                                                        <div className="text-left">
                                                            <div className="font-bold text-sm sm:text-lg">WhatsApp</div>
                                                            <div className="text-[10px] sm:text-xs opacity-70">Instant reply available</div>
                                                        </div>
                                                    </div>
                                                    <Send size={18} className="text-[#25D366] opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all sm:w-5 sm:h-5" />
                                                </a>
                                            )}
                                            {footerData?.instagram && (
                                                <a
                                                    href={footerData.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#E4405F]/10 border border-[#E4405F]/20 hover:bg-[#E4405F]/20 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3 sm:gap-4 text-[#E4405F]">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shrink-0">
                                                            <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
                                                        </div>
                                                        <div className="text-left">
                                                            <div className="font-bold text-sm sm:text-lg">Instagram</div>
                                                            <div className="text-[10px] sm:text-xs opacity-70">DM for references</div>
                                                        </div>
                                                    </div>
                                                    <Send size={18} className="text-[#E4405F] opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all sm:w-5 sm:h-5" />
                                                </a>
                                            )}
                                            {footerData?.linkedin && (
                                                <a
                                                    href={footerData.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0077B5]/10 border border-[#0077B5]/20 hover:bg-[#0077B5]/20 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3 sm:gap-4 text-[#0077B5]">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#0077B5] flex items-center justify-center text-white shrink-0">
                                                            <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" fill="white" />
                                                        </div>
                                                        <div className="text-left">
                                                            <div className="font-bold text-sm sm:text-lg">LinkedIn</div>
                                                            <div className="text-[10px] sm:text-xs opacity-70">Professional outreach</div>
                                                        </div>
                                                    </div>
                                                    <Send size={18} className="text-[#0077B5] opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all sm:w-5 sm:h-5" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => setStep("form")}
                                                className="w-full flex items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-accent-primary/10 border border-accent-primary/20 hover:bg-accent-primary/20 transition-all group"
                                            >
                                                <div className="flex items-center gap-3 sm:gap-4 text-accent-primary">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-accent-primary flex items-center justify-center text-white shrink-0">
                                                        <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-bold text-sm sm:text-lg">Book on Site</div>
                                                        <div className="text-[10px] sm:text-xs opacity-70">Submit your requirement</div>
                                                    </div>
                                                </div>
                                                <Send size={18} className="text-accent-primary opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all sm:w-5 sm:h-5" />
                                            </button>
                                        </motion.div>
                                    )}

                                    {step === "form" && (
                                        <motion.form
                                            key="form"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            onSubmit={handleSubmit}
                                            className="space-y-3 sm:space-y-4"
                                        >
                                            <div className="space-y-1.5 sm:space-y-2">
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">Your Name</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-sm sm:text-base text-white focus:outline-none focus:border-accent-primary/50 transition-colors"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="space-y-1.5 sm:space-y-2">
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">Email Address</label>
                                                <input
                                                    required
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-sm sm:text-base text-white focus:outline-none focus:border-accent-primary/50 transition-colors"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                            <div className="space-y-1.5 sm:space-y-2">
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">Message</label>
                                                <textarea
                                                    required
                                                    rows={4}
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-sm sm:text-base text-white focus:outline-none focus:border-accent-primary/50 transition-colors resize-none"
                                                    placeholder="Tell us about your project..."
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full btn-primary py-4 sm:py-5 rounded-xl sm:rounded-2xl text-sm sm:text-lg font-black uppercase tracking-widest group flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 mt-1 sm:mt-0"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        Send Message <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                            {error && (
                                                <p className="text-[10px] sm:text-xs text-red-500 text-center font-bold px-4">{error}</p>
                                            )}
                                        </motion.form>
                                    )}

                                    {step === "success" && (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-8 sm:py-12 space-y-4 sm:space-y-6"
                                        >
                                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                                                <CheckCircle2 className="w-10 h-10 sm:w-16 sm:h-16" />
                                            </div>
                                            <div className="space-y-1 sm:space-y-2">
                                                <h4 className="text-xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">Request Received</h4>
                                                <p className="text-white/60 text-sm sm:text-lg">We'll get back to you within 24 hours.</p>
                                            </div>
                                            <button
                                                onClick={resetModal}
                                                className="px-6 py-2.5 sm:px-8 sm:py-3 bg-white/5 border border-white/10 rounded-full text-white text-sm sm:text-base font-bold hover:bg-white/10 transition-colors"
                                            >
                                                Close Window
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Secure Footer */}
                            <div className="p-4 sm:p-6 bg-white/[0.01] border-t border-white/5 text-center">
                                <p className="text-[9px] sm:text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">Secure Submission &copy; 2026 Video Agency</p>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ContactModal;
