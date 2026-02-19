"use client";

import { useEffect, useState, useMemo } from "react";
import { HotelCard } from "@/components/HotelCard";
import { Offer } from "@/types/hotel";
import { Zap, ArrowLeft, MapPin, Flag, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SoftAuthSheet from "@/components/auth/SoftAuthSheet";

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
    origin?: { lat: number; lng: number };
    destination?: { lat: number; lng: number };
    error?: string;
}

function RadarCard({ stop, offer, index, is1AM }: { stop: RouteStop; offer?: Offer; index: number; is1AM: boolean }) {
    const price = offer?.rates?.[0]?.totalAmount;
    const currency = offer?.rates?.[0]?.currency ?? "USD";
    const isLowest = index === 0;

    return (
        <div className={`flex-none w-[260px] ${is1AM ? 'bg-[#111]' : 'bg-zinc-900'} border border-white/10 rounded-2xl p-4 snap-start relative overflow-hidden group hover:border-[#ff10f0]/50 transition-all`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff10f0]/10 rounded-bl-[40px] -mr-4 -mt-4 transition-colors group-hover:bg-[#ff10f0]/20" />

            <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-black uppercase tracking-tighter truncate max-w-[140px]">{stop.label}</div>
                {isLowest && (
                    <div className="px-2 py-0.5 bg-emerald-400 text-black text-[7px] font-black uppercase tracking-widest rounded animate-pulse">
                        Lowest Today
                    </div>
                )}
            </div>

            {typeof price === 'number' ? (
                <div className="mt-2 space-y-1">
                    <div className="text-2xl font-black tracking-tighter font-mono leading-none">
                        ${price} <span className="text-[10px] opacity-40 font-mono italic">{currency}</span>
                    </div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                        ≈ ${Math.round(price / 6)}/hour rest
                    </div>
                </div>
            ) : (
                <div className="mt-2 text-xs font-black uppercase text-gray-600 italic">Scanning Prices...</div>
            )}

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="text-[9px] font-black text-gray-400 uppercase italic">
                    {offer?.hotelName ? 'Room found' : 'Searching...'}
                </div>
                <div className={`text-[8px] font-black uppercase tracking-wider ${isLowest ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {isLowest ? 'BEST PRICE AHEAD' : 'PAY AT HOTEL'}
                </div>
            </div>
        </div>
    );
}

function RouteStopComponent({ index, stop, duration, radius, is1AM }: { index: number; stop: RouteStop; duration: number; radius: number; is1AM: boolean }) {
    const mainOffer = stop.bestOffer;
    const allOffers = stop.offers || (mainOffer ? [mainOffer] : []);
    const hasOffers = allOffers.length > 0;

    return (
        <div className="relative pl-10 group">
            {/* Trace Indicator */}
            <div className={`absolute left-[20px] top-3 w-1.5 h-1.5 rounded-full ${hasOffers ? 'bg-[#ff10f0]' : 'bg-gray-800'} z-10`} />

            <div className="mb-14">
                <div className="flex flex-col gap-1 mb-6">
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Stop {index}</div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">
                        {stop.label} {mainOffer?.rates?.[0]?.totalAmount ? `— from $${mainOffer.rates[0].totalAmount}` : ''}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                        {hasOffers ? `${allOffers.length} budget properties found nearby · Amadeus Guaranteed.` : "Looking for budget hotels ahead..."}
                    </p>
                </div>

                {hasOffers ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allOffers.map((offer, i) => {
                            const price = offer.rates?.[0]?.totalAmount;
                            const currency = offer.rates?.[0]?.currency ?? "USD";
                            const isBest = i === 0;

                            return (
                                <div key={offer.hotelId || i} className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`${isBest ? 'bg-emerald-400 text-black' : 'bg-white/10 text-gray-400'} text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded`}>
                                            ${price} {currency}
                                        </div>
                                        {isBest && (
                                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">Lowest</span>
                                        )}
                                    </div>
                                    <HotelCard offer={offer} duration={duration} />
                                    <button className={`w-full ${isBest ? 'bg-[#ff10f0] shadow-[0_0_20px_rgba(255,16,240,0.3)]' : 'bg-white/10'} text-white font-black uppercase tracking-widest py-3 rounded-xl hover:scale-[1.02] transition-all text-[10px]`}>
                                        {isBest ? 'Reserve Best Rate' : 'View Mission'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-[10px] font-black uppercase text-gray-600 italic">
                        {stop.status === "NO_OFFERS" ? "Searching further down the road for better prices..." : stop.status}
                    </div>
                )}

                {/* Pit Stops Supply Chain */}
                {stop.pitStops && stop.pitStops.length > 0 && (
                    <div className="mt-8 space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5 pb-2">Gas and food nearby</div>
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

function RouteMap({ stops, is1AM, origin, destination, originCoords, destCoords }: { stops: RouteStop[], is1AM: boolean, origin: string, destination: string, originCoords?: { lat: number, lng: number }, destCoords?: { lat: number, lng: number } }) {
    const originCity = origin.split(',')[0].trim();
    const destCity = destination.split(',')[0].trim();

    // Geography Check: NYC (-74) is EAST of Seattle (-122). 
    // In negative longitudes (Western Hemisphere), larger values are further EAST.
    const isWestbound = originCoords && destCoords ? originCoords.lng > destCoords.lng : false;

    // Mapping logic:
    // Eastbound: Origin (Left/20) -> Destination (Right/380)
    // Westbound: Origin (Right/380) -> Destination (Left/20)
    const getX = (t: number) => {
        // t is normalized distance (0 to 1)
        if (isWestbound) return 380 - (t * 360);
        return 20 + (t * 360);
    };

    const originX = getX(0);
    const destX = getX(1);

    // Path Curve (Flip based on orientation)
    const pathD = isWestbound
        ? "M 380 100 Q 300 180, 200 100 T 20 100"
        : "M 20 100 Q 100 20, 200 100 T 380 100";

    return (
        <div className="relative w-full h-56 lg:h-[420px] bg-zinc-900/50 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
            {/* Route Grid */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full p-12 lg:p-20">
                {/* Route Trace */}
                <path
                    d={pathD}
                    fill="none"
                    stroke={is1AM ? "#ff10f0" : "#fff"}
                    strokeWidth="3"
                    strokeDasharray="8 4"
                    className="animate-[dash_60s_linear_infinite] opacity-30"
                />

                {/* Origin */}
                <g transform={`translate(${originX}, 100)`}>
                    <circle r="8" fill={is1AM ? "#ff10f0" : "#fff"} className="animate-pulse" />
                    <text y="30" textAnchor="middle" className="text-[7px] font-black fill-[#ff10f0] uppercase tracking-tighter">Origin</text>
                    <text y="42" textAnchor="middle" className="text-[9px] lg:text-[10px] font-black fill-white uppercase tracking-tighter">{originCity}</text>
                </g>

                {/* Waypoints (Hotels/Motels) */}
                {stops.map((stop, i) => {
                    // Waypoints are at 0.25, 0.5, 0.75 along the trip
                    const t = (i + 1) * 0.25;
                    const x = getX(t);
                    const y = i === 1 ? 40 : 100; // Keep the wiggle for visual interest
                    const price = stop.bestOffer?.rates?.[0]?.totalAmount;

                    return (
                        <g key={i} transform={`translate(${x}, ${y})`}>
                            {/* Glow Effect */}
                            <circle r="12" fill="#ff10f0" className="opacity-10 animate-pulse" />

                            {/* Hotel Pin */}
                            <rect x="-15" y="-12" width="30" height="24" rx="4" fill="#111" stroke="#ff10f0" strokeWidth="1" />
                            <Zap className="w-3 h-3 text-[#ff10f0] -translate-x-1.5 -translate-y-6 fill-[#ff10f0]" />

                            {/* Price Label */}
                            <text
                                textAnchor="middle"
                                className="text-[8px] font-black fill-white uppercase tracking-tighter"
                                dy="4"
                            >
                                {price ? `$${price}` : 'MOTEL'}
                            </text>

                            {/* Stop Name Label */}
                            <text
                                y={i === 1 ? -25 : 25}
                                textAnchor="middle"
                                className="text-[7px] lg:text-[8px] font-bold fill-gray-400 uppercase tracking-tighter whitespace-nowrap"
                            >
                                {stop.label}
                            </text>
                        </g>
                    );
                })}

                {/* Destination */}
                <g transform={`translate(${destX}, 100)`}>
                    <circle r="8" fill={is1AM ? "#ff10f0" : "#fff"} />
                    <text y="30" textAnchor="middle" className="text-[7px] font-black fill-emerald-400 uppercase tracking-tighter">Destination</text>
                    <text y="42" textAnchor="middle" className="text-[9px] lg:text-[10px] font-black fill-white uppercase tracking-tighter">{destCity}</text>
                </g>
            </svg>

            <div className="absolute top-6 left-8 flex items-center gap-2 px-3 py-1 bg-black/40 border border-[#ff10f0]/30 rounded-full backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff10f0] animate-pulse" />
                <span className="text-[8px] font-black uppercase text-white tracking-widest">{isWestbound ? 'WESTBOUND VECTOR' : 'EASTBOUND VECTOR'}</span>
            </div>

            <div className="absolute bottom-6 right-8 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Live price intelligence verified</span>
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
    sessionId,
}: {
    origin: string;
    destination: string;
    radius: number;
    bookingTime: string;
    duration: number;
    sessionId: string;
}) {
    const router = useRouter();
    const [data, setData] = useState<RouteResults | null>(null);
    const [loading, setLoading] = useState(true);
    const [is1AM, setIs1AM] = useState(false);

    // Auth Intent State
    const [authSheetOpen, setAuthSheetOpen] = useState(false);
    const [tapCounts, setTapCounts] = useState<{ [key: string]: { count: number; last: number } }>({});
    const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);
    const [hasTriggeredIdle, setHasTriggeredIdle] = useState(false);

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

        return {
            checkIn: ci.toISOString().split('T')[0],
            checkOut: co.toISOString().split('T')[0]
        };
    }, [bookingTime, duration]);

    // Intent Triggers Logic
    const handleIntentTrigger = (type: 'DOUBLE_TAP' | 'RESERVE' | 'IDLE' | '1AM') => {
        if (!authSheetOpen) {
            setAuthSheetOpen(true);
            console.log(`[AUTH_AGENT] Triggered soft auth: ${type}`);
        }
    };

    // Idle Detection
    useEffect(() => {
        if (loading || hasTriggeredIdle) return;

        const resetTimer = () => {
            if (idleTimer) clearTimeout(idleTimer);
            const timer = setTimeout(() => {
                setHasTriggeredIdle(true);
                handleIntentTrigger('IDLE');
            }, 35000); // 35s idle fatigue signal
            setIdleTimer(timer);
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('scroll', resetTimer);
        resetTimer();

        return () => {
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('scroll', resetTimer);
            if (idleTimer) clearTimeout(idleTimer);
        };
    }, [loading, hasTriggeredIdle, idleTimer]);

    // 1AM Mode Protection
    useEffect(() => {
        if (is1AM && !loading) {
            // Late night travelers are high-intent and likely fatigued
            const timer = setTimeout(() => handleIntentTrigger('1AM'), 15000);
            return () => clearTimeout(timer);
        }
    }, [is1AM, loading]);

    const handleCardInteraction = (hotelId: string) => {
        const now = Date.now();
        const current = tapCounts[hotelId] || { count: 0, last: 0 };

        if (now - current.last < 30000) { // 30s window
            const newCount = current.count + 1;
            if (newCount >= 2) {
                handleIntentTrigger('DOUBLE_TAP');
                setTapCounts({ ...tapCounts, [hotelId]: { count: 0, last: now } }); // Reset
            } else {
                setTapCounts({ ...tapCounts, [hotelId]: { count: newCount, last: now } });
            }
        } else {
            setTapCounts({ ...tapCounts, [hotelId]: { count: 1, last: now } });
        }
    };

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
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">1AM MODE: Showing the lowest-cost stops worth pulling over for</span>
                </div>
            )}

            {/* Navigation Header */}
            <header className={`sticky ${is1AM ? 'top-[31px]' : 'top-0'} z-40 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-6`}>
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <button onClick={() => router.back()} className="p-3 bg-white/5 border border-white/10 rounded-2xl active:scale-90 transition-all">
                        <ArrowLeft className="w-5 h-5 text-[#ff10f0]" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-base font-black uppercase tracking-tight flex items-center gap-3 mb-1">
                            {origin.split(',')[0]} <span className="text-gray-600 text-[8px]">→</span> {destination.split(',')[0]}
                        </h1>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Find the low-cost smart stop ahead</p>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                        <span className="text-[8px] font-black uppercase text-[#ff10f0] leading-none block">Tonight</span>
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
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Searching Road Ahead</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest animate-pulse max-w-[200px]">Finding the lowest prices from hotels and suppliers...</p>
                    </div>
                </div>
            ) : data?.error ? (
                <div className="flex flex-col items-center justify-center py-24 gap-8 px-10 text-center">
                    <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                        <Info className="w-12 h-12 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-3">Vector Lost</h2>
                        <p className="text-gray-500 text-sm italic">{data.error}</p>
                    </div>
                    <Link href="/" className="px-12 py-5 bg-[#ff10f0] text-white font-black uppercase tracking-widest text-xs rounded-3xl shadow-[0_0_30px_rgba(255,16,240,0.4)]">
                        Start New Search
                    </Link>
                </div>
            ) : (!data || !data.stops || data.stops.length === 0) && !loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-8 px-10 text-center">
                    <div className="w-24 h-24 rounded-full bg-[#ff10f0]/5 flex items-center justify-center border border-[#ff10f0]/20 shadow-[0_0_50px_rgba(255,16,240,0.1)]">
                        <MapPin className="w-12 h-12 text-[#ff10f0]" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-3">No low-cost stops nearby</h2>
                        <p className="text-gray-500 text-sm italic">Expanding the search to find lower prices ahead. So you don't waste your trip budget.</p>
                    </div>
                    <Link href="/" className="px-12 py-5 bg-[#ff10f0] text-white font-black uppercase tracking-widest text-xs rounded-3xl shadow-[0_0_30px_rgba(255,16,240,0.4)]">
                        Reset Search
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
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Lowest Price Today</span>
                                    <span className="text-5xl font-black tracking-tighter italic text-emerald-400">
                                        $<span className="animate-pulse">{data?.stops?.find(s => s.bestOffer)?.bestOffer?.rates?.[0]?.totalAmount || '---'}</span>
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Travel Duration</span>
                                    <span className="text-5xl font-black tracking-tighter italic text-white">{data?.durationHours || '--'} <span className="text-lg not-italic opacity-40">HRS</span></span>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/80 italic">Live Rate Synchronization Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Route Map Panel */}
                        <div className="lg:col-span-2">
                            <RouteMap
                                stops={data?.stops || []}
                                is1AM={is1AM}
                                origin={origin}
                                destination={destination}
                                originCoords={data?.origin}
                                destCoords={data?.destination}
                            />
                        </div>
                    </section>

                    {/* Sleep Radar Strip (Fast Comparison) */}
                    <section className="space-y-8">

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#ff10f0] animate-ping" />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-300">Economic Radar</h2>
                            </div>
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded">Lowest Ahead</span>
                        </div>
                        <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x">
                            {data?.stops?.filter(s => s.status === 'OK').map((stop, i) => (
                                <RadarCard key={i} stop={stop} offer={stop.bestOffer} index={i} is1AM={is1AM} />
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
                                <h2 className="text-[11px] font-black uppercase text-gray-600 tracking-widest mb-1.5">Departure Point</h2>
                                <p className="text-xl font-black uppercase tracking-tight">{origin}</p>
                            </div>
                        </div>

                        {/* Tactical Stop Points */}
                        {data?.stops?.map((stop, i) => (
                            <RouteStopComponent
                                key={i}
                                index={i + 1}
                                stop={stop}
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
                                <h2 className="text-[11px] font-black uppercase text-gray-600 tracking-widest mb-1.5">Destination</h2>
                                <p className="text-xl font-black uppercase tracking-tight">{destination}</p>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            <SoftAuthSheet
                open={authSheetOpen}
                onClose={() => setAuthSheetOpen(false)}
                nextUrl={typeof window !== 'undefined' ? window.location.href : ''}
            />
        </main>
    );
}
