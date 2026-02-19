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
    const [radius, setRadius] = useState(parseInt(searchParams.get("radius") || "10"));

    const bookingTime = searchParams.get("bookingTime") || "now";
    const duration = parseInt(searchParams.get("duration") || "1");

    useEffect(() => {
        async function fetchOffers() {
            setLoading(true);
            try {
                // Tactical Date Calculation
                const now = new Date();
                const checkInDate = new Date();
                if (bookingTime === "nextDay") {
                    checkInDate.setDate(now.getDate() + 1);
                }

                const checkOutDate = new Date(checkInDate);
                checkOutDate.setDate(checkInDate.getDate() + duration);

                const checkInString = checkInDate.toISOString().split('T')[0];
                const checkOutString = checkOutDate.toISOString().split('T')[0];

                const res = await fetch("/api/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        lat: parseFloat(lat || "0"),
                        lng: parseFloat(lng || "0"),
                        checkIn: checkInString,
                        checkOut: checkOutString,
                        guests: 2,
                        radiusMiles: radius
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
    }, [lat, lng, radius, bookingTime, duration]);

    return (
        <main className="min-h-screen bg-black text-white p-4">
            <header className="flex flex-col gap-6 mb-8 sticky top-0 bg-black/80 backdrop-blur-md z-20 py-4 border-b border-white/5">
                <div className="flex items-center relative h-10">
                    <Link href="/" className="absolute left-0 p-2">
                        <ArrowLeft className="w-8 h-8 text-gray-400 hover:text-[#ff10f0] transition-colors" />
                    </Link>

                    <div className="flex items-center gap-3 mx-auto">
                        <img src="/logo.png" alt="" className="w-8 h-8 object-contain filter invert-[.5] sepia-[1] saturate-[5000%] hue-rotate-[290deg]" />
                        <div className="text-center">
                            <h1 className="text-[#ff10f0] font-black tracking-tighter text-2xl leading-none">GO SLEEPY</h1>
                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold">NEARBY</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-[#ff10f0] rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Nearby search active</span>
                        </div>
                        <div className="text-[9px] font-bold text-[#ff10f0] uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="font-black">LOWEST PRICE TODAY</span> · {bookingTime === 'now' ? 'Tonight' : 'Tomorrow'} · {duration} {duration === 1 ? 'Night' : 'Nights'}
                        </div>
                    </div>
                    <div className="flex bg-[#111] p-1 rounded-xl border border-white/5 gap-1">
                        {[10, 25, 50].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRadius(r)}
                                className={`py-1.5 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${radius === r ? "bg-[#ff10f0] text-white shadow-[0_0_15px_rgba(255,16,240,0.4)]" : "text-gray-500 hover:text-white"}`}
                            >
                                {r}mi
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Zap className="w-12 h-12 text-[#ff10f0] animate-spin" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">Finding the cheapest hotels nearby...</p>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 pb-20">
                    {offers.length > 0 ? (
                        offers.map((offer) => (
                            <HotelCard key={offer.hotelId} offer={offer} duration={duration} />
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
                    Prices updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Pay at the hotel
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
