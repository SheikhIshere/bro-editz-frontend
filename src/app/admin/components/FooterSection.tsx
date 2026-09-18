"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Edit3, X, ExternalLink, Mail, Phone, MapPin, FileText, Globe, Loader2 } from "lucide-react";
import { FooterData } from "@/types/footer";
import { listFooterAdmin, updateFooterAdmin } from "@/lib/admin-auth/server";

interface FooterSectionProps {
  showNotification: (type: 'success' | 'error', message: string) => void;
}

export default function FooterSection({ showNotification }: FooterSectionProps) {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<FooterData | null>(null);

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const result = await listFooterAdmin();
      if (result.ok) {
        setFooterData(result.data);
        setFormData(result.data);
      } else {
        showNotification('error', result.message || 'Failed to fetch footer data');
      }
    } catch (err) {
      console.error("Failed to fetch footer data:", err);
      showNotification('error', 'Failed to fetch footer data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData || !footerData) return;

    setSaving(true);
    try {
      const result = await updateFooterAdmin(footerData.id || 1, formData);
      if (result.ok) {
        setFooterData(result.data || formData);
        setEditing(false);
        showNotification('success', 'Footer updated successfully!');
      } else {
        showNotification('error', result.message || 'Failed to update footer');
      }
    } catch (err) {
      console.error("Failed to update footer:", err);
      showNotification('error', 'Failed to update footer');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(footerData);
    setEditing(false);
  };

  const handleInputChange = (field: keyof FooterData, value: string) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-accent-primary" size={32} />
      </div>
    );
  }

  if (!footerData || !formData) {
    return (
      <div className="text-center py-20">
        <p className="text-white/60">Failed to load footer data</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
            <Globe size={20} className="text-accent-primary" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white">Footer Management</h3>
            <p className="text-white/60 text-xs md:text-sm mt-1">Manage footer content and links</p>
          </div>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-xl hover:bg-accent-primary/80 transition-colors"
        >
          {editing ? <X size={16} /> : <Edit3 size={16} />}
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Content */}
      <div className="glass-card p-6 md:p-8 rounded-[2rem] border border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Social Media Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <ExternalLink size={18} className="text-accent-primary" />
              Social Media Links
            </h4>

            {[
              { field: 'youtube' as const, label: 'YouTube', placeholder: 'https://youtube.com/yourchannel' },
              { field: 'facebook' as const, label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
              { field: 'twitter' as const, label: 'Twitter', placeholder: 'https://twitter.com/yourhandle' },
              { field: 'instagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/yourprofile' },
              { field: 'linkedin' as const, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourprofile' },
            ].map(({ field, label, placeholder }) => (
              <div key={field} className="space-y-2">
                <label className="text-sm font-medium text-white/60">{label}</label>
                {editing ? (
                  <input
                    type="url"
                    value={formData[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent-primary transition-colors"
                  />
                ) : (
                  <div className="p-3 bg-white/5 rounded-xl">
                    {footerData[field] ? (
                      <a
                        href={footerData[field]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-primary hover:text-accent-secondary transition-colors"
                      >
                        {footerData[field]}
                      </a>
                    ) : (
                      <span className="text-white/40">Not set</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail size={18} className="text-accent-primary" />
              Contact Information
            </h4>

            {[
              { field: 'email' as const, label: 'Email', type: 'email', icon: Mail },
              { field: 'phone' as const, label: 'Phone', type: 'tel', icon: Phone },
              { field: 'location' as const, label: 'Location', type: 'text', icon: MapPin },
            ].map(({ field, label, type, icon: Icon }) => (
              <div key={field} className="space-y-2">
                <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Icon size={16} className="text-accent-primary" />
                  {label}
                </label>
                {editing ? (
                  <input
                    type={type}
                    value={formData[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent-primary transition-colors"
                  />
                ) : (
                  <div className="p-3 bg-white/5 rounded-xl text-white">
                    {footerData[field]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Policy Documents */}
        <div className="mt-8 space-y-6">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText size={18} className="text-accent-primary" />
            Policy Documents
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { field: 'privacy_policy' as const, label: 'Privacy Policy' },
              { field: 'terms_of_service' as const, label: 'Terms of Service' },
              { field: 'cookie_policy' as const, label: 'Cookie Policy' },
              { field: 'brand_guidelines' as const, label: 'Brand Guidelines' },
            ].map(({ field, label }) => (
              <div key={field} className="space-y-2">
                <label className="text-sm font-medium text-white/60">{label}</label>
                {editing ? (
                  <textarea
                    value={formData[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent-primary transition-colors resize-none"
                    placeholder={`Enter ${label.toLowerCase()} content...`}
                  />
                ) : (
                  <div className="p-3 bg-white/5 rounded-xl text-white/80 min-h-[100px] max-h-[200px] overflow-y-auto">
                    {footerData[field] || <span className="text-white/40">Not set</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-end gap-4 pt-6 border-t border-white/10"
            >
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-accent-primary text-white rounded-xl hover:bg-accent-primary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
