"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { authenticateAdminAction } from "@/lib/admin-auth/server";

interface AuthResponse {
    authenticated: boolean;
    message?: string;
}

function AdminLoginFormContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { status, refreshSession } = useAdminAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const nextPath = useMemo(() => {
        const next = searchParams.get("next");
        if (
            next &&
            next.startsWith("/admin") &&
            !next.startsWith("/admin/login")
        ) {
            return next;
        }
        return "/admin";
    }, [searchParams]);

    useEffect(() => {
        if (status === "authenticated") {
            router.replace(nextPath);
        }
    }, [nextPath, router, status]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        localStorage.removeItem("admin_user_email");

        try {
            const result = await authenticateAdminAction(email, password);

            if (!result.success) {
                setError(result.message);
                return;
            }

            if (result.success && result.email) {
                localStorage.setItem("admin_user_email", result.email);
            }
            await refreshSession();
        } catch (err) {
            console.error("Login attempt failed:", err);
            setError("Unable to reach authentication service.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isCheckingSession = status === "loading";

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
                        ADMIN <span className="text-accent-primary">LOGIN</span>
                    </h1>
                    <p className="text-text-muted text-sm uppercase tracking-[0.2em] font-bold">
                        Video Agency Portal
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="email"
                            placeholder="Admin Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting || isCheckingSession}
                            className="w-full bg-background border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-accent-primary transition-colors"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting || isCheckingSession}
                            className="w-full bg-background border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-accent-primary transition-colors"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            disabled={isSubmitting || isCheckingSession}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors disabled:opacity-50"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || isCheckingSession}
                        className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 group text-sm font-bold mt-4"
                    >
                        {isCheckingSession
                            ? "Checking Session..."
                            : isSubmitting
                                ? "Signing In..."
                                : "Enter Portal"}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="text-center mt-8 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                    Secure Access Only
                </p>
            </motion.div>
        </div>
    );
}

export default function AdminLogin() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-white text-xl font-bold animate-pulse">Loading Admin Portal...</div>
            </div>
        }>
            <AdminLoginFormContent />
        </Suspense>
    );
}

