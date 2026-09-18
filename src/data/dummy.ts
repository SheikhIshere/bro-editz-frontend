/**
 * BroEditz Frontend - Centralized Dummy Data
 * No backend required - frontend works standalone with this data.
 * You can replace these URLs/titles with real content when backend is ready.
 * 
 * Sources as requested:
 *  Portfolio (Shorts):
 *   - https://www.youtube.com/shorts/bJBnMBXhVg0
 *   - https://www.youtube.com/shorts/yq6RcvtWKas
 *   - https://www.youtube.com/shorts/dblGGEbpc9w
 *  Review (Video):
 *   - https://www.youtube.com/shorts/3DVJ81fUlXg
 *  Landing / Hero Video:
 *   - https://www.youtube.com/watch?v=aj2QXCgiEzQ&list=RDGMEM_6azG-gbwFIpRtH6PATXiQVMaj2QXCgiEzQ&start_radio=1
 */

export const DUMMY_HERO_CONTENT = {
  title: "Cinematic\nVisual Storytelling",
  subtitle: "Creative Solutions, Trusted Globally",
  description:
    "We turn ideas into visuals through AI-enhanced video production\nand cinematic editing that captivates audiences worldwide. Trusted by 500+ brands.",
};

export const DUMMY_HERO_VIDEO = {
  video_url:
    "https://www.youtube.com/watch?v=aj2QXCgiEzQ&list=RDGMEM_6azG-gbwFIpRtH6PATXiQVMaj2QXCgiEzQ&start_radio=1",
  thumbnail_url: "https://img.youtube.com/vi/aj2QXCgiEzQ/hqdefault.jpg",
  // Fallback local preview if youtube thumbnail fails
  fallback_thumbnail: "/hero-showcase.png",
};

// Helpers for youtube thumbnail
function ytThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/**
 * Portfolio dummy works
 * - 3 Shorts (as requested) with tag "Shorts" to trigger Shorts swipe view
 * - 3 Long videos for grid view (All) - using the hero video + 2 extra high-quality samples
 */
