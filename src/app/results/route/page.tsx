"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HotelCard } from "@/components/HotelCard";
import { Offer } from "@/types/hotel";
import { Zap, ArrowLeft, MapPin, Flag, Info } from "lucide-react";
import Link from "next/link";

interface RouteResults {
    stops: (Offer & { waypointLabel: string })[];
}

function RouteContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [data, setData] = useState<RouteResults | null>(null);
    const [loading, setLoading] = useState(true);
    const [is1AM, setIs1AM] = useState(false);

    const origin = searchParams.get("origin") || "Unknown";
    const destination = searchParams.get("destination") || "Unknown";
    const bookingTime = searchParams.get("bookingTime") || "now";
    const duration = parseInt(searchParams.get("duration") || "1");

    useEffect(() => {
        setIs1AM(new Date().getHours() >= 23 || new Date().getHours() <= 4);

        async function fetchRoute() {
            try {
                const now = new Date();
                const checkInDate = new Date();
                if (bookingTime === "nextDay") {
                    checkInDate.setDate(now.getDate() + 1);
                }

                const checkOutDate = new Date(checkInDate);
                checkOutDate.setDate(checkInDate.getDate() + duration);

                const checkInString = checkInDate.toISOString().split('T')[0];
                const checkOutString = checkOutDate.toISOString().split('T')[0];

                const res = await fetch("/api/route-hotels", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ origin, destination, checkIn: checkInString, checkOut: checkOutString })
                });
                const d = await res.json();
                if (d.error) {
                    console.error("Route calculation error:", d.error);
                    setData({ stops: [], error: d.error } as any);
                } else {
                    setData(d);
                }
            } catch (error) {
                console.error("Route fetch failed:", error);
                setData({ stops: [], error: "Connection problem" } as any);
            } finally {
                setLoading(false);
            }
        }

        if (origin && destination) fetchRoute();
    }, [origin, destination, bookingTime, duration]);

    return (
        <main className={`min-h-screen ${is1AM ? 'bg-[#050505]' : 'bg-black'} text-white pb-20`}>
            {/* 1AM Mode Status Bar */}
            {is1AM && (
                <div className="bg-[#ff10f0] text-black py-1.5 px-4 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">1AM MODE ACTIVE · DRIVE MODE OPTIMIZED</span>
                </div>
            )}

            {/* Tactical Header */}
            <header className="sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-5">
                <div className="flex items-center justify-between max-w-xl mx-auto">
                    <button onClick={() => router.back()} className="p-2 border border-white/10 rounded-xl active:scale-90 transition-all">
                        <ArrowLeft className="w-5 h-5 text-[#ff10f0]" />
                    </button>

                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black tracking-[0.2em] text-[#ff10f0] uppercase italic">The Route</span>
                        </div>
                        <h1 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                            {origin.split(',')[0]} <span className="text-gray-600">→</span> {destination.split(',')[0]}
                        </h1>
                    </div>

                    <div className="p-2 border border-white/10 rounded-xl bg-[#111]">
                        <Zap className="w-5 h-5 text-[#ff10f0] fill-[#ff10f0]" />
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#ff10f0] blur-3xl opacity-20 animate-pulse" />
                        <Zap className="w-16 h-16 text-[#ff10f0] animate-spin relative z-10" />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-xl font-black uppercase tracking-tighter">Calculating Sleep Radar</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest animate-pulse">Scanning waypoints for optimal egress...</p>
                    </div>
                </div>
            ) : (data as any)?.error ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6 px-10 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <Info className="w-10 h-10 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Target Unreachable</h2>
                        <p className="text-gray-500 text-sm italic">{(data as any).error}</p>
                    </div>
                    <Link href="/" className="px-8 py-4 bg-[#ff10f0] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl">
                        Reset Mission
                    </Link>
                </div>
            ) : (
                <div className="max-w-xl mx-auto px-6 pt-8 space-y-12">

                    {/* Sleep Radar Strip */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-[#ff10f0]" />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Sleep Radar Ahead</h2>
                            </div>
                            <span className="text-[8px] font-black text-[#ff10f0] uppercase tracking-widest">Cheapest Stops Indexed</span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                            {data?.stops.map((stop, i) => (
                                <div key={i} className="flex-none w-48 bg-[#111] border border-white/5 rounded-2xl p-4 snap-start relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-[#ff10f0]/5 rounded-bl-3xl -mr-4 -mt-4 group-hover:bg-[#ff10f0]/10 transition-colors" />
                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1">{stop.waypointLabel}</span>
                                    <h3 className="text-xs font-black truncate mb-3">{stop.hotelName}</h3>
                                    <div className="flex items-end justify-between">
                                        <span className="text-xl font-black">${stop.rates[0].totalAmount}</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[7px] font-black text-emerald-400 uppercase">9.1 Confirms</span>
                                            <span className="text-[6px] font-bold text-gray-600 uppercase">Tonight</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Detailed Route Intelligence */}
                    <section className="space-y-10 relative">
                        {/* The High-Speed Trace Line */}
                        <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-[#ff10f0] via-gray-800 to-emerald-400 opacity-20" />

                        {/* Starting Location */}
                        <div className="relative pl-14">
                            <div className="absolute left-0 top-0 w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-xl">
                                <MapPin className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="pt-1">
                                <h2 className="text-[10px] font-black uppercase text-gray-600 tracking-widest mb-1">Departure Point</h2>
                                <p className="text-lg font-black uppercase tracking-tight">{origin}</p>
                            </div>
                        </div>

                        {/* Tactical Stop Points */}
                        {data?.stops.map((stop, i) => (
                            <div key={i} className="relative pl-14 group">
                                <div className="absolute left-0 top-0 w-12 h-12 bg-black rounded-2xl flex items-center justify-center border-2 border-[#ff10f0] shadow-[0_0_20px_rgba(255,16,240,0.3)] z-10 transition-all group-hover:scale-110">
                                    <span className="text-[#ff10f0] font-black text-xl">{i + 1}</span>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-0.5 bg-[#ff10f0]/10 border border-[#ff10f0]/20 text-[#ff10f0] text-[8px] font-black uppercase tracking-widest rounded">Zone: {stop.waypointLabel}</span>
                                        {i === 0 && (
                                            <span className="bg-emerald-400 text-black text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]">Next Best Stop</span>
                                        )}
                                        {stop.pressureLabel === 'LIMITED' && (
                                            <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest animate-pulse">Filling Up Fast</span>
                                        )}
                                    </div>
                                    <HotelCard offer={stop} duration={duration} />
                                </div>
                            </div>
                        ))}

                        {/* Destination */}
                        <div className="relative pl-14 pb-12">
                            <div className="absolute left-0 top-0 w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-xl">
                                <Flag className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="pt-1">
                                <h2 className="text-[10px] font-black uppercase text-gray-600 tracking-widest mb-1">Mission Terminal</h2>
                                <p className="text-lg font-black uppercase tracking-tight">{destination}</p>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}

export default function RouteResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
                <Zap className="w-12 h-12 text-[#ff10f0] animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ff10f0]/60">Initializing Route Engine...</p>
            </div>
        }>
            <RouteContent />
        </Suspense>
    );
}
