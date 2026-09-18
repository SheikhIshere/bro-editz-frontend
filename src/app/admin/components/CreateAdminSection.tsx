"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, Eye, EyeOff, Save, Shield, Check, X } from "lucide-react";

interface CreateAdminSectionProps {
    showNotification: (type: "success" | "error", message: string) => void;
}

export default function CreateAdminSection({
    showNotification,
}: CreateAdminSectionProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const passwordsMatch = password2.length > 0 && password === password2;

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setPassword2("");
    };

    const validateForm = (): boolean => {
        if (!email.trim()) {
            showNotification("error", "Please enter an email address.");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification("error", "Please enter a valid email address.");
            return false;
        }

        if (!password.trim()) {
            showNotification("error", "Please enter a password.");
            return false;
        }

        if (password.length < 8) {
            showNotification("error", "Password must be at least 8 characters long.");
            return false;
        }

        if (!password2.trim()) {
            showNotification("error", "Please confirm the password.");
            return false;
        }

        if (password !== password2) {
            showNotification("error", "Passwords do not match.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting || !validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/admin/create-admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    password2,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showNotification("success", data.message || "Admin user created successfully!");
                resetForm();
            } else {
                const errorMessage = data.error || data.detail || (typeof data === 'object' ? Object.values(data)[0] : "Failed to create admin user.");
                showNotification("error", typeof errorMessage === 'string' ? errorMessage : "An error occurred.");
            }
        } catch (error) {
            showNotification("error", "An error occurred while connecting to the server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 md:p-8 rounded-[2rem] border border-white/10"
        >
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center shrink-0">
                    <UserPlus size={24} className="text-accent-primary" />
                </div>
                <div className="text-center sm:text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-white">Create Admin User</h2>
                    <p className="text-white/60 text-xs md:text-sm mt-1">
                        Add a new administrator to the system.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-70"
                            placeholder="admin@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                            <Lock size={18} />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 pr-14 text-white focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-70"
                            placeholder="Enter password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                            <Lock size={18} />
                        </div>
                        <input
                            type={showPassword2 ? "text" : "password"}
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 pr-14 text-white focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-70"
                            placeholder="Confirm password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword2(!showPassword2)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                            {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {password2 && (
                        <div className="mt-2 flex items-center gap-2">
                            {passwordsMatch ? (
                                <>
                                    <Check size={16} className="text-green-400" />
                                    <span className="text-xs text-green-400">Passwords match</span>
                                </>
                            ) : (
                                <>
                                    <X size={16} className="text-red-400" />
                                    <span className="text-xs text-red-400">Passwords do not match</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Shield size={20} className="text-accent-primary mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-white mb-2">Permissions Notice</h4>
                            <p className="text-xs text-white/60">
                                This user will be granted administrator access, allowing them to manage all website content, including services, portfolio, and settings.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={resetForm}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors font-bold disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-6 py-3 bg-accent-primary text-white rounded-xl hover:bg-accent-primary/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                        style={{ backgroundColor: "#0094C8" }}
                    >
                        <Save size={18} />
                        {isSubmitting ? "Creating..." : "Create Admin"}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
