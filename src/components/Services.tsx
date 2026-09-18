"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Video,
  Camera,
  Sparkles,
  Music,
  Film,
  Award,
  Users,
  Building,
  Star,
  TrendingUp,
  Target,
  Brain,
  Palette,
  Share2,
  Briefcase
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import {
  getIndustryTypeUi,
  getServiceIconUi,
  normalizeApiList,
  type AccentColor,
  type IndustryIconKey,
  type ServiceIconKey,
} from "@/lib/services/contract";

type CardIconKey = ServiceIconKey | IndustryIconKey | "camera" | "palette";

type ServiceCard = {
  id: string | number;
  title: string;
  desc: string;
  iconKey: CardIconKey;
  color: AccentColor;
  details: string[];
};

type ExpertiseCard = {
  id: string | number;
  title: string;
  desc: string;
  iconKey: CardIconKey;
  color: AccentColor;
};

type WorkedWithCard = {
  id: string | number;
  title: string;
  desc: string;
  iconKey: CardIconKey;
  color: AccentColor;
};

const iconComponents: Record<CardIconKey, React.ComponentType<{ size?: number; className?: string }>> = {
  video: Video,
  film: Film,
  brain: Brain,
  music: Music,
  users: Users,
  target: Target,
  sparkles: Sparkles,
  share2: Share2,
  award: Award,
  briefcase: Briefcase,
  star: Star,
  building: Building,
  "trending-up": TrendingUp,
  camera: Camera,
  palette: Palette,
};

const fallbackExpertiseData: ExpertiseCard[] = [
  {
    id: "fallback-expertise-1",
    title: "AI Video Production",
    desc: "Cutting-edge artificial intelligence integration for automated video editing, enhancement, and intelligent content optimization.",
    iconKey: "brain",
    color: "accent-primary",
  },
  {
    id: "fallback-expertise-2",
    title: "Visual Storytelling",
    desc: "Compelling narrative development that transforms ideas into emotionally resonant visual experiences.",
    iconKey: "palette",
    color: "accent-secondary",
  },
  {
    id: "fallback-expertise-3",
    title: "Social Media Content",
    desc: "Platform-optimized video editing tailored for maximum engagement across Instagram, TikTok, YouTube, and LinkedIn.",
    iconKey: "share2",
    color: "accent-tertiary",
  },
  {
    id: "fallback-expertise-4",
    title: "White-Label Editing",
    desc: "Premium video editing services for agencies, delivering broadcast-quality content under your brand identity.",
    iconKey: "briefcase",
    color: "accent-quaternary",
  },
];

const fallbackWorkedWithData: WorkedWithCard[] = [
  {
    id: "fallback-worked-1",
    title: "E-commerce Sellers",
    desc: "Partnering with online retailers to create compelling product videos and promotional content that drives conversions.",
    iconKey: "building",
    color: "accent-primary",
  },
  {
    id: "fallback-worked-2",
    title: "Global Brands",
    desc: "Collaborating with established brands to develop impactful commercial and marketing content that resonates with audiences.",
    iconKey: "award",
    color: "accent-secondary",
  },
  {
    id: "fallback-worked-3",
    title: "Content Creators",
    desc: "Supporting individual professionals and experts with high-quality video content for personal branding and thought leadership.",
    iconKey: "users",
    color: "accent-tertiary",
  },
  {
    id: "fallback-worked-4",
    title: "Creative Agencies",
    desc: "Providing white-label video production services to creative and marketing agencies for their client projects.",
    iconKey: "star",
    color: "accent-quaternary",
  },
  {
    id: "fallback-worked-5",
    title: "Tech Startups",
    desc: "Helping fast-paced startups explain complex features through intuitive and engaging motion graphics.",
    iconKey: "trending-up",
    color: "accent-primary",
  },
  {
    id: "fallback-worked-6",
    title: "Fashion Houses",
    desc: "Capturing the essence of high-fashion through cinematic lookbooks and runway highlights.",
    iconKey: "camera",
    color: "accent-secondary",
  },
];

const fallbackServiceData: ServiceCard[] = [
  {
    id: "fallback-service-1",
    title: "Cinematic Film",
    desc: "High-end brand storytelling with cinema-grade visuals and emotional pacing.",
    iconKey: "film",
    color: "accent-primary",
    details: ["Pro Color Grading", "4K Resolution", "Masterful Editing"],
  },
  {
    id: "fallback-service-2",
    title: "Commercial Shoots",
    desc: "Professional production design for high-converting commercial campaigns.",
    iconKey: "video",
    color: "accent-secondary",
    details: ["Studio Setup", "Directing", "Live Production"],
  },
  {
    id: "fallback-service-3",
    title: "Visual Identity",
    desc: "Motion graphics and branding that move with your audience.",
    iconKey: "sparkles",
    color: "accent-tertiary",
    details: ["Logo Animation", "VFX", "Custom HUDs"],
  },
  {
    id: "fallback-service-4",
    title: "Sound Design",
    desc: "Bespoke audio landscapes that bring every frame to life.",
    iconKey: "music",
    color: "accent-quaternary",
    details: ["Mixing", "Foley", "Spatial Audio"],
  },
  {
    id: "fallback-service-5",
    title: "Pro Photography",
    desc: "Breathtaking stills that capture moments in absolute clarity.",
    iconKey: "camera",
    color: "accent-primary",
    details: ["Life Style", "Product", "Fashion"],
  },
];

function toCleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function mapCoreServices(items: unknown[]): ServiceCard[] {
  const mapped: ServiceCard[] = [];

  items.forEach((item, index) => {
    const entity = item as Record<string, unknown>;
    const title = toCleanString(entity.title);
    const desc = toCleanString(entity.description);
    if (!title || !desc) return;

    const ui = getServiceIconUi(entity.icon_type as ServiceIconKey);
    const details = [entity.tag1, entity.tag2, entity.tag3]
      .map(toCleanString)
      .filter(Boolean)
      .slice(0, 3);

    mapped.push({
      id: (entity.id as string | number) ?? `service-${index}`,
      title,
      desc,
      iconKey: ui.iconKey,
      color: ui.color,
      details,
    });
  });

  return mapped;
}

function mapExpertise(items: unknown[]): ExpertiseCard[] {
  const mapped: ExpertiseCard[] = [];

  items.forEach((item, index) => {
    const entity = item as Record<string, unknown>;
    const title = toCleanString(entity.title);
    const desc = toCleanString(entity.description);
    if (!title || !desc) return;

    const ui = getServiceIconUi(entity.icon_type as ServiceIconKey);

    mapped.push({
      id: (entity.id as string | number) ?? `expertise-${index}`,
      title,
      desc,
      iconKey: ui.iconKey,
      color: ui.color,
    });
  });

  return mapped;
}

function mapWorkedWith(items: unknown[]): WorkedWithCard[] {
  const mapped: WorkedWithCard[] = [];

  items.forEach((item, index) => {
    const entity = item as Record<string, unknown>;
    const title = toCleanString(entity.title);
    const desc = toCleanString(entity.description);
    if (!title || !desc) return;

    const ui = getIndustryTypeUi(entity.industry_type as IndustryIconKey);

    mapped.push({
      id: (entity.id as string | number) ?? `worked-${index}`,
      title,
      desc,
      iconKey: ui.iconKey,
      color: ui.color,
    });
  });

  return mapped;
}