export const DUMMY_WORKS = [
  {
    id: 1,
    title: "Viral Fashion Reel — Streetwear Drop",
    description:
      "Fast-paced vertical cut for a streetwear brand. Trending transitions, beat-sync and AI color grade. Crafted for TikTok & Reels maximum retention.",
    thumbnail: ytThumb("bJBnMBXhVg0"),
    video_url: "https://www.youtube.com/shorts/bJBnMBXhVg0",
    publish_date: new Date().toISOString(),
    visibility: true,
    is_featured: true,
    tags: [
      { id: 101, name: "Shorts" },
      { id: 102, name: "Reels" },
      { id: 103, name: "Fashion" },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Cinematic Product Teaser — Minimal Reveal",
    description:
      "Luxury product reveal with anamorphic lens emulation and foley sound design. Designed to stop scroll in first 2 seconds.",
    thumbnail: ytThumb("yq6RcvtWKas"),
    video_url: "https://www.youtube.com/shorts/yq6RcvtWKas",
    publish_date: new Date().toISOString(),
    visibility: true,
    is_featured: true,
    tags: [
      { id: 101, name: "Shorts" },
      { id: 104, name: "Commercial" },
      { id: 105, name: "AI Edit" },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Dynamic Cut — Founder Story 60s",
    description:
      "Founder-led vertical story with captions, B-roll overlay and retention editing. Built for Instagram & YouTube Shorts algorithm.",
    thumbnail: ytThumb("dblGGEbpc9w"),
    video_url: "https://www.youtube.com/shorts/dblGGEbpc9w",
    publish_date: new Date().toISOString(),
    visibility: true,
    is_featured: true,
    tags: [
      { id: 101, name: "Shorts" },
      { id: 106, name: "Storytelling" },
      { id: 105, name: "AI Edit" },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Long form — grid view (All)
  {
    id: 4,
    title: "BroEditz Showreel 2024 — Cinematic Journey",
    description:
      "Flagship showreel: fashion, commercial, podcast and product films in one timeline. 4K color graded, sound designed, broadcast ready.",
    thumbnail: ytThumb("aj2QXCgiEzQ"),
    video_url: "https://www.youtube.com/watch?v=aj2QXCgiEzQ",
    publish_date: new Date().toISOString(),
    visibility: true,
    is_featured: true,
    tags: [
      { id: 201, name: "Showreel" },
      { id: 202, name: "Cinematic" },
      { id: 203, name: "Commercial" },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    title: "E-Commerce Scale — UGC Ads Compilation",
    description:
      "30+ UGC ads stitched into a conversion-focused compilation. Hook variants, CTA overlays, platform-native ratios for Meta & TikTok.",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    publish_date: new Date().toISOString(),
    visibility: true,
    is_featured: false,
    tags: [
      { id: 204, name: "E-Commerce" },
      { id: 205, name: "Ads" },
      { id: 202, name: "Cinematic" },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    title: "Podcast to Viral Clips — AI Pipeline",
    description:
      "2-hour podcast atomized into 12 viral clips with auto-captions, zooms and B-roll. Showcasing our AI-powered workflow.",
    thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg",
    video_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    publish_date: new Date().toISOString(),
    visibility: true,
    is_featured: false,
    tags: [
      { id: 206, name: "Podcast" },
      { id: 105, name: "AI Edit" },
      { id: 203, name: "Commercial" },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DUMMY_VIDEO_REVIEWS = [
  {
    id: 901,
    title: "Featured Client — Review Short",
    description:
      "Real client feedback recorded vertically. Authentic reaction to our editing speed and quality.",
    video_url: "https://www.youtube.com/shorts/3DVJ81fUlXg",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 902,
    title: "SARAH J. - E-COMMERCE FOUNDER",
    description:
      "Working with this team was a game-changer for our brand's visual identity. The results exceeded everything we imagined.",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 903,
    title: "RAHUL K. — AGENCY OWNER",
    description:
      "White-label partner for 18 months. 200+ videos delivered, zero missed deadline. BroEditz is our secret weapon.",
    video_url: "https://www.youtube.com/shorts/yq6RcvtWKas",
    featured: true,
    created_at: new Date().toISOString(),
  },
];

export const DUMMY_TEXT_REVIEWS = [
  {
    id: 801,
    client_name: "ELITE STUDIO",
    designation: "PRODUCTION HOUSE",
    company_logo: null as string | null,
    review_text:
      "BroEditz transformed our brand identity with exceptional video production. Their attention to detail and creative storytelling elevated our content beyond expectations. The team's professionalism makes them our go-to partner.",
    star_rating: "5.0",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 802,
    client_name: "ROYAL STYLES",
    designation: "FASHION BRAND",
    company_logo: null,
    review_text:
      "Outstanding quality! BroEditz captured the essence of our luxury brand perfectly. Their ability to understand vision and translate into stunning visuals is remarkable.",
    star_rating: "4.9",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 803,
    client_name: "XENIA",
    designation: "DIGITAL AGENCY",
    company_logo: null,
    review_text:
      "AI-powered video production and creative direction have increased our engagement by 340%. Team delivers consistently exceptional results — highly recommended.",
    star_rating: "5.0",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 804,
    client_name: "NEXGEN TECH",
    designation: "SAAS STARTUP",
    company_logo: null,
    review_text:
      "They turned our complex SaaS product demo into a simple, beautiful narrative. Investor response was phenomenal after the new video.",
    star_rating: "5.0",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 805,
    client_name: "LUXE LOCAL",
    designation: "RETAIL CHAIN",
    company_logo: null,
    review_text:
      "Local business, global quality. BroEditz gave us agency-level polish at startup-friendly pricing and speed.",
    star_rating: "4.8",
    featured: true,
    created_at: new Date().toISOString(),
  },
];

export const DUMMY_SERVICES = [
  {
    id: "dummy-s1",
    title: "Cinematic Film",
    desc: "High-end brand storytelling with cinema-grade visuals and emotional pacing.",
    iconKey: "film" as const,
    color: "accent-primary" as const,
    details: ["Pro Color Grading", "4K Resolution", "Masterful Editing"],
  },
  {
    id: "dummy-s2",
    title: "Commercial Shoots",
    desc: "Professional production design for high-converting commercial campaigns.",
    iconKey: "video" as const,
    color: "accent-secondary" as const,
    details: ["Studio Setup", "Directing", "Live Production"],
  },
  {
    id: "dummy-s3",
    title: "Short-Form Viral",
    desc: "Reels, Shorts, TikToks engineered for retention and algorithm boost.",
    iconKey: "film" as const,
    color: "accent-tertiary" as const,
    details: ["Hook Craft", "Caption Burn", "Trend Audio"],
  },
  {
    id: "dummy-s4",
    title: "AI Video Pipeline",
    desc: "Automated clipping, captions, B-roll and repurposing with human QA.",
    iconKey: "brain" as const,
    color: "accent-quaternary" as const,
    details: ["Auto Captions", "Smart Zooms", "10x Faster"],
  },
];

export const DUMMY_FAQS = [
  {
    question: "What services do you provide?",
    answer:
      "We specialize in Cinematic Storytelling, Short-Form Viral Editing (Reels/Shorts/TikTok), AI-Powered Repurposing, Commercial Shoots, Podcast Clipping and brand Photography.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Shorts/Reels: 24-48h. Long-form edits: 3-5 days. Full campaigns: 1-4 weeks depending on scope. Rush available.",
  },
  {
    question: "Do you offer revisions?",
    answer:
      "Yes — 2-3 rounds included standard, unlimited until satisfaction on premium retainers.",
  },
  {
    question: "What is your pricing model?",
    answer:
      "Per-video, pack (10/20/30) and monthly retainer. White-label for agencies. Custom quote in 12h.",
  },
  {
    question: "Can you work with clients internationally?",
    answer:
      "Absolutely — we work across time zones with async review (Frame.io / Drive) and live calls.",
  },
  {
    question: "How do we get started?",
    answer:
      "Hit 'Book A Call' or send a sample video via the Contact form. We'll audit it free and propose a plan.",
  },
  {
    question: "Do you handle YouTube SEO & thumbnails?",
    answer:
      "Yes — we deliver title, description, tags, chapters and CTR-optimized thumbnail variants.",
  },
  {
    question: "What formats do you deliver?",
    answer:
      "9:16, 1:1, 16:9, 4:5 — with SRT, clean master and platform-ready exports.",
  },
];

export const DUMMY_STATS = {
  clients: "500+",
  videosDelivered: "12k+",
  retentionLift: "340%",
  rating: "4.9/5",
};

export const DUMMY_CONTACT = {
  email: "contact@broeditz.com",
  phone: "+88 017XX-XXXXXX (placeholder)",
  address: "Dhaka, Bangladesh — Remote Worldwide",
  calLink: "#contact",
};
