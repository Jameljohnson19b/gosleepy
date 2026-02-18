"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HotelCard } from "@/components/HotelCard";
import { Offer } from "@/types/hotel";
import { Zap, ArrowLeft, MapPin, Flag } from "lucide-react";
import Link from "next/link";

interface RouteResults {
    stops: (Offer & { waypointLabel: string })[];
}

function RouteContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [data, setData] = useState<RouteResults | null>(null);
    const [loading, setLoading] = useState(true);

    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");

    useEffect(() => {
        async function fetchRoute() {
            try {
                const res = await fetch("/api/route-hotels", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ origin, destination })
                });
                const d = await res.json();
                setData(d);
            } catch (error) {
                console.error("Route fetch failed:", error);
            } finally {
                setLoading(false);
            }
        }

        if (origin && destination) {
            fetchRoute();
        }
    }, [origin, destination]);

    return (
        <main className="min-h-screen bg-black text-white p-4">
            <header className="flex items-center justify-between mb-8 sticky top-0 bg-black/80 backdrop-blur-md z-20 py-4">
                <button onClick={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeft className="w-8 h-8" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[#ff10f0] font-black tracking-tighter text-xl uppercase italic">The Route</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">{origin} → {destination}</span>
                </div>
                <div className="w-8 h-8 opacity-0" />
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Zap className="w-12 h-12 text-[#ff10f0] animate-spin" />
                    <p className="text-gray-400 animate-pulse font-medium">Calculating optimal pit stops...</p>
                </div>
            ) : (
                <div className="relative max-w-xl mx-auto pb-20">
                    {/* The Route Line */}
                    <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-gradient-to-b from-[#ff10f0] via-gray-800 to-[#ff10f0] opacity-20" />

                    <div className="space-y-12">
                        {/* Start */}
                        <div className="relative pl-14">
                            <div className="absolute left-0 top-0 w-12 h-12 bg-[#111] rounded-full flex items-center justify-center border border-gray-800">
                                <MapPin className="w-6 h-6 text-gray-400" />
                            </div>
                            <h2 className="text-sm font-black uppercase text-gray-500 tracking-widest pt-3">{origin} (Start)</h2>
                        </div>

                        {/* Stops */}
                        {data?.stops.map((stop, i) => (
                            <div key={i} className="relative pl-14 group">
                                <div className="absolute left-0 top-0 w-12 h-12 bg-black rounded-full flex items-center justify-center border-2 border-[#ff10f0] shadow-[0_0_15px_rgba(255,16,240,0.4)] z-10 transition-transform group-hover:scale-110">
                                    <span className="text-[#ff10f0] font-black text-lg">{i + 1}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="text-[#ff10f0] text-[10px] font-black uppercase tracking-widest">{stop.waypointLabel}</span>
                                </div>
                                <HotelCard offer={stop} />
                            </div>
                        ))}

                        {/* End */}
                        <div className="relative pl-14">
                            <div className="absolute left-0 top-0 w-12 h-12 bg-[#111] rounded-full flex items-center justify-center border border-gray-800">
                                <Flag className="w-6 h-6 text-gray-400" />
                            </div>
                            <h2 className="text-sm font-black uppercase text-gray-500 tracking-widest pt-3">{destination} (End)</h2>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function RouteResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Zap className="w-12 h-12 text-[#ff10f0] animate-spin" />
            </div>
        }>
            <RouteContent />
        </Suspense>
    );
}
