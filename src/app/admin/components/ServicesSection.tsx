import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  X,
  Film,
  Sparkles,
  Music,
  Brain,
  Share2,
  Briefcase,
  Building,
  Award,
  Users,
  Star,
  Target,
  TrendingUp,
  Video,
} from "lucide-react";
import {
  ServiceItem,
  ExpertiseItem,
  WorkedWithItem,
  IconPickerModal,
  DeleteModal,
} from "./types";
import {
  createCoreService,
  updateCoreService,
  createExpertise,
  updateExpertise,
  createWorkedWith,
  updateWorkedWith,
  listCoreServices,
  listExpertise,
  listWorkedWith,
} from "@/lib/admin-auth/server";
import {
  DEFAULT_SERVICE_ICON_TYPE,
  getIndustryTypeUi,
  getServiceIconUi,
  INDUSTRY_TYPE_OPTIONS,
  isIndustryType,
  isServiceIconType,
  normalizeApiList,
  SERVICE_ICON_OPTIONS,
  type IndustryIconKey,
  type IndustryType,
  type ServiceIconKey,
  type ServiceIconType,
} from "@/lib/services/contract";

interface ServicesSectionProps {
  services: ServiceItem[];
  setServices: (services: ServiceItem[]) => void;
  expertise: ExpertiseItem[];
  setExpertise: (expertise: ExpertiseItem[]) => void;
  workedWith: WorkedWithItem[];
  setWorkedWith: (workedWith: WorkedWithItem[]) => void;
  isLoading: boolean;
  showNotification: (type: "success" | "error", message: string) => void;
  setDeleteModal: (modal: DeleteModal) => void;
}

const serviceIconComponents: Record<ServiceIconKey, React.ComponentType<{ size?: number }>> = {
  video: Video,
  film: Film,
  brain: Brain,
  music: Music,
  users: Users,
  target: Target,
  sparkles: Sparkles,
};

const industryIconComponents: Record<IndustryIconKey, React.ComponentType<{ size?: number }>> = {
  share2: Share2,
  award: Award,
  users: Users,
  briefcase: Briefcase,
  film: Film,
  star: Star,
  building: Building,
  target: Target,
  "trending-up": TrendingUp,
};

