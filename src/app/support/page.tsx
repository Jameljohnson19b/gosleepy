"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LifeBuoy, Send, CheckCircle, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";

import { Suspense } from "react";

function SupportContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingId = searchParams.get("bookingId");

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        category: "OTHER",
        subject: "",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/support/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, bookingId })
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                alert("Failed to submit ticket. Please try again.");
            }
        } catch (error) {
            console.error("Support submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <CheckCircle className="w-20 h-20 text-emerald-400 mb-6" />
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 text-[#ff10f0]">Ticket Received</h1>
                <p className="text-gray-400 max-max-w-sm mb-8 font-medium">
                    Our 1AM support squad has been notified. We'll get back to you at <span className="text-white italic">{formData.email}</span> as soon as possible.
                </p>
                <Link
                    href="/"
                    className="bg-[#ff10f0] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm"
                >
                    Back to Home
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white p-6 max-w-2xl mx-auto">
            <header className="flex items-center gap-4 mb-12">
                <button onClick={() => router.back()} className="p-2 border border-gray-800 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <LifeBuoy className="w-6 h-6 text-[#ff10f0]" />
                        24/7 Roadside Support
                    </h1>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Average response time: 15 minutes
                    </p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Email for response</label>
                    <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full bg-[#111] border border-gray-800 rounded-2xl p-4 text-white focus:border-[#ff10f0] outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">How can we help?</label>
                    <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-[#111] border border-gray-800 rounded-2xl p-4 text-white focus:border-[#ff10f0] outline-none transition-all appearance-none"
                    >
                        <option value="OTHER">General Inquiry</option>
                        <option value="RES_NOT_FOUND">Hotel can't find my reservation</option>
                        <option value="LATE_CHECKIN">Problem with late check-in</option>
                        <option value="PRICE_CHANGED">The price at hotel is different</option>
                        <option value="CANCEL_HELP">I need to cancel or modify</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Subject</label>
                    <input
                        required
                        type="text"
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Short summary of issue"
                        className="w-full bg-[#111] border border-gray-800 rounded-2xl p-4 text-white focus:border-[#ff10f0] outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Description</label>
                    <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us what's happening..."
                        className="w-full bg-[#111] border border-gray-800 rounded-2xl p-4 text-white focus:border-[#ff10f0] outline-none transition-all resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#ff10f0] text-white py-6 rounded-2xl font-black text-xl active:scale-[0.95] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-8 shadow-[0_0_30px_rgba(255,16,240,0.2)]"
                >
                    {loading ? (
                        <Send className="animate-spin w-6 h-6" />
                    ) : (
                        <>
                            <Send className="w-6 h-6" />
                            SUBMIT TICKET
                        </>
                    )}
                </button>

                <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-6">
                    Real humans. Real fast. No robots (except the ones delivering your confirmation).
                </p>
            </form>
        </main>
    );
}

export default function SupportPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Zap className="w-12 h-12 text-[#ff10f0] animate-spin" />
            </div>
        }>
            <SupportContent />
        </Suspense>
    );
}
