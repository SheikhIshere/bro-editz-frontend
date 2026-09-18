"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import HeroSection from "./components/HeroSection";
import {
    getHeroContent,
    updateHeroContent,
    listHeroContent,
    createHeroContent,
    deleteHeroContent,
    listHeroVideos,
    createHeroVideo,
    updateHeroVideo,
    deleteHeroVideo,
    listCoreServices,
    deleteCoreService,
    listExpertise,
    deleteExpertise,
    listWorkedWith,
    deleteWorkedWith,
    listWorksAdmin,
    deleteWork,
    listFAQsAdmin,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    featureFAQ,
    listContactLeads,
    updateContactStatus,
    deleteContactLead,
    listNewsletterEmails,
    markEmailAsSpam,
    restoreEmailFromSpam,
    deleteNewsletterEmail,
    exportNewsletterPDF,
} from "@/lib/admin-auth/server";
import ServicesSection from "./components/ServicesSection";
import PortfolioSection from "./components/PortfolioSection";
import ReviewsSection from "./components/ReviewsSection";
import FAQSection from "./components/FAQSection";
import ContactLeadsSection from "./components/ContactLeadsSection";
import EmailCapturesSection from "./components/EmailCapturesSection";
import FooterSection from "./components/FooterSection";
import SettingsSection from "./components/SettingsSection";
import ChangePasswordSection from "./components/ChangePasswordSection";
import CreateAdminSection from "./components/CreateAdminSection";
import { DeleteConfirmationModal, NotificationToast, VideoPlayer } from "./components/SharedComponents";
import {
    HeroContent,
    VideoItem,
    ServiceItem,
    ExpertiseItem,
    WorkedWithItem,
    PortfolioItem,
    FAQItem,
    ContactLead,
    EmailCapture,
    DeleteModal,
    VideoPlayerModal,
    Notification
} from "./components/types";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { normalizeWorks } from "@/lib/works/contract";