function normalizeString(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function validateCoreService(payload: {
  title: string;
  description: string;
  icon_type: ServiceIconType;
  tag1: string;
  tag2: string;
  tag3: string;
}): string | null {
  const title = normalizeString(payload.title, 100);
  const description = payload.description.trim();
  const tag1 = normalizeString(payload.tag1, 30);
  const tag2 = normalizeString(payload.tag2, 30);
  const tag3 = normalizeString(payload.tag3, 30);

  if (title.length < 3) return "Service title must be at least 3 characters.";
  if (!description) return "Service description is required.";
  if (!tag1 || !tag2 || !tag3) return "All 3 service tags are required.";
  if (!isServiceIconType(payload.icon_type)) return "Please choose a valid service icon type.";

  return null;
}

function validateExpertise(payload: {
  title: string;
  description: string;
  icon_type: ServiceIconType;
}): string | null {
  const title = normalizeString(payload.title, 100);
  const description = payload.description.trim();

  if (!title) return "Expertise title is required.";
  if (description.length < 10) return "Expertise description must be at least 10 characters.";
  if (!isServiceIconType(payload.icon_type)) return "Please choose a valid expertise icon type.";

  return null;
}

function validateWorkedWith(payload: {
  title: string;
  description: string;
  industry_type: IndustryType;
}): string | null {
  const title = normalizeString(payload.title, 100);
  const description = payload.description.trim();

  if (title.length < 3) return "Industry title must be at least 3 characters.";
  if (!description) return "Industry description is required.";
  if (!isIndustryType(payload.industry_type)) return "Please choose a valid industry type.";

  return null;
}

export default function ServicesSection({
  services,
  setServices,
  expertise,
  setExpertise,
  workedWith,
  setWorkedWith,
  isLoading,
  showNotification,
  setDeleteModal,
}: ServicesSectionProps) {
  const [iconPickerModal, setIconPickerModal] = useState<IconPickerModal>({
    isOpen: false,
    itemId: "",
    currentIcon: DEFAULT_SERVICE_ICON_TYPE,
    type: "service",
  });

  const [newService, setNewService] = useState({
    title: "",
    description: "",
    icon_type: DEFAULT_SERVICE_ICON_TYPE as ServiceIconType,
    tag1: "",
    tag2: "",
    tag3: "",
    is_active: true,
  });

  const [expertiseModal, setExpertiseModal] = useState({
    isOpen: false,
    isEditing: false,
    id: "",
    title: "",
    description: "",
    icon_type: DEFAULT_SERVICE_ICON_TYPE as ServiceIconType,
  });

  const [workedWithModal, setWorkedWithModal] = useState({
    isOpen: false,
    isEditing: false,
    id: "",
    title: "",
    description: "",
    industry_type: "BRAND" as IndustryType,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const refreshServices = async () => {
    const res = await listCoreServices();
    if (res.ok) {
      setServices(normalizeApiList<ServiceItem>(res.data));
    }
  };

  const refreshExpertise = async () => {
    const res = await listExpertise();
    if (res.ok) {
      setExpertise(normalizeApiList<ExpertiseItem>(res.data));
    }
  };

  const refreshWorkedWith = async () => {
    const res = await listWorkedWith();
    if (res.ok) {
      setWorkedWith(normalizeApiList<WorkedWithItem>(res.data));
    }
  };

  const openIconPicker = (
    itemId: ServiceItem["id"] | ExpertiseItem["id"],
    currentIcon: ServiceIconType,
    type: "service" | "expertise"
  ) => {
    setIconPickerModal({ isOpen: true, itemId, currentIcon, type });
  };

  const closeIconPicker = () => {
    setIconPickerModal({
      isOpen: false,
      itemId: "",
      currentIcon: DEFAULT_SERVICE_ICON_TYPE,
      type: "service",
    });
  };

  const handleIconChange = async (itemId: ServiceItem["id"], newIcon: ServiceIconType) => {
    if (!isServiceIconType(newIcon)) {
      showNotification("error", "Invalid icon type selected.");
      closeIconPicker();
      return;
    }

    if (iconPickerModal.type === "service") {
      setServices(
        services.map((s) =>
          String(s.id) === String(itemId) ? { ...s, icon_type: newIcon } : s
        )
      );

      const res = await updateCoreService(itemId, { icon_type: newIcon });
      if (res.ok) {
        showNotification("success", "Icon updated");
      } else {
        showNotification("error", res.message || "Failed to update icon.");
        await refreshServices();
      }
    } else {
      setExpertise(
        expertise.map((e) =>
          String(e.id) === String(itemId) ? { ...e, icon_type: newIcon } : e
        )
      );

      const res = await updateExpertise(itemId, { icon_type: newIcon });
      if (res.ok) {
        showNotification("success", "Icon updated");
      } else {
        showNotification("error", res.message || "Failed to update icon.");
        await refreshExpertise();
      }
    }

    closeIconPicker();
  };

  const handleServicePatch = async (service: ServiceItem, patch: Partial<ServiceItem>) => {
    const merged = {
      title: (patch.title ?? service.title) as string,
      description: (patch.description ?? service.description) as string,
      icon_type: (patch.icon_type ?? service.icon_type) as ServiceIconType,
      tag1: (patch.tag1 ?? service.tag1) as string,
      tag2: (patch.tag2 ?? service.tag2) as string,
      tag3: (patch.tag3 ?? service.tag3) as string,
    };

    const error = validateCoreService(merged);
    if (error) {
      showNotification("error", error);
      await refreshServices();
      return;
    }

    const res = await updateCoreService(service.id, patch);
    if (!res.ok) {
      showNotification("error", res.message || "Failed to update service.");
      await refreshServices();
    }
  };

  const handleExpertisePatch = async (
    item: ExpertiseItem,
    patch: Partial<ExpertiseItem>
  ) => {
    const merged = {
      title: (patch.title ?? item.title) as string,
      description: (patch.description ?? item.description) as string,
      icon_type: (patch.icon_type ?? item.icon_type) as ServiceIconType,
    };

    const error = validateExpertise(merged);
    if (error) {
      showNotification("error", error);
      await refreshExpertise();
      return;
    }

    const res = await updateExpertise(item.id, patch);
    if (!res.ok) {
      showNotification("error", res.message || "Failed to update expertise.");
      await refreshExpertise();
    }
  };

  const handleWorkedWithPatch = async (
    item: WorkedWithItem,
    patch: Partial<WorkedWithItem>
  ) => {
    const merged = {
      title: (patch.title ?? item.title) as string,
      description: (patch.description ?? item.description) as string,
      industry_type: (patch.industry_type ?? item.industry_type) as IndustryType,
    };

    const error = validateWorkedWith(merged);
    if (error) {
      showNotification("error", error);
      await refreshWorkedWith();
      return;
    }

    const res = await updateWorkedWith(item.id, patch);
    if (!res.ok) {
      showNotification("error", res.message || "Failed to update industry.");
      await refreshWorkedWith();
    }
  };

  const handleAddService = async () => {
    const error = validateCoreService(newService);
    if (error) {
      showNotification("error", error);
      return;
    }

    const res = await createCoreService({
      ...newService,
      title: normalizeString(newService.title, 100),
      description: newService.description.trim(),
      tag1: normalizeString(newService.tag1, 30),
      tag2: normalizeString(newService.tag2, 30),
      tag3: normalizeString(newService.tag3, 30),
    });

    if (res.ok) {
      setServices([...services, res.data]);
      setNewService({
        title: "",
        description: "",
        icon_type: DEFAULT_SERVICE_ICON_TYPE,
        tag1: "",
        tag2: "",
        tag3: "",
        is_active: true,
      });
      showNotification("success", "Service added successfully");
    } else {
      showNotification("error", res.message || "Failed to add service");
    }
  };

  const handleAddExpertise = async () => {
    const payload = {
      title: normalizeString(expertiseModal.title, 100),
      description: expertiseModal.description.trim(),
      icon_type: expertiseModal.icon_type,
    };

    const error = validateExpertise(payload);
    if (error) {
      showNotification("error", error);
      return;
    }

    const res = await createExpertise(payload);
    if (res.ok) {
      setExpertise([...expertise, res.data]);
      setExpertiseModal({
        isOpen: false,
        isEditing: false,
        id: "",
        title: "",
        description: "",
        icon_type: DEFAULT_SERVICE_ICON_TYPE,
      });
      showNotification("success", "Expertise added successfully");
    } else {
      showNotification("error", res.message || "Failed to add expertise");
    }
  };

  const handleAddIndustry = async () => {
    const payload = {
      title: normalizeString(workedWithModal.title, 100),
      description: workedWithModal.description.trim(),
      industry_type: workedWithModal.industry_type,
    };

    const error = validateWorkedWith(payload);
    if (error) {
      showNotification("error", error);
      return;
    }

    const res = await createWorkedWith(payload);
    if (res.ok) {
      setWorkedWith([...workedWith, res.data]);
      setWorkedWithModal({
        isOpen: false,
        isEditing: false,
        id: "",
        title: "",
        description: "",
        industry_type: "BRAND",
      });
      showNotification("success", "Industry added successfully");
    } else {
      showNotification("error", res.message || "Failed to add industry");
    }
  };

  const filteredServices = Array.isArray(services)
    ? services.filter((service) => {
        const title = (service.title || "").toLowerCase();
        const description = (service.description || "").toLowerCase();
        const query = searchQuery.toLowerCase();

        return title.includes(query) || description.includes(query);
      })
    : [];

  return (
    <div className="space-y-12 pb-20">
      {/* Services Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">
            Core{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
              Services
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl font-light">
            The heartbeat of our agency. Manage your high-end cinematic offerings and service categories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-accent-primary transition-colors">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all w-full md:w-64 backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      {/* Quick Add Service */}
      <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/10 to-transparent">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center text-accent-primary">
            <Plus size={20} />
          </div>
          <h3 className="text-xl font-bold text-white uppercase tracking-wider">Quick Create Service</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">
              Service Title
            </label>
            <input
              type="text"
              placeholder="e.g., Cinematic Brand Films"
              value={newService.title}
              onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-accent-primary transition-all"
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">
              Description
            </label>
            <input
              type="text"
              placeholder="Briefly describe the unique value of this service..."
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-accent-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">
              Icon Type
            </label>
            <select
              value={newService.icon_type}
              onChange={(e) => {
                const value = e.target.value;
                if (isServiceIconType(value)) {
                  setNewService({ ...newService, icon_type: value });
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-accent-primary transition-all appearance-none"
            >
              {SERVICE_ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0A1118]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">
                Tag {i}
              </label>
              <input
                type="text"
                placeholder={`Feature ${i}`}
                value={newService[`tag${i}` as "tag1" | "tag2" | "tag3"]}
                onChange={(e) =>
                  setNewService({
                    ...newService,
                    [`tag${i}`]: e.target.value,
                  } as typeof newService)
                }
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-accent-primary transition-all"
              />
            </div>
          ))}

          <div className="lg:col-span-3">
            <button
              disabled={isLoading}
              onClick={handleAddService}
              className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-sm hover:bg-accent-primary hover:text-white transition-all shadow-2xl shadow-accent-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Add New Service
            </button>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredServices.map((service) => {
            const serviceMeta = getServiceIconUi(service.icon_type);
            const IconComponent = serviceIconComponents[serviceMeta.iconKey];

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card group p-8 rounded-[3rem] border border-white/10 relative overflow-hidden flex flex-col h-full bg-white/[0.02]"
              >
                <button
                  onClick={() =>
                    setDeleteModal({
                      isOpen: true,
                      type: "service",
                      id: service.id,
                      title: service.title,
                    })
                  }
                  className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                >
                  <Trash2 size={18} />
                </button>

                <div className="mb-8">
                  <button
                    onClick={() => openIconPicker(service.id, service.icon_type, "service")}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-all shadow-xl hover:scale-110"
                  >
                    <IconComponent size={32} />
                  </button>
                </div>

                <div className="space-y-4 flex-grow">
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) =>
                      setServices(
                        services.map((s) =>
                          String(s.id) === String(service.id)
                            ? { ...s, title: e.target.value }
                            : s
                        )
                      )
                    }
                    onBlur={() => {
                      void handleServicePatch(service, {
                        title: normalizeString(service.title, 100),
                      });
                    }}
                    className="w-full bg-transparent border-none p-0 text-2xl font-black text-white focus:outline-none focus:ring-0"
                  />

                  <textarea
                    value={service.description}
                    onChange={(e) =>
                      setServices(
                        services.map((s) =>
                          String(s.id) === String(service.id)
                            ? { ...s, description: e.target.value }
                            : s
                        )
                      )
                    }
                    onBlur={() => {
                      void handleServicePatch(service, { description: service.description.trim() });
                    }}
                    className="w-full bg-transparent border-none p-0 text-white/50 text-sm leading-relaxed resize-none focus:outline-none focus:ring-0"
                    rows={3}
                  />

                  <div className="pt-4 flex flex-wrap gap-2">
                    {[service.tag1, service.tag2, service.tag3].map((tag, idx) => {
                      const field = `tag${idx + 1}` as "tag1" | "tag2" | "tag3";

                      return (
                        <input
                          key={idx}
                          type="text"
                          value={tag}
                          onChange={(e) => {
                            const value = e.target.value;
                            setServices(
                              services.map((s) =>
                                String(s.id) === String(service.id)
                                  ? { ...s, [field]: value }
                                  : s
                              )
                            );
                          }}
                          onBlur={() => {
                            void handleServicePatch(service, {
                              [field]: normalizeString(service[field], 30),
                            });
                          }}
                          className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-accent-primary focus:outline-none focus:border-accent-primary transition-all text-center w-28"
                        />
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Expertise Section */}
      <div className="pt-12 border-t border-white/5">
        <div className="relative p-8 md:p-12 lg:p-20 rounded-[3rem] overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-50"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
              <div className="max-w-xl">
                <h3 className="text-3xl md:text-4xl font-black text-white mb-6 uppercase tracking-tighter">
                  Our{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#023E8A] via-[#49CADF] to-[#023E8A]">
                    Expertise
                  </span>
                </h3>
                <p className="text-white/70 text-lg font-light leading-relaxed">
                  Technical mastery combined with artistic vision to deliver unmatched results.
                </p>
              </div>

              <button
                disabled={isLoading}
                onClick={() =>
                  setExpertiseModal({
                    isOpen: true,
                    isEditing: false,
                    id: "",
                    title: "",
                    description: "",
                    icon_type: DEFAULT_SERVICE_ICON_TYPE,
                  })
                }
                className="h-14 px-8 rounded-2xl bg-accent-primary text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-[#007EA7] transition-all shadow-xl shadow-accent-primary/20 self-start md:self-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                Add Expertise
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {expertise.map((exp) => {
                const expMeta = getServiceIconUi(exp.icon_type);
                const IconComponent = serviceIconComponents[expMeta.iconKey];

                return (
                  <div key={exp.id} className="group relative">
                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 h-full relative overflow-hidden backdrop-blur-xl group-hover:bg-white/[0.05] transition-all duration-500">
                      <button
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            type: "expertise",
                            id: exp.id,
                            title: exp.title,
                          })
                        }
                        className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>

                      <button
                        onClick={() => openIconPicker(exp.id, exp.icon_type, "expertise")}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/10 bg-accent-primary/10 text-accent-primary group-hover:bg-accent-primary/20 transition-all duration-500 shadow-xl hover:scale-105"
                      >
                        <IconComponent size={28} />
                      </button>

                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) =>
                          setExpertise(
                            expertise.map((item) =>
                              String(item.id) === String(exp.id)
                                ? { ...item, title: e.target.value }
                                : item
                            )
                          )
                        }
                        onBlur={() => {
                          void handleExpertisePatch(exp, {
                            title: normalizeString(exp.title, 100),
                          });
                        }}
                        className="w-full bg-transparent border-none p-0 text-xl font-black text-white mb-3 focus:outline-none focus:ring-0"
                      />

                      <textarea
                        value={exp.description}
                        onChange={(e) =>
                          setExpertise(
                            expertise.map((item) =>
                              String(item.id) === String(exp.id)
                                ? { ...item, description: e.target.value }
                                : item
                            )
                          )
                        }
                        onBlur={() => {
                          void handleExpertisePatch(exp, {
                            description: exp.description.trim(),
                          });
                        }}
                        className="w-full bg-transparent border-none p-0 text-white/50 text-sm leading-relaxed resize-none focus:outline-none focus:ring-0"
                        rows={3}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Worked With Section */}
      <div className="relative p-8 md:p-12 lg:p-20 rounded-[3rem] overflow-hidden border border-white/10 bg-white/[0.02]">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-accent-primary/5 blur-[120px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div className="max-w-xl">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-6 uppercase tracking-tighter">
                We&apos;ve{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#023E8A] via-[#49CADF] to-[#023E8A]">
                  Worked With
                </span>
              </h3>
              <p className="text-white/70 text-lg font-light leading-relaxed">
                Our portfolio spans across diverse industries, helping visionaries and brands dominate their markets.
              </p>
            </div>

            <button
              disabled={isLoading}
              onClick={() =>
                setWorkedWithModal({
                  isOpen: true,
                  isEditing: false,
                  id: "",
                  title: "",
                  description: "",
                  industry_type: "BRAND",
                })
              }
              className="h-14 px-8 rounded-2xl bg-[#0094C8] text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-[#007EA7] transition-all shadow-xl shadow-[#0094C8]/20 self-start md:self-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              Add Industry
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workedWith.map((work) => {
              const workMeta = getIndustryTypeUi(work.industry_type);
              const IconComponent = industryIconComponents[workMeta.iconKey];

              return (
                <div
                  key={work.id}
                  className="glass-card p-10 rounded-[3rem] border border-white/10 relative group hover:bg-white/[0.04] transition-all duration-500"
                >
                  <button
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        type: "industry",
                        id: work.id,
                        title: work.title,
                      })
                    }
                    className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="text-accent-secondary mb-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent-secondary/10 flex items-center justify-center">
                      <IconComponent size={22} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 py-1.5 px-4 rounded-full border border-white/5 text-white/60">
                      {workMeta.label}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={work.title}
                    onChange={(e) =>
                      setWorkedWith(
                        workedWith.map((item) =>
                          String(item.id) === String(work.id)
                            ? { ...item, title: e.target.value }
                            : item
                        )
                      )
                    }
                    onBlur={() => {
                      void handleWorkedWithPatch(work, {
                        title: normalizeString(work.title, 100),
                      });
                    }}
                    className="w-full bg-transparent border-none p-0 text-2xl font-black text-white mb-4 focus:outline-none focus:ring-0"
                  />

                  <textarea
                    value={work.description}
                    onChange={(e) =>
                      setWorkedWith(
                        workedWith.map((item) =>
                          String(item.id) === String(work.id)
                            ? { ...item, description: e.target.value }
                            : item
                        )
                      )
                    }
                    onBlur={() => {
                      void handleWorkedWithPatch(work, {
                        description: work.description.trim(),
                      });
                    }}
                    className="w-full bg-transparent border-none p-0 text-white/50 text-sm leading-relaxed resize-none focus:outline-none focus:ring-0"
                    rows={3}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {iconPickerModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                  Choose <span className="text-accent-primary">Icon</span>
                </h3>
                <button
                  onClick={closeIconPicker}
                  className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {SERVICE_ICON_OPTIONS.map((opt) => {
                  const meta = getServiceIconUi(opt.value);
                  const IconComponent = serviceIconComponents[meta.iconKey];

                  return (
                    <button
                      key={opt.value}
                      onClick={() => void handleIconChange(iconPickerModal.itemId, opt.value)}
                      className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${
                        iconPickerModal.currentIcon === opt.value
                          ? "bg-accent-primary/20 border-accent-primary text-accent-primary"
                          : "bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white"
                      } border-2`}
                    >
                      <IconComponent size={28} />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {expertiseModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0A1118] border border-white/10 rounded-[3rem] p-10 w-full max-w-xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-accent-primary"></div>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                    New <span className="text-accent-primary">Expertise</span>
                  </h3>
                  <p className="text-white/40 text-sm mt-1">Add a technical mastery field to your profile.</p>
                </div>
                <button
                  onClick={() => setExpertiseModal({ ...expertiseModal, isOpen: false })}
                  className="w-12 h-12 rounded-2xl hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary ml-1">
                    Expertise Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Audio Engineering"
                    value={expertiseModal.title}
                    onChange={(e) => setExpertiseModal({ ...expertiseModal, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-primary transition-all text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary ml-1">
                    Icon Type
                  </label>
                  <select
                    value={expertiseModal.icon_type}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (isServiceIconType(value)) {
                        setExpertiseModal({ ...expertiseModal, icon_type: value });
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-primary transition-all appearance-none"
                  >
                    {SERVICE_ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#0A1118]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary ml-1">
                    Detailed Description
                  </label>
                  <textarea
                    placeholder="Explain what this expertise involves..."
                    value={expertiseModal.description}
                    onChange={(e) =>
                      setExpertiseModal({ ...expertiseModal, description: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-primary transition-all min-h-[120px] resize-none"
                  />
                </div>

                <button
                  disabled={isLoading}
                  onClick={handleAddExpertise}
                  className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-[0.3em] text-sm hover:bg-accent-primary hover:text-white transition-all shadow-xl shadow-accent-primary/10 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Create Expertise
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {workedWithModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0A1118] border border-white/10 rounded-[3rem] p-10 w-full max-w-xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0094C8]"></div>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                    New <span className="text-[#0094C8]">Industry</span>
                  </h3>
                  <p className="text-white/40 text-sm mt-1">Add a success vertical to your showcase.</p>
                </div>
                <button
                  onClick={() => setWorkedWithModal({ ...workedWithModal, isOpen: false })}
                  className="w-12 h-12 rounded-2xl hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0094C8] ml-1">
                    Industry Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Luxury Real Estate"
                    value={workedWithModal.title}
                    onChange={(e) => setWorkedWithModal({ ...workedWithModal, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-primary transition-all text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0094C8] ml-1">
                    Category
                  </label>
                  <select
                    value={workedWithModal.industry_type}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (isIndustryType(value)) {
                        setWorkedWithModal({ ...workedWithModal, industry_type: value });
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-primary transition-all appearance-none"
                  >
                    {INDUSTRY_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#0A1118]">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0094C8] ml-1">
                    Success Summary
                  </label>
                  <textarea
                    placeholder="Describe our success in this market..."
                    value={workedWithModal.description}
                    onChange={(e) =>
                      setWorkedWithModal({ ...workedWithModal, description: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-primary transition-all min-h-[120px] resize-none"
                  />
                </div>

                <button
                  disabled={isLoading}
                  onClick={handleAddIndustry}
                  className="w-full py-5 rounded-2xl bg-[#0094C8] text-white font-black uppercase tracking-[0.2em] text-sm hover:brightness-110 transition-all shadow-xl shadow-[#0094C8]/10 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Confirm Industry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