const Services = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, {
    once: false,
    margin: "-10% 0px -10% 0px",
  });

  const [serviceData, setServiceData] = useState<ServiceCard[]>(fallbackServiceData);
  const [expertiseData, setExpertiseData] = useState<ExpertiseCard[]>(fallbackExpertiseData);
  const [workedWithData, setWorkedWithData] = useState<WorkedWithCard[]>(fallbackWorkedWithData);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchServicesData = async () => {
      const [coreRes, expertiseRes, workedWithRes] = await Promise.allSettled([
        axiosInstance.get("/services/service/core/"),
        axiosInstance.get("/services/service/expertise/"),
        axiosInstance.get("/services/service/worked-with/"),
      ]);

      if (!isMounted) return;

      if (coreRes.status === "fulfilled") {
        const mapped = mapCoreServices(normalizeApiList(coreRes.value.data));
        if (mapped.length > 0) {
          setServiceData(mapped);
        }
      }

      if (expertiseRes.status === "fulfilled") {
        const mapped = mapExpertise(normalizeApiList(expertiseRes.value.data));
        if (mapped.length > 0) {
          setExpertiseData(mapped);
        }
      }

      if (workedWithRes.status === "fulfilled") {
        const mapped = mapWorkedWith(normalizeApiList(workedWithRes.value.data));
        if (mapped.length > 0) {
          setWorkedWithData(mapped);
        }
      }
    };

    void fetchServicesData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section ref={containerRef} id="services" className="py-16 md:py-32 relative overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1 }}
        className="relative z-10 px-6 gpu-fix max-w-7xl mx-auto"
      >
        <div className="text-center mb-16 md:mb-20 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4 md:mb-6"
          >
            <span className="text-[10px] sm:text-xs font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase text-accent-secondary">
              Superior Quality
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter"
          >
            Mastering{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#023E8A] via-[#49CADF] to-[#023E8A]">
              Visual Art
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-white/70 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto"
          >
            We don&apos;t just edit videos. We craft immersive digital experiences that define the next generation of visual storytelling.
          </motion.p>
        </div>

        {/* Main Services Marquee */}
        <div className="relative mb-20 md:mb-32">
          <div className="relative py-4 md:py-10 marquee-wrapper mask-edge overflow-hidden">
            <motion.div 
              className="flex gap-0 w-max"
              animate={{
                x: [0, -1035], // Half width for perfectly seamless loop
              }}
              transition={{
                duration: 50,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...serviceData, ...serviceData, ...serviceData].map((service, index) => {
                const IconComponent = iconComponents[service.iconKey];

                return (
                  <motion.div
                    key={`${service.id}-${index}`}
                    whileHover={{ y: -15, scale: 1.05 }}
                    className="w-[240px] md:w-[400px] flex-shrink-0 group/card relative pr-3 md:pr-8"
                  >
                    <div className="glass-card p-5 md:p-10 rounded-[2.5rem] border border-white/10 h-full flex flex-col justify-between overflow-hidden relative shadow-2xl backdrop-blur-3xl transition-all duration-500">
                      {/* Animated Background Icon */}
                      <div className="absolute -right-8 -top-8 opacity-[0.03] group-hover/card:opacity-[0.1] transition-opacity duration-700 scale-[3]">
                        <IconComponent size={32} />
                      </div>

                      <div>
                        <div
                          className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-5 md:mb-8 border border-white/10 bg-${service.color}/10 text-${service.color} group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-500 shadow-xl`}
                        >
                          <IconComponent size={20} className="md:w-8 md:h-8" />
                        </div>

                        <h3 className="text-lg md:text-2xl font-black mb-3 md:mb-4 text-white group-hover/card:text-gradient transition-all leading-tight">
                          {service.title}
                        </h3>

                        <p className="text-white/50 text-xs md:text-sm leading-relaxed font-light mb-6 md:mb-8 line-clamp-3">
                          {service.desc}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {service.details.map((detail, i) => (
                          <span
                            key={`${service.id}-${detail}-${i}`}
                            className="text-[9px] md:text-[10px] uppercase font-black tracking-widest px-2.5 py-1 bg-white/5 rounded-lg text-white/40 border border-white/5 group-hover/card:text-white/70 group-hover/card:border-white/10 transition-all"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Expertise Section (Reverse Marquee) */}
        <div className="mb-20 md:mb-32">
          <div className="flex flex-col items-center text-center mb-16 max-w-4xl mx-auto gap-6">
            <div className="max-w-2xl">
              <motion.h3
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-4xl md:text-7xl font-black mb-6 tracking-tighter"
              >
                Our{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#023E8A] via-[#49CADF] to-[#023E8A]">
                  Expertise
                </span>
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.2 }}
                className="text-white/70 text-lg md:text-xl font-light leading-relaxed"
              >
                Technical mastery combined with artistic vision to deliver unmatched results.
              </motion.p>
            </div>
          </div>

          <div className="relative py-4 md:py-10 marquee-wrapper mask-edge overflow-hidden">
            <motion.div 
              className="flex gap-0 w-max"
              animate={{
                x: [-1035, 0], 
              }}
              transition={{
                duration: 50,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...expertiseData, ...expertiseData, ...expertiseData].map((item, index) => {
                const IconComponent = iconComponents[item.iconKey];

                return (
                  <motion.div
                    key={`${item.id}-${index}`}
                    className="w-[280px] md:w-[345px] px-3 md:px-4 shrink-0 group"
                  >
                    <div className="glass-card p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all h-full backdrop-blur-xl">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl mb-6 flex items-center justify-center border border-white/10 bg-${item.color}/10 text-${item.color} group-hover:scale-110 transition-transform`}>
                        <IconComponent size={20} />
                      </div>
                      <h4 className="text-lg md:text-xl font-bold mb-4 text-white group-hover:text-accent-secondary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-white/40 text-xs md:text-sm leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Worked With Section */}
        <div className="relative p-6 md:p-12 lg:p-20 rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 bg-white/[0.02]">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-accent-primary/5 blur-[120px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              <div>
                <h3 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 lg:mb-8 tracking-tighter">
                  We&apos;ve <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#023E8A] via-[#49CADF] to-[#023E8A]">Worked With</span>
                </h3>
                <p className="text-white/70 text-base md:text-lg font-light leading-relaxed mb-8 lg:mb-12">
                  Our portfolio spans across diverse industries, helping visionaries and brands dominate their respective markets.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {workedWithData.slice(0, 4).map((item) => {
                    const IconComponent = iconComponents[item.iconKey];
                    return (
                      <div
                        key={`worked-badge-${item.id}`}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 w-full"
                      >
                        <div className="text-accent-secondary">
                          <IconComponent size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                          {item.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            <div 
              className="relative z-20 w-full lg:max-h-[550px] lg:overflow-y-auto lg:pr-4 lg:overflow-x-hidden rounded-xl lg:overscroll-contain [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
              data-lenis-prevent={isDesktop ? "true" : undefined}
              onWheel={isDesktop ? (e) => e.stopPropagation() : undefined}
              onTouchMove={isDesktop ? (e) => e.stopPropagation() : undefined}
            >
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {workedWithData.map((item, index) => {
                  const IconComponent = iconComponents[item.iconKey];
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ margin: "-50px", once: true }}
                      transition={{ duration: 0.8, delay: 0.1 * index }}
                      className="group glass-card p-4 md:p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all flex items-center gap-4 md:gap-6"
                    >
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center border border-white/10 bg-${item.color}/10 text-${item.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <IconComponent size={24} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base md:text-lg font-bold text-white mb-1 group-hover:text-accent-secondary transition-colors truncate">
                          {item.title}
                        </h4>
                        <p className="text-white/40 text-xs font-light line-clamp-2">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Custom Styles */}
      <style jsx>{`
        .mask-edge {
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </section>
  );
};

export default Services;