export default function AdminDashboard() {
    const { logout } = useAdminAuth();
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("admin_active_tab") || "hero";
        }
        return "hero";
    });

    useEffect(() => {
        localStorage.setItem("admin_active_tab", activeTab);
    }, [activeTab]);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState<DeleteModal>({
        isOpen: false,
        type: 'service', // Initial type, will be updated based on context
        id: '',
        title: ''
    });

    const [videoPlayerModal, setVideoPlayerModal] = useState<VideoPlayerModal>({
        isOpen: false,
        videoUrl: '',
        title: ''
    });

    const [notification, setNotification] = useState<Notification | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // State for all content sections
    const [heroContents, setHeroContents] = useState<HeroContent[]>([]);
    const [videos, setVideos] = useState<VideoItem[]>([]);

    const [videoSearch, setVideoSearch] = useState("");
    const [videoFilter, setVideoFilter] = useState("all");
    const [heroContentFilter, setHeroContentFilter] = useState("all");

    const toggleVideoVisibility = async (videoId: string | number) => {
        const video = videos.find(v => v.id === videoId);
        if (!video) return;

        setIsLoading(true);
        try {
            const result = await updateHeroVideo(videoId, { is_active: !video.is_active });
            if (result.ok) {
                // Refresh list to show updated activation states
                const listRes = await listHeroVideos();
                if (listRes.ok) setVideos(listRes.data.results || listRes.data);
                showNotification('success', `Video ${!video.is_active ? 'activated' : 'deactivated'} successfully!`);
            } else {
                showNotification('error', result.message || 'Failed to update video visibility.');
            }
        } catch (error) {
            showNotification('error', 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const [services, setServices] = useState<ServiceItem[]>([]);
    const [expertise, setExpertise] = useState<ExpertiseItem[]>([]);
    const [workedWith, setWorkedWith] = useState<WorkedWithItem[]>([]);

    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [leads, setLeads] = useState<ContactLead[]>([]);
    const [emails, setEmails] = useState<EmailCapture[]>([]);

    // Helper functions
    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const openVideoPlayer = (videoUrl: string, title: string) => {
        setVideoPlayerModal({ isOpen: true, videoUrl, title });
    };

    const fetchHeroContent = async () => {
        try {
            const result = await listHeroContent();
            if (result.ok && result.data) {
                setHeroContents(Array.isArray(result.data) ? result.data : (result.data.results || []));
            }
        } catch (error) {
            console.error("Error fetching hero content:", error);
        }
    };

    const fetchHeroVideos = async () => {
        try {
            const result = await listHeroVideos();
            if (result.ok && result.data) {
                setVideos(Array.isArray(result.data) ? result.data : (result.data.results || []));
            }
        } catch (error) {
            console.error("Error fetching hero videos:", error);
        }
    }

    const refreshPortfolio = async (): Promise<PortfolioItem[]> => {
        try {
            const result = await listWorksAdmin();
            if (result.ok) {
                const normalized = normalizeWorks(result.data);
                setPortfolio(normalized);
                return normalized;
            }

            showNotification('error', result.message || 'Failed to load portfolio works.');
            return [];
        } catch (error) {
            console.error("Error fetching works:", error);
            showNotification('error', 'Failed to load portfolio works.');
            return [];
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [
                heroRes,
                heroVideosRes,
                servicesRes,
                expertiseRes,
                workedWithRes,
                worksRes,
                faqsRes,
                leadsRes,
                newsletterRes
            ] = await Promise.all([
                listHeroContent(),
                listHeroVideos(),
                listCoreServices(),
                listExpertise(),
                listWorkedWith(),
                listWorksAdmin(),
                listFAQsAdmin(),
                listContactLeads(),
                listNewsletterEmails(),
            ]);

            if (heroRes.ok && heroRes.data) setHeroContents(Array.isArray(heroRes.data) ? heroRes.data : (heroRes.data.results || []));
            if (heroVideosRes.ok && heroVideosRes.data) setVideos(Array.isArray(heroVideosRes.data) ? heroVideosRes.data : (heroVideosRes.data.results || []));
            if (servicesRes.ok) setServices(Array.isArray(servicesRes.data) ? servicesRes.data : (servicesRes.data.results || []));
            if (expertiseRes.ok) setExpertise(Array.isArray(expertiseRes.data) ? expertiseRes.data : (expertiseRes.data.results || []));
            if (workedWithRes.ok) setWorkedWith(Array.isArray(workedWithRes.data) ? workedWithRes.data : (workedWithRes.data.results || []));
            if (worksRes.ok) {
                setPortfolio(normalizeWorks(worksRes.data));
            }

            // New Integrations
            if (faqsRes.ok) setFaqs(Array.isArray(faqsRes.data) ? faqsRes.data : (faqsRes.data.results || []));
            if (leadsRes.ok) {
                const rawLeads = Array.isArray(leadsRes.data) ? leadsRes.data : (leadsRes.data.results || []);
                setLeads(rawLeads.map((l: any) => ({
                    ...l,
                    status: (l.contact || l.mail_status || l.status || 'new').toLowerCase(),
                    message: l.description || l.message || "",
                    timestamp: l.created_at || l.timestamp || new Date().toISOString(),
                    // Handle location mapping from backend string "City, Country" or "Country"
                    ip_location: l.ip_location || "Unknown"
                })));
            }
            if (newsletterRes.ok) setEmails(Array.isArray(newsletterRes.data) ? newsletterRes.data : (newsletterRes.data.data || newsletterRes.data.results || []));

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            showNotification('error', 'Failed to fetch some dashboard data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const saveHeroContent = async (id?: number, data?: Partial<HeroContent>) => {
        setIsLoading(true);
        try {
            let result;
            if (id && data) {
                result = await updateHeroContent(id, data);
            } else if (data) {
                result = await createHeroContent(data);
            } else {
                return; // Should not happen with new structure
            }

            if (result.ok) {
                showNotification('success', `Hero content ${id ? 'updated' : 'created'} successfully!`);
                fetchHeroContent(); // Refresh list
            } else {
                showNotification('error', result.message || 'Failed to save hero content.');
            }
        } catch (error) {
            console.error("Error saving hero content:", error);
            showNotification('error', 'An error occurred while saving.');
        } finally {
            setIsLoading(false);
        }
    };

    const activateHeroContent = async (id: number) => {
        setIsLoading(true);
        try {
            const result = await updateHeroContent(id, { is_active: true });
            if (result.ok) {
                showNotification('success', 'Hero content activated successfully!');
                fetchHeroContent();
            } else {
                showNotification('error', result.message || 'Failed to activate.');
            }
        } catch (error) {
            showNotification('error', 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    const saveHeroVideo = async (id?: string | number, data?: unknown) => {
        setIsLoading(true);
        try {
            let result;
            if (id) {
                result = await updateHeroVideo(id, data);
            } else {
                result = await createHeroVideo(data);
            }

            if (result.ok) {
                showNotification('success', `Video ${id ? 'updated' : 'created'} successfully!`);
                fetchHeroVideos(); // Refresh list
            } else {
                showNotification('error', result.message || 'Failed to save video.');
            }
        } catch (error) {
            console.error("Error saving video:", error);
            showNotification('error', 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };


    const saveServices = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            showNotification('success', 'Services saved successfully!');
        }, 1500);
    };

    const addVideo = () => {
        // This will be handled by the modal, or we just pass a null to open edit modal
        showNotification('success', 'Opening video editor...');
    };

    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(videoSearch.toLowerCase());
        const matchesFilter = videoFilter === 'all' ||
            (videoFilter === 'published' && video.is_active) ||
            (videoFilter === 'draft' && !video.is_active);
        return matchesSearch && matchesFilter;
    });

    const handleDeleteConfirm = async () => {
        setIsLoading(true);
        try {
            let result;
            switch (deleteModal.type) {
                case 'service':
                    result = await deleteCoreService(deleteModal.id);
                    if (result.ok) setServices(services.filter(s => String(s.id) !== String(deleteModal.id)));
                    break;
                case 'expertise':
                    result = await deleteExpertise(deleteModal.id);
                    if (result.ok) setExpertise(expertise.filter(e => String(e.id) !== String(deleteModal.id)));
                    break;
                case 'industry':
                    result = await deleteWorkedWith(deleteModal.id);
                    if (result.ok) setWorkedWith(workedWith.filter(w => String(w.id) !== String(deleteModal.id)));
                    break;
                case 'portfolio':
                    result = await deleteWork(deleteModal.id);
                    if (result.ok) await refreshPortfolio();
                    break;
                case 'faq':
                    result = await deleteFAQ(deleteModal.id);
                    if (result.ok) setFaqs(faqs.filter(f => String(f.id) !== String(deleteModal.id)));
                    break;
                case 'lead':
                    result = await deleteContactLead(deleteModal.id);
                    if (result.ok) setLeads(leads.filter(l => String(l.id) !== String(deleteModal.id)));
                    break;
                case 'email':
                    result = await deleteNewsletterEmail(deleteModal.id);
                    if (result.ok) setEmails(emails.filter(e => String(e.id) !== String(deleteModal.id)));
                    break;
                case 'video':
                    result = await deleteHeroVideo(deleteModal.id);
                    if (result.ok) {
                        showNotification('success', 'Video deleted successfully!');
                        setVideos(videos.filter(v => String(v.id) !== String(deleteModal.id)));
                    }
                    break;
                case 'hero_content':
                    result = await deleteHeroContent(Number(deleteModal.id));
                    if (result.ok) {
                        showNotification('success', 'Hero content deleted successfully!');
                        fetchHeroContent();
                    }
                    break;
            }

            if (result && !result.ok) {
                showNotification('error', result.message || 'Failed to delete item.');
            } else {
                showNotification('success', 'Item deleted successfully!');
            }
        } catch (error) {
            console.error("Delete error:", error);
            showNotification('error', 'An error occurred during deletion.');
        } finally {
            setIsLoading(false);
            setDeleteModal({ ...deleteModal, isOpen: false });
        }
    };

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case "hero":
                return (
                    <HeroSection
                        heroContents={heroContents}
                        setHeroContents={setHeroContents}
                        videos={videos}
                        setVideos={setVideos}
                        videoSearch={videoSearch}
                        setVideoSearch={setVideoSearch}
                        videoFilter={videoFilter}
                        setVideoFilter={setVideoFilter}
                        videoPlayerModal={videoPlayerModal}
                        setVideoPlayerModal={setVideoPlayerModal}
                        isLoading={isLoading}
                        saveHeroContent={saveHeroContent}
                        activateHeroContent={activateHeroContent}
                        heroContentFilter={heroContentFilter}
                        setHeroContentFilter={setHeroContentFilter}
                        saveHeroVideo={saveHeroVideo}
                        showNotification={showNotification}
                        addVideo={addVideo}
                        filteredVideos={filteredVideos}
                        openVideoPlayer={openVideoPlayer}
                        toggleVideoVisibility={toggleVideoVisibility}
                        setDeleteModal={setDeleteModal}
                    />
                );
            case "services":
                return (
                    <ServicesSection
                        services={services}
                        setServices={setServices}
                        expertise={expertise}
                        setExpertise={setExpertise}
                        workedWith={workedWith}
                        setWorkedWith={setWorkedWith}
                        isLoading={isLoading}
                        showNotification={showNotification}
                        setDeleteModal={setDeleteModal}
                    />
                );
            case "portfolio":
                return (
                    <PortfolioSection
                        portfolio={portfolio}
                        setPortfolio={setPortfolio}
                        setDeleteModal={setDeleteModal}
                        showNotification={showNotification}
                        openVideoPlayer={openVideoPlayer}
                        refreshPortfolio={refreshPortfolio}
                    />
                );
            case "reviews":
                return (
                    <ReviewsSection
                        showNotification={showNotification}
                        openVideoPlayer={openVideoPlayer}
                    />
                );
            case "faqs":
                return (
                    <FAQSection
                        faqs={faqs}
                        setFaqs={setFaqs}
                        deleteModal={deleteModal}
                        setDeleteModal={setDeleteModal}
                        showNotification={showNotification}
                    />
                );
            case "leads":
                return (
                    <ContactLeadsSection
                        leads={leads}
                        setLeads={setLeads}
                        deleteModal={deleteModal}
                        setDeleteModal={setDeleteModal}
                        showNotification={showNotification}
                    />
                );
            case "emails":
                return (
                    <EmailCapturesSection
                        emails={emails}
                        setEmails={setEmails}
                        deleteModal={deleteModal}
                        setDeleteModal={setDeleteModal}
                        showNotification={showNotification}
                    />
                );
            case "footer":
                return (
                    <FooterSection showNotification={showNotification} />
                );
            case "settings":
                return (
                    <SettingsSection
                        showNotification={showNotification}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background text-white flex overflow-x-hidden">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setActiveTab(tab);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onLogout={logout}
            />

            <main className={`flex-1 min-w-0 transition-all duration-300 lg:pl-64`}>
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center justify-between mb-8 sticky top-0 z-40 bg-background/80 backdrop-blur-md py-4 border-b border-white/10 -mx-4 px-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-cover rounded-lg" />
                            <span className="text-lg font-black tracking-tighter uppercase">
                                <span className="text-white">Bro</span>
                                <span style={{ color: '#0094C8' }}>Editz</span>
                            </span>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                        </button>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {renderContent()}
                    </div>
                </div>
            </main>

            {/* Modals */}
            <DeleteConfirmationModal
                deleteModal={deleteModal}
                setDeleteModal={setDeleteModal}
                onConfirm={handleDeleteConfirm}
            />

            <VideoPlayer
                videoPlayerModal={videoPlayerModal}
                setVideoPlayerModal={setVideoPlayerModal}
            />

            <NotificationToast notification={notification} />
        </div>
    );
}
