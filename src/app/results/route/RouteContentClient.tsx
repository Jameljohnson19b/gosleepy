"use client";

import { useEffect, useState, useMemo } from "react";
import { HotelCard } from "@/components/HotelCard";
import { Offer } from "@/types/hotel";
import { Zap, ArrowLeft, MapPin, Flag, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RouteStop {
    stopIndex: number;
    status: 'OK' | 'NO_OFFERS' | 'ERROR';
    label: string;
    best?: Offer;
    error?: string;
}

interface RouteResults {
    stops: RouteStop[];
    error?: string;
}

export default function RouteContentClient({
    origin,
    destination,
    radius,
    bookingTime,
    duration,
}: {
    origin: string;
    destination: string;
    radius: number;
    bookingTime: string;
    duration: number;
}) {
    const router = useRouter();
    const [data, setData] = useState<RouteResults | null>(null);
    const [loading, setLoading] = useState(true);
    const [is1AM, setIs1AM] = useState(false);

    // 1AM Mode (Mission Spec: 10PM - 6AM)
    useEffect(() => {
        const checkTime = () => {
            const h = new Date().getHours();
            setIs1AM(h >= 22 || h < 6);
        };
        checkTime();
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Date Calculation
    const { checkIn, checkOut } = useMemo(() => {
        const now = new Date();
        const ci = new Date(now);
        if (bookingTime === "nextDay") ci.setDate(now.getDate() + 1);

        const co = new Date(ci);
        co.setDate(ci.getDate() + Math.max(1, duration));

        const fmt = (d: Date) => d.toISOString().split('T')[0];
        return { checkIn: fmt(ci), checkOut: fmt(co) };
    }, [bookingTime, duration]);

    useEffect(() => {
        let cancelled = false;

        async function fetchRoute() {
            setLoading(true);
            try {
                const res = await fetch("/api/route-hotels", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        origin,
                        destination,
                        checkIn,
                        checkOut,
                        radiusMiles: radius,
                        guests: 2,
                        bookingTime
                    })
                });
                const d = await res.json();
                if (!cancelled) {
                    if (d.error) {
                        setData({ stops: [], error: d.error });
                    } else {
                        setData(d);
                    }
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Route fetch failed:", error);
                    setData({ stops: [], error: "Mission Intel Link Failed" });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (origin && destination) {
            fetchRoute();
        } else {
            setLoading(false);
        }

        return () => { cancelled = true; };
    }, [origin, destination, checkIn, checkOut, radius, bookingTime]);

    return (
        <main className={`min-h-screen ${is1AM ? 'bg-[#050005]' : 'bg-black'} text-white pb-20 transition-colors duration-1000 overflow-x-hidden`}>

            {/* 1AM Mode Status Bar */}
            {is1AM && (
                <div className="bg-[#ff10f0] text-black py-1.5 px-4 text-center sticky top-0 z-50 shadow-[0_4px_30px_rgba(255,16,240,0.3)]">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">1AM MODE ACTIVE · HIGH CONTRAST · LOW FRICTION</span>
                </div>
            )}

            {/* Tactical Header */}
            <header className={`sticky ${is1AM ? 'top-[31px]' : 'top-0'} z-40 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-6`}>
                <div className="flex items-center justify-between max-w-xl mx-auto">
                    <button onClick={() => router.back()} className="p-3 bg-white/5 border border-white/10 rounded-2xl active:scale-90 transition-all">
                        <ArrowLeft className="w-5 h-5 text-[#ff10f0]" />
                    </button>

                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-3 h-3 text-[#ff10f0] fill-[#ff10f0]" />
                            <span className="text-[10px] font-black tracking-[0.2em] text-[#ff10f0] uppercase italic">Sleep Radar Engine</span>
                            <Zap className="w-3 h-3 text-[#ff10f0] fill-[#ff10f0]" />
                        </div>
                        <h1 className="text-sm font-black uppercase tracking-tight flex items-center gap-3">
                            {origin.split(',')[0]} <span className="text-gray-600 text-[8px]">→</span> {destination.split(',')[0]}
                        </h1>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="w-5 h-5 bg-[#ff10f0] rounded-full animate-ping opacity-20 absolute" />
                        <MapPin className="w-5 h-5 text-[#ff10f0] relative" />
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#ff10f0] blur-[80px] opacity-30 animate-pulse" />
                        <div className="w-24 h-24 border-b-4 border-r-4 border-[#ff10f0] rounded-full animate-spin absolute" />
                        <Zap className="w-12 h-12 text-[#ff10f0] animate-bounce relative top-6 left-6" />
                    </div>
                    <div className="text-center space-y-3">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Scanning Orbit</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest animate-pulse max-w-[200px]">Intercepting mission-critical rates from suppliers...</p>
                    </div>
                </div>
            ) : (data as any)?.error ? (
                <div className="flex flex-col items-center justify-center py-24 gap-8 px-10 text-center">
                    <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                        <Info className="w-12 h-12 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-3">Vector Lost</h2>
                        <p className="text-gray-500 text-sm italic">{(data as any).error}</p>
                    </div>
                    <Link href="/" className="px-12 py-5 bg-[#ff10f0] text-white font-black uppercase tracking-widest text-xs rounded-3xl shadow-[0_0_30px_rgba(255,16,240,0.4)]">
                        Calculate New Mission
                    </Link>
                </div>
            ) : (!data || !data.stops || data.stops.length === 0) && !loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-8 px-10 text-center">
                    <div className="w-24 h-24 rounded-full bg-[#ff10f0]/5 flex items-center justify-center border border-[#ff10f0]/20 shadow-[0_0_50px_rgba(255,16,240,0.1)]">
                        <MapPin className="w-12 h-12 text-[#ff10f0]" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-3">No Mission Active</h2>
                        <p className="text-gray-500 text-sm italic">Define an origin and destination to begin scanning waypoints.</p>
                    </div>
                    <Link href="/" className="px-12 py-5 bg-[#ff10f0] text-white font-black uppercase tracking-widest text-xs rounded-3xl shadow-[0_0_30px_rgba(255,16,240,0.4)]">
                        Initialize Mission
                    </Link>
                </div>
            ) : (
                <div className="max-w-xl mx-auto px-6 pt-10 space-y-16">

                    {/* Sleep Radar Strip */}
                    <section className="relative">
                        {is1AM && <div className="absolute inset-0 bg-[#ff10f0]/5 blur-3xl -z-10" />}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#ff10f0] animate-ping" />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-300">Fast Comparison</h2>
                            </div>
                            <span className="text-[9px] font-black text-[#ff10f0] uppercase tracking-widest bg-[#ff10f0]/10 px-2 py-1 rounded">Radar Feed</span>
                        </div>
                        <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x">
                            {data?.stops?.filter(s => s.status === 'OK').map((stop, i) => (
                                <div key={i} className={`flex-none w-52 ${is1AM ? 'bg-[#111]' : 'bg-zinc-900'} border border-white/10 rounded-3xl p-5 snap-start relative overflow-hidden group hover:border-[#ff10f0]/50 transition-all`}>
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff10f0]/10 rounded-bl-[40px] -mr-4 -mt-4 transition-colors group-hover:bg-[#ff10f0]/20" />
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">{stop.label}</span>
                                    <h3 className="text-xs font-black truncate mb-4">{stop.best?.hotelName}</h3>
                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black leading-none tracking-tighter font-mono">${stop.best?.rates[0].totalAmount}</span>
                                            <span className="text-[7px] font-bold text-gray-600 uppercase mt-1">Found Stop</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {stop.best?.confidenceScore && (
                                                <div className="px-2 py-0.5 bg-emerald-400/10 rounded text-emerald-400 text-[7px] font-black uppercase italic">
                                                    {stop.best.confidenceScore.toFixed(1)} Confirms
                                                </div>
                                            )}
                                            <span className="text-[6px] font-black text-gray-500 uppercase tracking-tighter">Secure Room</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Detailed Route Intelligence */}
                    <section className="space-y-14 relative pb-10">
                        {/* The High-Speed Trace Line */}
                        <div className={`absolute left-[23px] top-6 bottom-6 w-[2px] ${is1AM ? 'bg-gradient-to-b from-[#ff10f0] via-[#ff10f0]/40 to-emerald-400' : 'bg-gray-800'} opacity-30`} />

                        {/* Starting Location */}
                        <div className="relative pl-16">
                            <div className="absolute left-0 top-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
                                <MapPin className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="pt-1">
                                <h2 className="text-[11px] font-black uppercase text-gray-600 tracking-widest mb-1.5">Origin Base</h2>
                                <p className="text-xl font-black uppercase tracking-tight">{origin}</p>
                            </div>
                        </div>

                        {/* Tactical Stop Points */}
                        {data?.stops?.map((stop, i) => (
                            <div key={i} className="relative pl-16 group">
                                <div className="absolute left-0 top-0 w-12 h-12 bg-black rounded-2xl flex items-center justify-center border-2 border-[#ff10f0] shadow-[0_0_30px_rgba(255,16,240,0.4)] z-10 transition-all group-hover:scale-110">
                                    <span className="text-[#ff10f0] font-black text-xl italic">{i + 1}</span>
                                </div>
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="px-3 py-1 bg-[#ff10f0]/10 border border-[#ff10f0]/30 text-[#ff10f0] text-[9px] font-black uppercase tracking-widest rounded-lg">
                                            {stop.label}
                                        </div>
                                        {i === 0 && stop.status === 'OK' && (
                                            <span className="bg-emerald-400 text-black text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.3)] animate-pulse">Next Best Rest</span>
                                        )}
                                        {stop.status === 'OK' && stop.best?.pressureLabel === 'LIMITED' && (
                                            <span className="text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-400/20 px-2 py-1 rounded">Demand Spiking</span>
                                        )}
                                    </div>

                                    {stop.status === 'OK' && stop.best ? (
                                        <HotelCard offer={stop.best} duration={duration} />
                                    ) : (
                                        <div className="p-8 bg-[#111] border border-gray-800 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 text-center grayscale opacity-60">
                                            <Info className="w-8 h-8 text-gray-600" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sensor Gap</p>
                                                <p className="text-[9px] font-bold text-gray-600 italic">No suitable lodging within {radius * 2}mi of this vector.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Destination */}
                        <div className="relative pl-16">
                            <div className="absolute left-0 top-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
                                <Flag className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="pt-1">
                                <h2 className="text-[11px] font-black uppercase text-gray-600 tracking-widest mb-1.5">Mission Terminal</h2>
                                <p className="text-xl font-black uppercase tracking-tight">{destination}</p>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}
