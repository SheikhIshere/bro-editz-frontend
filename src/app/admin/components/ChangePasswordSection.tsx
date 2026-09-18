"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Eye, EyeOff, Lock, Save, Shield, X } from "lucide-react";

interface ChangePasswordSectionProps {
    showNotification: (type: "success" | "error", message: string) => void;
}

interface ChangePasswordResponse {
    changed: boolean;
    message?: string;
}

interface PasswordStrength {
    score: number;
    message: string;
    color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
    if (password.length === 0) {
        return { score: 0, message: "", color: "" };
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 1) {
        return { score, message: "Weak password", color: "text-red-400" };
    }

    if (score <= 3) {
        return { score, message: "Medium strength", color: "text-yellow-400" };
    }

    return { score, message: "Strong password", color: "text-green-400" };
}

export default function ChangePasswordSection({
    showNotification,
}: ChangePasswordSectionProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const passwordStrength = useMemo(
        () => getPasswordStrength(newPassword),
        [newPassword]
    );

    const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

    const resetForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const validatePasswords = (): boolean => {
        if (!currentPassword.trim()) {
            showNotification("error", "Please enter your current password.");
            return false;
        }

        if (!newPassword.trim()) {
            showNotification("error", "Please enter your new password.");
            return false;
        }

        if (newPassword.length < 8) {
            showNotification("error", "Password must be at least 8 characters long.");
            return false;
        }

        if (currentPassword === newPassword) {
            showNotification("error", "New password cannot be the same as current password.");
            return false;
        }

        if (!confirmPassword.trim()) {
            showNotification("error", "Please confirm your new password.");
            return false;
        }

        if (newPassword !== confirmPassword) {
            showNotification("error", "New passwords do not match.");
            return false;
        }

        return true;
    };

    const submitPasswordChange = async () => {
        if (isSubmitting || !validatePasswords()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/admin/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            });

            const payload = (await response
                .json()
                .catch(() => null)) as ChangePasswordResponse | null;

            if (!response.ok || !payload?.changed) {
                showNotification(
                    "error",
                    payload?.message ?? "Unable to change password."
                );
                return;
            }

            showNotification(
                "success",
                payload.message ?? "Password changed successfully."
            );
            resetForm();
        } catch {
            showNotification("error", "Unable to reach authentication service.");
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
                    <Lock size={24} className="text-accent-primary" />
                </div>
                <div className="text-center sm:text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-white">Change Password</h2>
                    <p className="text-white/60 text-xs md:text-sm mt-1">
                        Keep your admin account secure with a strong password.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                        Current Password
                    </label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            disabled={isSubmitting}
                            autoComplete="current-password"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pr-14 text-white focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-70"
                            placeholder="Enter your current password"
                        />
                        <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => setShowCurrentPassword((prev) => !prev)}
                            disabled={isSubmitting}
                            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-white/60 hover:text-white transition-colors disabled:opacity-50"
                            aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                            aria-pressed={showCurrentPassword}
                        >
                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={isSubmitting}
                            autoComplete="new-password"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pr-14 text-white focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-70"
                            placeholder="Enter your new password"
                        />
                        <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => setShowNewPassword((prev) => !prev)}
                            disabled={isSubmitting}
                            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-white/60 hover:text-white transition-colors disabled:opacity-50"
                            aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                            aria-pressed={showNewPassword}
                        >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {newPassword && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-white/60">Password Strength</span>
                                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                                    {passwordStrength.message}
                                </span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${passwordStrength.score <= 1
                                        ? "bg-red-500"
                                        : passwordStrength.score <= 3
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                        }`}
                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isSubmitting}
                            autoComplete="new-password"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pr-14 text-white focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-70"
                            placeholder="Confirm your new password"
                        />
                        <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            disabled={isSubmitting}
                            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-white/60 hover:text-white transition-colors disabled:opacity-50"
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            aria-pressed={showConfirmPassword}
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {confirmPassword && (
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
                            <h4 className="text-sm font-medium text-white mb-2">Security Tips</h4>
                            <ul className="text-xs text-white/60 space-y-1">
                                <li>Use at least 8 characters.</li>
                                <li>Include uppercase and lowercase letters.</li>
                                <li>Add numbers and special characters.</li>
                                <li>Avoid common or reused passwords.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">
                <button
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors font-bold disabled:opacity-60"
                >
                    Cancel
                </button>
                <button
                    onClick={submitPasswordChange}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-accent-primary text-white rounded-xl hover:bg-accent-primary/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    style={{ backgroundColor: "#0094C8" }}
                >
                    <Save size={18} />
                    {isSubmitting ? "Changing..." : "Change Password"}
                </button>
            </div>
        </motion.div>
    );
}
