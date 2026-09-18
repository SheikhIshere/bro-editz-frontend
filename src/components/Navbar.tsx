"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { Menu, X, ArrowRight, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { cachedGet } from "@/lib/axios";
import ContactModal from "./ContactModal";
import { FooterData } from "@/types/footer";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [footerData, setFooterData] = useState<FooterData | null>(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await cachedGet("/footer/");
        setFooterData(response.data);
      } catch (err) {
        console.error("Failed to fetch footer data for navbar:", err);
      }
    };
    fetchFooterData();
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    // Audit: Replace expensive scroll listeners with IntersectionObserver for zero-jank tracking
    const sections = ["intro", "services", "work", "reviews", "process", "faq"];
    
    const observerOptions = {
      root: null,
      rootMargin: "-120px 0px -60% 0px", // Trigger when section is in top half of screen
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    // Throttled scroll listener for background opacity only
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#mobile-navbar")) setMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileMenuOpen]);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Intro", href: "#intro", id: "intro" },
    { name: "Services", href: "#services", id: "services" },
    { name: "Work", href: "#work", id: "work" },
    { name: "Reviews", href: "#reviews", id: "reviews" },
    { name: "Process", href: "#process", id: "process" },
    { name: "FAQ", href: "#faq", id: "faq" },
  ];

  const getTalkLink = () => {
    if (footerData?.phone) {
      const cleanPhone = footerData.phone.replace(/\D/g, "");
      return `https://wa.me/${cleanPhone}`;
    }
    return footerData?.linkedin || footerData?.instagram || "#";
  };

  return (
    <>
      {/* ────────────────────────────────────────────
          DESKTOP NAVBAR  (lg and above — unchanged)
      ──────────────────────────────────────────── */}
      <header className="hidden lg:block sticky top-0 left-0 w-full z-[100] transition-all duration-300 gpu-fix">
        <nav
          className={`w-full transition-all duration-700 ${
            scrolled
              ? "py-4 bg-background/90 backdrop-blur-2xl shadow-2xl"
              : "py-5 bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            {/* Logo */}
            <div className="flex-1 flex justify-start">
              <Link
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="group flex items-center gap-4"
              >
                <div className="relative group/logo">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-accent-primary/40 to-accent-secondary/40 rounded-2xl blur-sm opacity-0 group-hover/logo:opacity-100 transition duration-500" />
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 group-hover/logo:scale-105 group-hover/logo:rotate-2">
                    <img src="/logo.png" alt="BroEditz Logo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-black tracking-tighter leading-none uppercase flex items-center">
                      <span className="text-white">Bro</span>
                      <span style={{ color: "#0094C8" }}>Editz</span>
                    </span>
                    <div className="w-1 h-1 rounded-full bg-accent-primary animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black tracking-[0.3em] uppercase text-text-muted/60">
                      Video Agency
                    </span>
                    <div className="h-[1px] w-4 bg-white/10" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Centered Nav Links */}
            <div className="flex flex-[2] justify-center items-center">
              <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.id)}
                    className={`relative px-5 py-2 text-[12px] font-bold tracking-widest uppercase transition-all rounded-full ${
                      activeSection === link.id
                        ? "text-white"
                        : "text-text-muted hover:text-white"
                    }`}
                  >
                    {activeSection === link.id && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white/10 rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex-1 flex justify-end items-center gap-4">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="flex py-3 px-8 text-[12px] font-black uppercase tracking-widest items-center gap-2.5 group hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_#0094C8] rounded-xl"
                style={{ backgroundColor: "#0094C8", color: "white" }}
              >
                Let's Talk{" "}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ────────────────────────────────────────────
          MOBILE NAVBAR  (below lg — floating pill)
      ──────────────────────────────────────────── */}
      <div id="mobile-navbar" className="lg:hidden fixed top-3 left-3 right-3 z-[200]">
        {/* Pill bar */}
        <div className="flex items-center justify-between rounded-2xl bg-[#09090f]/90 backdrop-blur-xl border border-white/[0.08] px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
              <img src="/logo.png" alt="BroEditz Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-[17px] font-black tracking-tighter leading-none">
              <span className="text-white">Bro</span>
              <span style={{ color: "#0094C8" }}>Editz</span>
            </span>
          </Link>

          {/* Hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 active:scale-90 transition-transform"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X size={18} strokeWidth={2.5} />
            ) : (
              <Menu size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Dropdown card — pure CSS transition, no framer-motion */}
        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{
            maxHeight: mobileMenuOpen ? "400px" : "0px",
            opacity: mobileMenuOpen ? 1 : 0,
            pointerEvents: mobileMenuOpen ? "auto" : "none",
          }}
        >
          <div className="mt-2 rounded-2xl bg-[#09090f]/95 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Links */}
            <nav className="px-3 pt-3 pb-2 flex flex-col gap-0.5">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => scrollToSection(e as unknown as React.MouseEvent, link.id)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold tracking-wide transition-colors"
                    style={{
                      color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                      backgroundColor: isActive ? "rgba(255,255,255,0.05)" : "transparent",
                    }}
                  >
                    {link.name}
                    {isActive && (
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: "#0094C8" }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="mx-4 h-px bg-white/[0.06]" />

            {/* CTA button */}
            <div className="px-3 pt-2 pb-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsContactModalOpen(true);
                }}
                className="w-full py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-1.5 active:opacity-80 transition-opacity"
                style={{ backgroundColor: "#0094C8" }}
              >
                Let's Talk <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
