"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion";

const steps = [
    // ... items stay same
    {
        title: "Understand Requirements",
        desc: "We start with a deep dive into your business goals, target audience, and specific project needs to ensure alignment.",
    },
    {
        title: "Proposal & Agreement",
        desc: "A detailed scope of work, timelines, and transparent pricing model are agreed upon before we kick off.",
    },
    {
        title: "Project Planning",
        desc: "Setting milestones, creating roadmaps, and organizing resources for efficient execution and tracking.",
    },
    {
        title: "Execution / Development",
        desc: "Our experts build your project with precision, providing regular updates and maintaining high standards.",
    },
    {
        title: "Review & Revisions",
        desc: "We present the work for your feedback and perform necessary refinements to reach peak quality.",
    },
    {
        title: "Final Delivery",
        desc: "Complete project handover with all assets, documentation, and instructions for a smooth launch.",
    },
    {
        title: "Payment & Completion",
        desc: "Final project wrap-up, processing remaining payments, and transitioning to ongoing support if needed.",
    },
];

const Process = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stepsWrapperRef = useRef<HTMLDivElement>(null);
    const firstStepRef = useRef<HTMLDivElement>(null);
    const lastStepRef = useRef<HTMLDivElement>(null);
    const [stripPath, setStripPath] = useState({ top: 0, height: 0 });

    const isInView = useInView(containerRef, { once: false, margin: "-10%" });

    // Target the steps wrapper specifically for absolute synchronization
    const { scrollYProgress: rawScrollY } = useScroll({
        target: stepsWrapperRef,
        offset: ["start center", "end center"]
    });

    const scrollYProgress = useSpring(rawScrollY, {
        stiffness: 60,
        damping: 30,
        mass: 0.5,
        restDelta: 0.001
    });

    // Precise layout measurement
    React.useLayoutEffect(() => {
        const calculatePath = () => {
            if (firstStepRef.current && lastStepRef.current && stepsWrapperRef.current) {
                const firstRect = firstStepRef.current.getBoundingClientRect();
                const lastRect = lastStepRef.current.getBoundingClientRect();
                const wrapperRect = stepsWrapperRef.current.getBoundingClientRect();

                const firstCenter = (firstRect.top - wrapperRect.top) + (firstRect.height / 2);
                const lastCenter = (lastRect.top - wrapperRect.top) + (lastRect.height / 2);

                setStripPath({
                    top: firstCenter,
                    height: Math.max(0, lastCenter - firstCenter)
                });
            }
        };

        calculatePath();
        const timer = setTimeout(calculatePath, 150);
        window.addEventListener("resize", calculatePath);
        return () => {
            window.removeEventListener("resize", calculatePath);
            clearTimeout(timer);
        };
    }, []);

    // Clamp ensures the height stops EXACTLY at the last center even with spring momentum
    const stripHeight = useTransform(scrollYProgress, [0, 1], [0, stripPath.height], { clamp: true });

    return (
        <section ref={containerRef} id="process" className="py-24 md:py-32 bg-black selection:bg-accent-primary/30 scroll-mt-32">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-6xl mx-auto px-4 md:px-6 gpu-fix"
            >
                <div className="text-center mb-16 md:mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2 }}
                        className="text-3xl md:text-6xl font-black mb-6 tracking-tight uppercase"
                    >
                        Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#023E8A] via-[#49CADF] to-[#023E8A]">Path</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.2 }}
                        className="text-white/60 text-sm md:text-lg max-w-2xl mx-auto font-medium uppercase tracking-[0.2em]"
                    >
                        Precision workflow from concept to completion.
                    </motion.p>
                </div>

                <div className="relative" ref={stepsWrapperRef}>
                    {/* Simplified Strip */}
                    <div
                        style={{ top: `${stripPath.top}px`, height: `${stripPath.height}px` }}
                        className="absolute left-[20px] md:left-1/2 w-[2px] -ml-[1px] md:-ml-[1px] z-0"
                    >
                        {/* Static Track */}
                        <div className="absolute inset-0 bg-white/[0.05] rounded-full" />

                        {/* Animated Strip */}
                        <motion.div
                            style={{ height: stripHeight }}
                            className="w-full bg-gradient-to-b from-accent-primary via-accent-secondary to-[#a855f7] origin-top rounded-full z-[1]"
                        />
                    </div>

                    <div className="space-y-12 md:space-y-32 relative">
                        {steps.map((step, index) => {
                            const stepsCount = steps.length;
                            const scrollTarget = index / (stepsCount - 1);

                            // High-end sync: trigger window precisely around the strip arrival
                            const arriveStart = Math.max(0, scrollTarget - 0.1);
                            const arrivePeak = Math.min(1, scrollTarget);

                            // 1. Cinematic 'Unfolding' Animation
                            const boxOpacity = useTransform(scrollYProgress, [arriveStart, arrivePeak], [0, 1], { clamp: true });
                            const boxScale = useTransform(scrollYProgress, [arriveStart, arrivePeak], [0.95, 1], { clamp: true });
                            const boxY = useTransform(scrollYProgress, [arriveStart, arrivePeak], [20, 0], { clamp: true });
                            const boxFilter = useTransform(scrollYProgress, [arriveStart, arrivePeak], ["blur(8px)", "blur(0px)"], { clamp: true });

                            // 2. State-of-the-Art Indicator Activation
                            const indicatorScale = useTransform(scrollYProgress, [arriveStart, arrivePeak], [0.8, 1.2], { clamp: true });
                            const indicatorColor = useTransform(scrollYProgress, [arriveStart, arrivePeak], ["#1a1a1a", "#6366f1"], { clamp: true });

                            return (
                                <div
                                    key={index}
                                    ref={index === 0 ? firstStepRef : index === steps.length - 1 ? lastStepRef : null}
                                    className={`relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                                >
                                    <motion.div
                                        style={{
                                            opacity: boxOpacity,
                                            scale: boxScale,
                                            y: boxY,
                                            filter: boxFilter
                                        }}
                                        className="w-full md:w-[45%] glass-card pt-6 pb-6 pr-6 pl-14 md:p-10 rounded-2xl md:rounded-[3rem] relative z-10 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                                    >
                                        <h3 className="text-xl md:text-3xl font-black mb-3 md:mb-4 text-white uppercase italic tracking-tighter">
                                            {step.title}
                                        </h3>
                                        <p className="text-white/60 text-sm md:text-lg leading-relaxed font-medium">
                                            {step.desc}
                                        </p>
                                    </motion.div>

                                    {/* Simplified Indicator */}
                                    <motion.div
                                        style={{
                                            scale: indicatorScale,
                                            borderColor: indicatorColor,
                                            backgroundColor: "#000"
                                        }}
                                        className="absolute left-[20px] md:left-1/2 -ml-[18px] md:-ml-[18px] w-9 h-9 rounded-full border-2 z-20 flex items-center justify-center text-[11px] font-black text-white bg-black ring-[10px] md:ring-[15px] ring-black"
                                    >
                                        {index + 1}
                                    </motion.div>

                                    <div className="hidden md:block w-[45%]" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default Process;
