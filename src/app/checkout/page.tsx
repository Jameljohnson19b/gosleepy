"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck, Zap, Lock } from "lucide-react";
import Link from "next/link";

import { Suspense } from "react";

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
    });

    const hotelId = searchParams.get("hotelId");
    const rateId = searchParams.get("rateId");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guestFirstName: formData.firstName,
                    guestLastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    hotelName: "The Roadside Inn",
                    supplierId: "hotelbeds",
                    rateId: rateId,
                    ratePayload: { token: "mock-token-1" },
                    checkIn: new Date().toISOString().split('T')[0],
                    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    guests: 2,
                    totalAmount: 89.00,
                    currency: "USD"
                })
            });

            const data = await res.json();
            if (res.ok) {
                router.push(`/confirmation/${data.id}`);
            } else {
                alert("Booking failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Booking error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white p-6">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 border border-gray-800 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-black uppercase tracking-tighter">Secure Reservation</h1>
            </header>

            <div className="mb-8 p-5 bg-[#111] border border-emerald-400/20 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-400/10 rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <div className="text-sm font-black text-emerald-400 uppercase tracking-widest">Pay at Property</div>
                    <div className="text-xs text-gray-500 font-medium">No card required to secure room</div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">First Name</label>
                        <input
                            required
                            type="text"
                            value={formData.firstName}
                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder="Jamel"
                            className="w-full bg-[#111] border border-gray-800 rounded-2xl p-4 text-white placeholder:text-gray-700 focus:border-yellow-400 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Last Name</label>
                        <input
                            required
                            type="text"
                            value={formData.lastName}
                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder="Johnson"
                            className="w-full bg-[#111] border border-gray-800 rounded-2xl p-4 text-white placeholder:text-gray-700 focus:border-yellow-400 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Email Address</label>
                    <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="stay@gosleepy.xyz"
                        className="w-full bg-[#111] border border-gray-800 rounded-2xl p-4 text-white placeholder:text-gray-700 focus:border-yellow-400 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Phone Number</label>
                    <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 000-0000"
                        className="w-full bg-[#111] border border-gray-800 rounded-2xl p-4 text-white placeholder:text-gray-700 focus:border-yellow-400 outline-none transition-all"
                    />
                </div>

                <div className="pt-4">
                    <div className="mb-4 flex items-center justify-between px-2">
                        <span className="text-sm font-bold text-gray-500">Total Due Today</span>
                        <span className="text-xl font-black text-emerald-400">$0.00</span>
                    </div>
                    <div className="mb-8 flex items-center justify-between px-2">
                        <span className="text-sm font-bold text-gray-500">Pay at Property</span>
                        <span className="text-xl font-black">$89.00</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-20 bg-yellow-400 text-black rounded-2xl font-black text-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <Zap className="animate-spin w-8 h-8" />
                        ) : (
                            <>
                                <Lock className="w-6 h-6" />
                                SECURE MY ROOM
                            </>
                        )}
                    </button>

                    <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-6 leading-relaxed">
                        By clicking secure room, you agree to pay <br /> The Roadside Inn $89.00 upon arrival.
                    </p>
                </div>
            </form>
        </main>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Zap className="w-12 h-12 text-yellow-400 animate-spin" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
