import type { IndustryType, ServiceIconType } from "@/lib/services/contract";

// Types for all content sections
export interface HeroContent {
    id?: number;
    title: string;
    subtitle: string;
    description: string;
    verification_status: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface VideoItem {
    id: string | number;
    title: string;
    youtube_url: string;
    thumbnail: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ServiceItem {
    id: string | number;
    title: string;
    description: string;
    icon_type: ServiceIconType;
    tag1: string;
    tag2: string;
    tag3: string;
    is_active: boolean;
}

export interface ReviewItem {
    id: string;
    name: string;
    role: string;
    company: string;
    rating: number;
    testimonial: string;
    date: string;
    videoUrl?: string;
    videoThumbnail?: string;
    published: boolean;
    featured: boolean;
}

export interface ExpertiseItem {
    id: string | number;
    title: string;
    description: string;
    icon_type: ServiceIconType;
    is_active: boolean;
}

export interface WorkedWithItem {
    id: string | number;
    title: string;
    description: string;
    industry_type: IndustryType;
    industry_type_display?: string;
    is_active: boolean;
}

export interface PortfolioItem {
    id: number;
    title: string;
    description: string;
    thumbnail: string | null;
    video_url: string;
    publish_date: string | null;
    visibility: boolean;
    is_featured: boolean;
    tags: Array<{
        id: number;
        name: string;
    }>;
    created_at: string;
    updated_at: string;
}

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    is_featured: boolean;
    is_answered: boolean;
    is_read: boolean;
}

export interface ContactLead {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    timestamp: string;
    status: 'new' | 'contacted' | 'resolved';
    ipAddress?: string;
    ip_location?: string;
    location?: {
        country: string;
        city: string;
        region?: string;
    };
}

export interface EmailCapture {
    id: string;
    email: string;
    subscribed_at: string;
    ip_location: string;
    is_spam: boolean;
}

export interface DeleteModal {
    isOpen: boolean;
    type: 'service' | 'portfolio' | 'faq' | 'lead' | 'email' | 'video' | 'expertise' | 'industry' | 'hero_content';
    id: string | number;
    title: string;
}

export interface VideoPreview {
    isOpen: boolean;
    videoUrl: string;
    title: string;
}

export interface VideoPlayerModal {
    isOpen: boolean;
    videoUrl: string;
    title: string;
}

export interface IconPickerModal {
    isOpen: boolean;
    itemId: string | number;
    currentIcon: ServiceIconType;
    type: 'service' | 'expertise';
}

export interface Notification {
    type: 'success' | 'error';
    message: string;
}
