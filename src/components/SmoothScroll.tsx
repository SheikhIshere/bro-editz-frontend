"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { ReactNode, useEffect, useState } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        // Performance Audit Check: Disable smooth scroll on mobile or if reduced motion is preferred
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        
        if (!isMobile && !prefersReducedMotion) {
            setIsEnabled(true);
        }
    }, []);

    if (!isEnabled) return <>{children}</>;

    return (
        <ReactLenis 
            root 
            options={{
                lerp: 0.1,
                duration: 1.2,
                infinite: false,
                syncTouch: false, // Audit: Never sync touch to prevent scroll jank on mobile/touchpads
                smoothWheel: true,
                touchMultiplier: 2,
            }}
        >
            {children as any}
        </ReactLenis>
    );
}
