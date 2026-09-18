"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Twitter, Linkedin, Youtube, Send, Loader2, ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { cachedGet } from "@/lib/axios";
import axiosInstance from "@/lib/axios";
import { FooterData } from "@/types/footer";
import PolicyModal from "./PolicyModal";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [footerData, setFooterData] = useState<FooterData>({
    id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    youtube: null,
    facebook: null,
    twitter: null,
    instagram: null,
    linkedin: null,
    email: "support@example.com",
    phone: "+880123456789",
    location: "Dhaka, Bangladesh",
    privacy_policy: "",
    terms_of_service: "",
    cookie_policy: "",
    brand_guidelines: ""
  });

  // Modal state
  const [policyModal, setPolicyModal] = useState<{
    isOpen: boolean;
    type: "privacy" | "terms" | "cookie" | "guidelines" | null;
    title: string;
    content: string | null;
  }>({
    isOpen: false,
    type: null,
    title: "",
    content: null
  });

  // Function to open policy modal
  const openPolicyModal = (type: "privacy" | "terms" | "cookie" | "guidelines", title: string) => {
    let content = null;
    
    switch (type) {
      case "privacy":
        content = footerData.privacy_policy;
        break;
      case "terms":
        content = footerData.terms_of_service;
        break;
      case "cookie":
        content = footerData.cookie_policy;
        break;
      case "guidelines":
        content = footerData.brand_guidelines;
        break;
    }
    
    setPolicyModal({
      isOpen: true,
      type,
      title,
      content
    });
  };

  // Function to close modal
  const closePolicyModal = () => {
    setPolicyModal({
      isOpen: false,
      type: null,
      title: "",
      content: null
    });
  };

  // Fetch footer data from API
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        console.log("Fetching footer data...");
        const response = await cachedGet("/footer/");
        console.log("Footer API response:", response.data);
        setFooterData(response.data);
      } catch (err) {
        console.error("Failed to fetch footer data:", err);
        // Keep default values on error
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      fetchFooterData();
    }
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    setIsSubmitting(true);
    setError(null);

    try {
      await axiosInstance.post("/newsletters/subscribe/", { email });
      setNewsletterSubmitted(true);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("You are already subscribed!");
      } else {
        setError("Already subscribed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerLinks = {
    company: [
      { name: "Intro", href: "#hero" },
      { name: "Services", href: "#services" },
      { name: "Work", href: "#work" },
      { name: "Process", href: "#process" },
      { name: "FAQ", href: "#faq" },
    ],
    services: [
      { name: "Video Production", href: "#services" },
      { name: "Social Media Ads", href: "#services" },
      { name: "Content Strategy", href: "#services" },
      { name: "Web Solutions", href: "#services" },
      { name: "Motion Graphics", href: "#services" },
    ],
    support: [
      { name: "Privacy Policy", action: () => openPolicyModal("privacy", "Privacy Policy") },
      { name: "Terms of Service", action: () => openPolicyModal("terms", "Terms of Service") },
      { name: "Cookie Policy", action: () => openPolicyModal("cookie", "Cookie Policy") },
      { name: "Brand Guidelines", action: () => openPolicyModal("guidelines", "Brand Guidelines") },
    ]
  };

  const socialLinks = [
    { name: "Instagram", icon: <Instagram size={20} />, href: footerData?.instagram || "#" },
    { name: "Twitter", icon: <Twitter size={20} />, href: footerData?.twitter || "#" },
    { name: "LinkedIn", icon: <Linkedin size={20} />, href: footerData?.linkedin || "#" },
    { name: "Youtube", icon: <Youtube size={20} />, href: footerData?.youtube || "#" },
  ];

  return (
    <footer className="relative bg-background border-t border-white/10 overflow-hidden pt-24 pb-12">
      {/* Background Glow effects */}
      <div className="absolute top-0 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 w-[500px] h-[500px] bg-accent-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Footer Content */}

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Brand Section */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="group flex items-center gap-3 w-fit">
              <div className="relative group/logo">
                <div className="absolute -inset-1 bg-gradient-to-tr from-accent-primary/40 to-accent-secondary/40 rounded-2xl blur-sm opacity-0 group-hover/logo:opacity-100 transition duration-500" />
                <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 group-hover/logo:scale-105 group-hover/logo:rotate-2">
                  <img src="/logo.png" alt="BroEditz Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black tracking-tighter leading-none uppercase flex items-center">
                    <span className="text-white">BRO</span><span style={{ color: '#0094C8' }}>EDITZ</span>
                  </span>
                  <div className="w-1 h-1 rounded-full bg-accent-primary animate-pulse" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-text-muted/60">
                    Video Agency
                  </span>
                  <div className="h-[1px] w-4 bg-white/10" />
                </div>
              </div>
            </Link>

            <p className="text-text-muted text-sm leading-relaxed max-w-sm">
              We turn ideas into visuals through AI-enhanced video production and cinematic editing that captivates audiences and elevates brands.
            </p>

            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-accent-primary/20 hover:border-accent-primary/30 transition-all duration-300"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Explore</h4>
              <ul className="flex flex-col gap-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-text-muted hover:text-accent-primary text-sm transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-primary scale-0 group-hover:scale-100 transition-transform" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Services</h4>
              <ul className="flex flex-col gap-4">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-text-muted hover:text-accent-primary text-sm transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-primary scale-0 group-hover:scale-100 transition-transform" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-4">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative group overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-white font-bold text-lg mb-2">Subscribe to News</h4>
                <p className="text-text-muted text-xs mb-6 leading-relaxed">
                  Get the latest insights on content creation and digital growth delivered to your inbox.
                </p>

                <AnimatePresence mode="wait">
                  {!newsletterSubmitted ? (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleNewsletterSubmit}
                      className="relative flex flex-col gap-3"
                    >
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          placeholder="Email Address"
                          disabled={isSubmitting}
                          className="w-full bg-background border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-50"
                          required
                        />
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="absolute right-2 top-2 bottom-2 text-white px-4 rounded-xl transition-colors flex items-center justify-center group/btn disabled:opacity-50" 
                          style={{ backgroundColor: '#0094C8' }}
                        >
                          {isSubmitting ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          )}
                        </button>
                      </div>
                      {error && (
                        <p className="text-[10px] text-red-500 text-center font-bold">
                          {error}
                        </p>
                      )}
                      <p className="text-[10px] text-text-muted text-center italic">
                        By subscribing, you agree to our privacy policy.
                      </p>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4 bg-accent-primary/10 rounded-2xl border border-accent-primary/20"
                    >
                      <h5 className="text-white font-bold text-sm uppercase tracking-widest mb-1">Success!</h5>
                      <p className="text-text-muted text-[10px]">You're on the list.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Decorative gradient for the newsletter box */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/20 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Contact/Action Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-y border-white/5 mb-10">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300" style={{ color: '#0094C8' }}>
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Email us</p>
              <a href={`mailto:${footerData?.email || 'hello@videoagency.com'}`} className="text-sm font-bold text-white hover:text-accent-primary transition-colors">
                {footerData?.email || 'hello@videoagency.com'}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300" style={{ color: '#0094C8' }}>
              <Phone size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Call us</p>
              <a href={`tel:${footerData?.phone || '+1234567890'}`} className="text-sm font-bold text-white hover:text-accent-primary transition-colors">
                {footerData?.phone || '+1 (234) 567-890'}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300" style={{ color: '#0094C8' }}>
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Location</p>
              <span className="text-sm font-bold text-white">{footerData?.location || 'Digital Nomad, Everywhere'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2 pb-6">
          <p className="text-xs text-text-muted font-medium">
            {/* © {currentYear} <span className="text-white">BRO<span style={{ color: '#0094C8' }}>EDITZ</span></span>. Crafted with passion by <a href="https://www.linkedin.com/in/imran-rafi-0a7955293/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-primary transition-colors"><span className="text-white">Nut</span><span style={{ color: '#0094C8' }}>Crackers</span></a> <span className="text-white">Team</span>. */}
          © {currentYear} <span className="text-white">BRO<span style={{ color: '#0094C8' }}>EDITZ</span></span>. All Rights Reserved.
          </p>
          <div className="flex items-center gap-8">
            {footerLinks.support.map((link) => (
              <button
                key={link.name}
                onClick={link.action}
                className="text-[11px] text-text-muted hover:text-white transition-colors uppercase tracking-widest font-bold bg-transparent border-none cursor-pointer"
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Policy Modal */}
      <PolicyModal
        isOpen={policyModal.isOpen}
        onClose={closePolicyModal}
        title={policyModal.title}
        content={policyModal.content}
        type={policyModal.type!}
      />
    </footer>
  );
};

export default Footer;
