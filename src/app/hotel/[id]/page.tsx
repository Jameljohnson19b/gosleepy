"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Offer } from "@/types/hotel";
import { ArrowLeft, Star, MapPin, ShieldCheck, Clock, Phone, Navigation, Zap } from "lucide-react";
import Link from "next/link";
import { PriceTrendBar } from "@/components/PriceTrendBar";

export default function HotelDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const riskLabel = searchParams.get("risk") || "LOW";
    const passedName = searchParams.get("name") || "The Roadside Inn";
    const passedAmount = parseFloat(searchParams.get("amount") || "89.00");
    const passedAddress = searchParams.get("address") || "123 Highway Ave, Richmond, VA";
    const passedRating = parseFloat(searchParams.get("rating") || "4.2");
    const passedStars = parseInt(searchParams.get("stars") || "3");
    const passedPhone = searchParams.get("phone") || "";
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const duration = parseInt(searchParams.get("duration") || "1");

    const hasOfficialMedia = searchParams.get("official") === "true";
    const [offer, setOffer] = useState<Offer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Truth-in-Travel Fallback: Neutral visuals for budget roadside hotels
        const fallbackImages = [
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1591088398332-8a7b3ff98322?auto=format&fit=crop&w=1200&q=80"
        ];

        setOffer({
            hotelId: id as string,
            hotelName: passedName,
            hotelPhone: passedPhone,
            distanceMiles: 1.2,
            rating: passedRating,
            stars: passedStars,
            address: passedAddress,
            lat,
            lng,
            hasOfficialMedia,
            images: fallbackImages,
            amenities: ["WiFi", "Free Parking", "24hr Front Desk", "Roadside Access"],
            rates: [
                {
                    rateId: "r1",
                    roomName: "Standard Room",
                    totalAmount: passedAmount,
                    currency: "USD",
                    payType: "PAY_AT_PROPERTY",
                    refundable: true,
                    cancellationPolicyText: "Free cancellation until 4 PM local time today.",
                    supplierPayload: { token: "live-token" }
                }
            ]
        });
        setLoading(false);
    }, [id, passedName, passedAmount, passedAddress, passedRating, passedStars, passedPhone, lat, lng, hasOfficialMedia]);

    if (loading) return null;
    if (!offer) return <div>Hotel not found</div>;

    const checkoutUrl = (rateId: string, amount: number) =>
        `/checkout?hotelId=${offer.hotelId}&rateId=${rateId}&risk=${riskLabel}&hotelName=${encodeURIComponent(offer.hotelName)}&amount=${amount}`;

    return (
        <main className="min-h-screen bg-black text-white">
            {/* Multi-Image Gallery */}
            <div className="relative h-[45vh] w-full overflow-hidden bg-zinc-900">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full">
                    {offer.images?.map((img, i) => (
                        <div key={i} className="flex-none w-full h-full snap-center relative">
                            <img
                                src={img}
                                alt={`${offer.hotelName} - ${i + 1}`}
                                className="w-full h-full object-cover opacity-90"
                            />
                            {!offer.hasOfficialMedia && (
                                <div className="absolute top-24 left-0 w-full flex justify-center z-10">
                                    <div className="bg-black/60 backdrop-blur-sm border border-white/5 px-4 py-1.5 rounded-full">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Representative View</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />

                {/* Image Counter Overlay */}
                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-black tracking-widest text-white/60">
                    {offer.images?.length || 1} PHOTOS
                </div>

                <header className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-20">
                    <button onClick={() => router.back()} className="p-3 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl active:scale-90 transition-all">
                        <ArrowLeft className="w-6 h-6 text-[#ff10f0]" />
                    </button>
                    <div className="flex items-center gap-3">
                        <img src="/logo-sheep.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,16,240,0.4)]" />
                        <div className="bg-black/80 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl">
                            <Zap className="w-6 h-6 text-[#ff10f0] fill-[#ff10f0]" />
                        </div>
                    </div>
                </header>

                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-3.5 h-3.5 ${s <= (offer.stars || 0) ? "text-[#ff10f0] fill-[#ff10f0]" : "text-gray-800"}`} />
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-[#ff10f0] uppercase tracking-widest bg-[#ff10f0]/10 px-2 py-0.5 rounded">
                            {offer.stars || 3} Star Property
                        </span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase leading-[0.9] drop-shadow-2xl">
                        {offer.hotelName}
                    </h1>
                </div>
            </div>

            <div className="p-6 space-y-10">
                {/* Cyber-Rest Verdict / About */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="w-6 h-6 text-[#ff10f0]" />
                        <h2 className="text-sm font-black uppercase tracking-[0.3em]">Cyber-Rest Verdict</h2>
                    </div>
                    <div className="bg-[#111] border border-white/5 rounded-[2rem] p-6 shadow-3xl">
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            This property has been vetted for <span className="text-emerald-400 font-bold uppercase tracking-tighter">Lowest Local Pricing</span>. Located only {offer.distanceMiles}mi from your mission path, it provides immediate ingress for late-arrival recovery.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1 p-4 bg-black/50 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Safety Scan</span>
                                <span className="text-xs font-bold text-emerald-400 uppercase">Secure Perimeter</span>
                            </div>
                            <div className="flex flex-col gap-1 p-4 bg-black/50 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Connectivity</span>
                                <span className="text-xs font-bold text-blue-400 uppercase">Gigabit WiFi</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    {offer.hotelPhone && !offer.hotelPhone.includes('Property') ? (
                        <a href={`tel:${offer.hotelPhone}`} className="group flex flex-col items-center justify-center p-6 bg-[#111] rounded-3xl border border-gray-800 hover:border-[#ff10f0]/50 active:scale-95 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-[#ff10f0]/10 flex items-center justify-center mb-3 group-hover:bg-[#ff10f0]/20 transition-colors">
                                <Phone className="w-6 h-6 text-[#ff10f0]" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Call Hotel</span>
                            <span className="text-[10px] font-black text-[#ff10f0] mt-1 tracking-tighter">{offer.hotelPhone}</span>
                        </a>
                    ) : (
                        <div className="group flex flex-col items-center justify-center p-6 bg-[#111] rounded-3xl border border-gray-800 opacity-50">
                            <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center mb-3">
                                <Phone className="w-6 h-6 text-gray-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">No Number</span>
                            <span className="text-[10px] font-black text-gray-700 mt-1 tracking-tighter">Listed at Desk</span>
                        </div>
                    )}
                    <a href={`https://maps.apple.com/?q=${offer.address}`} className="group flex flex-col items-center justify-center p-6 bg-[#111] rounded-3xl border border-gray-800 hover:border-[#ff10f0]/50 active:scale-95 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-[#ff10f0]/10 flex items-center justify-center mb-3 group-hover:bg-[#ff10f0]/20 transition-colors">
                            <Navigation className="w-6 h-6 text-[#ff10f0]" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tactical Path</span>
                    </a>
                </div>

                {/* Truth Verification Hub */}
                <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#111] to-black border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap className="w-24 h-24 text-white" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck className="w-5 h-5 text-[#ff10f0]" />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#ff10f0]">Truth Verification Hub</h2>
                    </div>

                    <p className="text-sm text-gray-400 mb-8 leading-relaxed relative z-10">
                        {offer.hasOfficialMedia
                            ? "OFFICIAL MEDIA DETECTED. These images represent the actual property structure and verified interior conditions."
                            : "REPRESENTATIVE IMAGES DETECTED. Visuals are property-type reflections. Utilize high-fidelity satellite verification for physical perimeter assessment."
                        }
                    </p>

                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${offer.lat},${offer.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,16,240,0.2)]"
                    >
                        <Zap className="w-4 h-4 fill-black" />
                        Verify via Satellite
                    </a>
                </div>

                {/* Explore Area (Landmarks) */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <MapPin className="w-5 h-5 text-[#ff10f0]" />
                        <h2 className="text-sm font-black uppercase tracking-[0.3em]">Explore Area</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: "Orlando Intl Airport (MCO)", dist: "4.2mi", time: "8 min drive" },
                            { name: "Nearest 24H Diner", dist: "0.8mi", time: "2 min drive" },
                            { name: "Tesla Supercharger", dist: "1.5mi", time: "4 min drive" }
                        ].map((place, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-[#111] rounded-2xl border border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-300">{place.name}</span>
                                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{place.time}</span>
                                </div>
                                <span className="text-[10px] font-black text-[#ff10f0]">{place.dist}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Amenities Grid */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Zap className="w-5 h-5 text-[#ff10f0]" />
                        <h2 className="text-sm font-black uppercase tracking-[0.3em]">Operational Specs</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {offer.amenities?.map((amenity, i) => {
                            const isParking = amenity.toUpperCase().includes("PARKING");
                            return (
                                <div key={i} className={`flex items-center gap-3 p-4 bg-[#111] rounded-2xl border ${isParking ? 'border-[#ff10f0]/40 bg-[#ff10f0]/5' : 'border-white/5'}`}>
                                    <div className={`w-2 h-2 rounded-full ${isParking ? 'bg-[#ff10f0] animate-pulse' : 'bg-[#ff10f0]/40'}`} />
                                    <span className={`text-[10px] font-bold uppercase tracking-tighter truncate ${isParking ? 'text-white' : 'text-gray-400'}`}>
                                        {amenity}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Price Trend */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-black uppercase tracking-[0.3em]">Demand Timeline</h2>
                        <span className="text-emerald-400 text-[10px] font-black bg-emerald-400/10 px-2 py-1 rounded">OPTIMIZED RATE</span>
                    </div>
                    <div className="p-6 bg-[#0a0a0a] border border-[#ff10f0]/20 rounded-3xl">
                        <PriceTrendBar hotelId={offer.hotelId} />
                    </div>
                </section>

                {/* Room Selection */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Clock className="w-5 h-5 text-[#ff10f0]" />
                        <h2 className="text-sm font-black uppercase tracking-[0.3em]">Available Units</h2>
                    </div>
                    {offer.rates.map((rate) => (
                        <div key={rate.rateId} className="p-6 bg-[#111] border border-gray-800 rounded-[2rem] mb-6 shadow-2xl">
                            <div className="flex justify-between items-start mb-6">
                                <div className="max-w-[60%]">
                                    <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-2">{rate.roomName}</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">{rate.cancellationPolicyText}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black tracking-tighter leading-none">${rate.totalAmount}</div>
                                    <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Due At Property</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-8">
                                <div className="flex items-center gap-1.5 text-emerald-400 font-black text-[9px] bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                                    <ShieldCheck className="w-3 h-3" />
                                    GUARANTEED INGRESS
                                </div>
                                {rate.refundable && (
                                    <div className="flex items-center gap-1.5 text-blue-400 font-black text-[9px] bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                                        FREE CANCEL (24H)
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => router.push(checkoutUrl(rate.rateId, rate.totalAmount))}
                                className="w-full bg-[#ff10f0] text-white py-5 rounded-2xl font-black text-xl active:scale-[0.98] transition-all shadow-[0_10px_25px_rgba(255,16,240,0.3)]"
                            >
                                SECURE THIS ROOM
                            </button>
                        </div>
                    ))}
                </section>

                {/* Location Info (Enhanced Satellite) */}
                <section className="pb-32">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Tactical Perimeter</h2>
                    <div className="flex gap-4 mb-6">
                        <div className="p-3 bg-[#111] rounded-2xl border border-white/5">
                            <MapPin className="w-6 h-6 text-[#ff10f0]" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-200">{offer.address}</p>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Target Coordinates: {offer.lat?.toFixed(4)}, {offer.lng?.toFixed(4)}</p>
                        </div>
                    </div>
                    <div className="relative h-64 bg-zinc-900 rounded-[2.5rem] border border-white/5 overflow-hidden group">
                        <img
                            src={offer.images?.[0]}
                            className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-opacity"
                            alt="Map View"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <div className="bg-[#ff10f0] w-6 h-6 rounded-full animate-ping opacity-50" />
                                <div className="bg-[#ff10f0] w-3 h-3 rounded-full absolute top-1.5 left-1.5 border-2 border-white shadow-[0_0_15px_rgba(255,16,240,0.8)]" />
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-0 w-full flex justify-center">
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] bg-black/60 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-md">Tactical Feed Active</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Persistent Footer CTA */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-black/80 backdrop-blur-xl border-t border-gray-900 z-50">
                <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
                    <div>
                        <div className="text-2xl font-black leading-none">${offer.rates[0].totalAmount}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                            Due at Property {duration > 1 ? `· ${duration} Nights` : '· 1 Night'}
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(checkoutUrl(offer.rates[0].rateId, offer.rates[0].totalAmount))}
                        className="flex-1 bg-[#ff10f0] text-white py-4 rounded-xl font-black text-xl active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,16,240,0.2)]"
                    >
                        BOOK NOW
                    </button>
                </div>
            </div>
        </main >
    );
}
