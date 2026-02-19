"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Zap, X, Mail, CheckCircle2 } from "lucide-react";

export default function SoftAuthSheet({
    open,
    onClose,
    nextUrl,
}: {
    open: boolean;
    onClose: () => void;
    nextUrl: string;
}) {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function sendLink() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            setErr("Auth system unavailable. Please contact support.");
            return;
        }

        const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
        setErr(null);
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
                },
            });
            if (error) throw error;
            setSent(true);
        } catch (e: any) {
            setErr(e?.message ?? "Could not send link");
        } finally {
            setLoading(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="fixed inset-0"
                onClick={onClose}
            />

            <div className="w-full max-w-xl bg-[#0b0b0f] rounded-t-[40px] border-t border-white/10 p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative animate-in slide-in-from-bottom duration-500 ease-out">
                {/* Tactical Handle */}
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#ff10f0]/10 rounded-2xl flex items-center justify-center border border-[#ff10f0]/30 shadow-[0_0_20px_rgba(255,16,240,0.2)]">
                            <Zap className="w-5 h-5 text-[#ff10f0] fill-[#ff10f0]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">Save your trip</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Connect your email to save progress</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {!sent ? (
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <p className="text-sm text-gray-400 leading-relaxed italic mb-6">
                                Enter your email and we'll send you a link to save your route and upcoming bookings. No passwords needed.
                            </p>

                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    className="w-full bg-black border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-[#ff10f0] transition-colors text-sm"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    inputMode="email"
                                    autoFocus
                                />
                            </div>

                            {err && (
                                <div className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest">
                                    {err}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={sendLink}
                            disabled={loading || !email.includes("@")}
                            className="w-full bg-white text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>Send Login Link</>
                            )}
                        </button>

                        <p className="text-center text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                            You can keep browsing while we send the link.
                        </p>
                    </div>
                ) : (
                    <div className="py-8 text-center space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-emerald-400/10 border border-emerald-400/30 rounded-[40px] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(52,211,153,0.2)]">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-2xl font-black uppercase tracking-tighter italic">Check your email</h4>
                            <p className="text-sm text-gray-500 max-w-[280px] mx-auto italic">
                                We've sent a secure login link to <span className="text-white font-mono not-italic">{email}</span>.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-white/10 transition-all"
                        >
                            Continue Browsing
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
