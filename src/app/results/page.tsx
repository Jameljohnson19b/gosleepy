"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HotelCard } from "@/components/HotelCard";
import { Offer } from "@/types/hotel";
import { Moon, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Suspense } from "react";

function ResultsContent() {
    const searchParams = useSearchParams();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    useEffect(() => {
        async function fetchOffers() {
            try {
                const res = await fetch("/api/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        lat: parseFloat(lat || "0"),
                        lng: parseFloat(lng || "0"),
                        checkIn: new Date().toISOString().split('T')[0],
                        checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                        guests: 2,
                        radiusMiles: 10
                    })
                });
                const data = await res.json();
                setOffers(data.offers || []);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        }

        if (lat && lng) {
            fetchOffers();
        }
    }, [lat, lng]);

    return (
        <main className="min-h-screen bg-black text-white p-4">
            <header className="flex items-center justify-between mb-8 sticky top-0 bg-black/80 backdrop-blur-md z-20 py-2">
                <Link href="/" className="p-2 -ml-2">
                    <ArrowLeft className="w-8 h-8" />
                </Link>
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="" className="w-8 h-8 object-contain filter invert-[.5] sepia-[1] saturate-[5000%] hue-rotate-[290deg]" />
                    <div className="flex flex-col items-center">
                        <span className="text-[#ff10f0] font-black tracking-tighter text-xl">GO SLEEPY</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Tonight Nearby</span>
                    </div>
                </div>
                <div className="p-2 opacity-0">
                    <ArrowLeft className="w-8 h-8" />
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Zap className="w-12 h-12 text-[#ff10f0] animate-spin" />
                    <p className="text-gray-400 animate-pulse font-medium">Scanning for safe zones...</p>
                </div>
            ) : (
                <div className="grid gap-6 pb-20">
                    {offers.length > 0 ? (
                        offers.map((offer) => (
                            <HotelCard key={offer.hotelId} offer={offer} />
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-400">No rooms found in this area tonight.</p>
                        </div>
                    )}
                </div>
            )}

            {/* 1AM Mode Status Bar */}
            {!loading && (
                <div className="fixed bottom-0 left-0 w-full bg-[#ff10f0] text-white py-2 text-center font-bold text-xs uppercase tracking-widest px-4 truncate">
                    Prices updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Pay at Property only
                </div>
            )}
        </main>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Zap className="w-12 h-12 text-[#ff10f0] animate-spin" />
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}
