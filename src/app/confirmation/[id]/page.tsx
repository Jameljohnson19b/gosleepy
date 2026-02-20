"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Phone, Navigation, Share2, ArrowLeft, Info, Zap } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function ConfirmationContent() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);

    const hotelName = searchParams.get("name") || "The Roadside Inn";
    const amount = searchParams.get("amount") || "89.00";
    const address = searchParams.get("address") || "123 Highway Ave, Richmond, VA";
    const phone = searchParams.get("phone") || "5550123";
    const lat = searchParams.get("lat") || "0";
    const lng = searchParams.get("lng") || "0";

    const navLink = lat && lng && lat !== "0"
        ? `https://maps.apple.com/?q=${encodeURIComponent(address)}`
        : "https://maps.apple.com";

    const callLink = phone ? `tel:${phone}` : "#";

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 1000);
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-emerald-400/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white animate-pulse">Confirming with Hotel...</h1>
        </div>
    );

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="bg-emerald-400 pt-20 pb-12 px-6 rounded-b-[40px] text-black text-center relative overflow-hidden">
                {/* Abstract background pattern for "Roadside Safety" feel */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <CheckCircle2 className="w-64 h-64 -translate-x-1/2 -translate-y-1/2 absolute" />
                </div>

                <div className="relative z-10">
                    <div className="flex justify-center mb-4 text-black">
                        <CheckCircle2 className="w-16 h-16 fill-black/10" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-2">Room Secured</h1>
                    <p className="font-bold text-black/60 uppercase tracking-widest text-sm">Confirmation #{id?.toString().slice(0, 8).toUpperCase() || 'CONF-789'}</p>
                </div>
            </div>

            <div className="p-6 -mt-8 relative z-20">
                <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 shadow-2xl mb-8">
                    <h2 className="text-xl font-black uppercase tracking-tighter mb-1">{hotelName}</h2>
                    <p className="text-sm text-gray-500 font-medium mb-6">{address}</p>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-900 pt-6">
                        <div>
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Check-In</div>
                            <div className="text-lg font-bold">Tonight</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Guests</div>
                            <div className="text-lg font-bold">2 Adult</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <a href={callLink} className="btn-large bg-white text-black h-20 text-lg gap-3">
                        <Phone className="w-6 h-6" />
                        CALL HOTEL
                    </a>
                    <a href={navLink} className="btn-large bg-yellow-400 text-black h-20 text-lg gap-3">
                        <Navigation className="w-6 h-6" />
                        NAVIGATE
                    </a>
                </div>

                <div className="space-y-4">
                    <div className="p-5 bg-blue-400/10 border border-blue-400/20 rounded-2xl flex gap-4">
                        <Info className="w-6 h-6 text-blue-400 shrink-0" />
                        <div>
                            <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-1">Pay at Front Desk</h3>
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                Show your ID at check-in. The total due is <span className="text-white">${parseFloat(amount).toFixed(2)}</span>. Your room is held until 6 AM tomorrow.
                            </p>
                        </div>
                    </div>

                    <button className="w-full p-5 bg-[#111] border border-gray-800 rounded-2xl flex items-center justify-center gap-3 font-bold text-gray-400 hover:text-white transition-all">
                        <Share2 className="w-5 h-5" />
                        Share with Travel Partner
                    </button>
                </div>

                <div className="mt-8 flex flex-col items-center gap-6 pb-20">
                    <Link
                        href={`/support?bookingId=${id}`}
                        className="text-xs font-black text-[#ff10f0] uppercase tracking-[0.2em] flex items-center gap-2 group"
                    >
                        <Info className="w-4 h-4 transition-transform group-hover:scale-110" />
                        Something wrong? Get Help
                    </Link>

                    <Link href="/" className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] border-b border-gray-900 pb-1">
                        Back to Search
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function ConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Zap className="w-12 h-12 text-[#ff10f0] animate-spin" />
            </div>
        }>
            <ConfirmationContent />
        </Suspense>
    );
}
