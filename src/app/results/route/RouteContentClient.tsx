"use client";

import { useEffect, useState, useMemo } from "react";
import { HotelCard } from "@/components/HotelCard";
import { Offer } from "@/types/hotel";
import { Zap, ArrowLeft, MapPin, Flag, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PitStop {
    name: string;
    brand: string;
    perks: string[];
    distance: number;
    type: 'GAS_STATION' | 'CHARGING_STATION';
    gasPrices?: { regular: string; diesel: string };
    coordinates: { lat: number; lng: number };
}

interface RouteStop {
    stopIndex: number;
    status: 'OK' | 'NO_OFFERS' | 'ERROR';
    label: string;
    bestOffer?: Offer;
    offers?: Offer[];
    pitStops?: PitStop[];
    error?: string;
}

interface RouteResults {
    stops: RouteStop[];
    distance?: number;
    durationHours?: number;
    error?: string;
}

function RadarCard({ stop, offer, is1AM }: { stop: RouteStop; offer?: Offer; is1AM: boolean }) {
    const price = offer?.rates?.[0]?.totalAmount;
    const currency = offer?.rates?.[0]?.currency ?? "USD";

    return (
        <div className={`flex-none w-[260px] ${is1AM ? 'bg-[#111]' : 'bg-zinc-900'} border border-white/10 rounded-2xl p-4 snap-start relative overflow-hidden group hover:border-[#ff10f0]/50 transition-all`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff10f0]/10 rounded-bl-[40px] -mr-4 -mt-4 transition-colors group-hover:bg-[#ff10f0]/20" />
            <div className="text-sm font-black uppercase tracking-tighter mb-1">{stop.label}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{stop.status}</div>

            {price ? (
                <div className="mt-2 text-2xl font-black tracking-tighter font-mono leading-none">
                    ${price} <span className="text-[10px] opacity-40 font-mono italic">{currency}</span>
                </div>
            ) : (
                <div className="mt-2 text-xs font-black uppercase text-gray-600 italic">No Intel Found</div>
            )}

            {offer && (
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="text-[9px] font-black text-emerald-400 uppercase italic">
                        {offer.confidenceScore?.toFixed(1) || '—'}/10 CONFIRMS
                    </div>
                    <div className={`text-[8px] font-black uppercase tracking-wider ${offer.pressureLabel === 'LIMITED' ? 'text-blue-400' : 'text-gray-500'}`}>
                        {offer.pressureLabel || 'STABLE'}
                    </div>
                </div>
            )}
        </div>
    );
}

function RouteStopComponent({ index, stop, offer, duration, radius, is1AM }: { index: number; stop: RouteStop; offer?: Offer; duration: number; radius: number; is1AM: boolean }) {
    const price = offer?.rates?.[0]?.totalAmount;
    const currency = offer?.rates?.[0]?.currency ?? "USD";

    return (
        <div className="relative pl-10 group">
            {/* Trace Indicator */}
            <div className={`absolute left-[20px] top-3 w-1.5 h-1.5 rounded-full ${offer ? 'bg-[#ff10f0]' : 'bg-gray-800'} z-10`} />

            <div className="mb-10">
                <div className="flex flex-col gap-1 mb-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Stop {index}</div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">{stop.label}</h3>
                </div>

                {offer ? (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="bg-emerald-400 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                                ${price} {currency}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {offer.hotelName}
                            </div>
                            <div className="text-[9px] font-bold text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded">
                                {offer.confidenceScore?.toFixed(1) || '—'}/10 CONFIRMS
                            </div>
                            <div className="text-[9px] font-bold text-blue-400 border border-blue-400/20 px-2 py-0.5 rounded uppercase">
                                {offer.pressureLabel}
                            </div>
                        </div>

                        <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                            SUPPORT RISK: <span className={offer.supportRisk?.label === 'HIGH' ? 'text-[#ff10f0]' : 'text-blue-400'}>{offer.supportRisk?.label} ({offer.supportRisk?.riskScore})</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-[10px] font-black uppercase text-gray-600 italic">
                        {stop.status === "NO_OFFERS" ? "No tactical lodging identified at this vector." : stop.status}
                    </div>
                )}

                {/* Pit Stops Supply Chain */}
                {stop.pitStops && stop.pitStops.length > 0 && (
                    <div className="mt-8 space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5 pb-2">Supply Points Nearby</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stop.pitStops.map((pit, j) => (
                                <div key={j} className={`rounded-2xl ${pit.type === 'CHARGING_STATION' ? 'bg-[#ff10f0]/5 border-[#ff10f0]/20' : 'bg-white/5 border-white/10'} border p-4 text-[11px] relative overflow-hidden group`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-black uppercase tracking-tighter text-white">{pit.name}</div>
                                        <div className="text-[9px] font-bold text-gray-500">{pit.distance} mi</div>
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">{pit.type.replace('_', ' ')}</div>

                                    {pit.gasPrices && (
                                        <div className="flex items-center gap-4 mt-1 bg-black/40 rounded-lg p-2 border border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[7px] font-black text-gray-600 uppercase">Regular</span>
                                                <span className="text-emerald-400 font-mono font-black">${pit.gasPrices.regular}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[7px] font-black text-gray-600 uppercase">Diesel</span>
                                                <span className="text-gray-400 font-mono font-black">${pit.gasPrices.diesel}</span>
                                            </div>
                                        </div>
                                    )}

                                    {pit.perks?.length && (
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {pit.perks.map((p, k) => (
                                                <span key={k} className="text-[7px] font-bold text-gray-600 uppercase bg-white/5 px-1.5 py-0.5 rounded">{p}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function TacticalMap({ stops, is1AM, origin, destination }: { stops: RouteStop[], is1AM: boolean, origin: string, destination: string }) {
    const originCity = origin.split(',')[0].trim();
    const destCity = destination.split(',')[0].trim();

    return (
        <div className="relative w-full h-56 lg:h-[420px] bg-zinc-900/50 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
            {/* Mission Grid */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full p-12 lg:p-20">
                {/* Tactical Trace */}
                <path
                    d="M 20 100 Q 100 20, 200 100 T 380 100"
                    fill="none"
                    stroke={is1AM ? "#ff10f0" : "#fff"}
                    strokeWidth="3"
                    strokeDasharray="8 4"
                    className="animate-[dash_60s_linear_infinite]"
                />

                {/* Origin */}
                <g className="translate-y-[-10px] lg:translate-y-0">
                    <circle cx="20" cy="100" r="8" fill={is1AM ? "#ff10f0" : "#fff"} className="animate-pulse" />
                    <text x="20" y="130" textAnchor="middle" className="text-[7px] font-black fill-[#ff10f0] uppercase tracking-tighter">Origin</text>
                    <text x="20" y="142" textAnchor="middle" className="text-[9px] lg:text-[10px] font-black fill-white uppercase tracking-tighter">{originCity}</text>
                </g>

                {/* Waypoints */}
                {stops.map((stop, i) => (
                    <g key={i}>
                        <circle
                            cx={80 + i * 110}
                            cy={i === 1 ? 40 : 100}
                            r="5"
                            fill={is1AM ? "#ff10f0" : "#fff"}
                            className="opacity-50"
                        />
                        <text
                            x={80 + i * 110}
                            cy={i === 1 ? 25 : 125}
                            textAnchor="middle"
                            className="text-[8px] lg:text-[9px] font-black fill-white uppercase tracking-tighter"
                        >
                            {stop.label}
                        </text>
                    </g>
                ))}

                {/* Destination */}
                <g className="translate-y-[-10px] lg:translate-y-0">
                    <circle cx="380" cy="100" r="8" fill={is1AM ? "#ff10f0" : "#fff"} />
                    <text x="380" y="130" textAnchor="middle" className="text-[7px] font-black fill-emerald-400 uppercase tracking-tighter">Terminal</text>
                    <text x="380" y="142" textAnchor="middle" className="text-[9px] lg:text-[10px] font-black fill-white uppercase tracking-tighter">{destCity}</text>
                </g>
            </svg>

            {/* Radar Sweep Effect */}
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]`} />

            <div className="absolute bottom-6 right-8 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Live Vector Trace — Intercepting Rates</span>
            </div>
        </div>
    );
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
                <div className="flex items-center justify-between max-w-7xl mx-auto">
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
                <div className="max-w-7xl mx-auto px-6 pt-10 space-y-20">

                    {/* Mission Dashboard: Metrics + Map */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
                        {is1AM && <div className="absolute inset-x-0 top-0 h-64 bg-[#ff10f0]/5 blur-[100px] -z-10" />}

                        {/* Global Metrics Panel */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-[35px] p-8 flex flex-col gap-8 relative overflow-hidden h-full">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 blur-3xl" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Total Mission Distance</span>
                                    <span className="text-5xl font-black tracking-tighter italic">{data?.distance || '---'} <span className="text-lg not-italic opacity-40">MI</span></span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Arrival Approx.</span>
                                    <span className="text-5xl font-black tracking-tighter italic text-[#ff10f0]">{data?.durationHours || '--'} <span className="text-lg not-italic opacity-40">HRS</span></span>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/80 italic">Vector Synchronization Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tactical Map Panel */}
                        <div className="lg:col-span-2">
                            <TacticalMap stops={data?.stops || []} is1AM={is1AM} origin={origin} destination={destination} />
                        </div>
                    </section>

                    {/* Sleep Radar Strip (Fast Comparison) */}
                    <section className="space-y-8">

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#ff10f0] animate-ping" />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-300">Fast Comparison</h2>
                            </div>
                            <span className="text-[9px] font-black text-[#ff10f0] uppercase tracking-widest bg-[#ff10f0]/10 px-2 py-1 rounded">Radar Feed</span>
                        </div>
                        <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x">
                            {data?.stops?.filter(s => s.status === 'OK').map((stop, i) => (
                                <RadarCard key={i} stop={stop} offer={stop.bestOffer} is1AM={is1AM} />
                            ))}
                        </div>
                    </section>

                    {/* Detailed Route Intelligence */}
                    <section className="space-y-4 relative pb-20">
                        {/* The High-Speed Trace Line */}
                        <div className={`absolute left-[23px] top-6 bottom-6 w-[2px] ${is1AM ? 'bg-gradient-to-b from-[#ff10f0] via-[#ff10f0]/40 to-emerald-400' : 'bg-gray-800'} opacity-30`} />

                        {/* Starting Location */}
                        <div className="relative pl-16 mb-12">
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
                            <RouteStopComponent
                                key={i}
                                index={i + 1}
                                stop={stop}
                                offer={stop.bestOffer}
                                duration={duration}
                                radius={radius}
                                is1AM={is1AM}
                            />
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
