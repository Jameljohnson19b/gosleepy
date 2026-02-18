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

    const [offer, setOffer] = useState<Offer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOffer() {
            await new Promise(r => setTimeout(r, 500));
            setOffer({
                hotelId: id as string,
                hotelName: passedName,
                distanceMiles: 1.2,
                rating: 4.2,
                stars: 3,
                address: "123 Highway Ave, Richmond, VA 23219",
                images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"],
                amenities: ["WiFi", "Free Parking", "24hr Front Desk", "Coffee in Lobby"],
                rates: [
                    {
                        rateId: "r1",
                        roomName: "Queen Bed Non-Smoking",
                        totalAmount: passedAmount,
                        currency: "USD",
                        payType: "PAY_AT_PROPERTY",
                        refundable: true,
                        cancellationPolicyText: "Free cancellation until 4 PM local time today.",
                        supplierPayload: { token: "mock-token-1" }
                    }
                ]
            });
            setLoading(false);
        }
        fetchOffer();
    }, [id, passedName, passedAmount]);

    if (loading) return null;
    if (!offer) return <div>Hotel not found</div>;

    const checkoutUrl = (rateId: string, amount: number) =>
        `/checkout?hotelId=${offer.hotelId}&rateId=${rateId}&risk=${riskLabel}&hotelName=${encodeURIComponent(offer.hotelName)}&amount=${amount}`;

    return (
        <main className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="relative h-[40vh] w-full">
                <img
                    src={offer.images?.[0]}
                    alt={offer.hotelName}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />

                <header className="absolute top-0 left-0 w-full p-4 flex items-center justify-between">
                    <button onClick={() => router.back()} className="p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                        <ArrowLeft className="w-8 h-8" />
                    </button>
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-lg" />
                    {riskLabel === 'HIGH' ? (
                        <div className="bg-[#ff10f0] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-white" />
                            High Demand
                        </div>
                    ) : <div className="w-12 h-12" />}
                </header>

                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-[#ff10f0] fill-[#ff10f0]" />
                        <span className="text-sm font-bold">{offer.rating} · {offer.stars} Stars</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                        {offer.hotelName}
                    </h1>
                </div>
            </div>

            <div className="p-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <a href={`tel:5550123`} className="flex flex-col items-center justify-center p-4 bg-[#111] rounded-2xl border border-gray-800 active:scale-95 transition-all">
                        <Phone className="w-6 h-6 text-[#ff10f0] mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Call Hotel</span>
                    </a>
                    <a href={`https://maps.apple.com/?q=${offer.address}`} className="flex flex-col items-center justify-center p-4 bg-[#111] rounded-2xl border border-gray-800 active:scale-95 transition-all">
                        <Navigation className="w-6 h-6 text-[#ff10f0] mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Navigate</span>
                    </a>
                </div>

                {/* Price Trend */}
                <section className="mb-8 p-5 bg-[#0a0a0a] border border-[#ff10f0]/20 rounded-3xl">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Price Timeline</h2>
                        <span className="text-emerald-400 text-[10px] font-black bg-emerald-400/10 px-2 py-1 rounded">LOWEST SEEN TODAY</span>
                    </div>
                    <PriceTrendBar hotelId={offer.hotelId} />
                </section>

                {/* Room Selection */}
                <section className="mb-8">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Select Room</h2>
                    {offer.rates.map((rate) => (
                        <div key={rate.rateId} className="p-5 bg-[#111] border border-gray-800 rounded-3xl mb-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold leading-tight">{rate.roomName}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{rate.cancellationPolicyText}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black">${rate.totalAmount}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Total</div>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-6">
                                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] bg-emerald-400/10 px-2 py-1 rounded-lg">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    PAY AT PROPERTY
                                </div>
                                {rate.refundable && (
                                    <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[10px] bg-blue-400/10 px-2 py-1 rounded-lg">
                                        FREE CANCEL
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => router.push(checkoutUrl(rate.rateId, rate.totalAmount))}
                                className="w-full bg-[#ff10f0] text-white py-4 rounded-xl font-black text-xl active:scale-[0.98] transition-all"
                            >
                                SELECT ROOM
                            </button>
                        </div>
                    ))}
                </section>

                {/* Location Info */}
                <section className="pb-20">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Location</h2>
                    <div className="flex gap-3 mb-4">
                        <MapPin className="w-5 h-5 text-[#ff10f0] shrink-0" />
                        <p className="text-sm font-medium text-gray-300">{offer.address}</p>
                    </div>
                    <div className="h-48 bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center text-gray-600 font-bold uppercase tracking-widest text-xs">
                        Map View Placeholder
                    </div>
                </section>
            </div>

            {/* Persistent Footer CTA */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-black/80 backdrop-blur-xl border-t border-gray-900 z-50">
                <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
                    <div>
                        <div className="text-2xl font-black leading-none">${offer.rates[0].totalAmount}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Due at Property</div>
                    </div>
                    <button
                        onClick={() => router.push(checkoutUrl(offer.rates[0].rateId, offer.rates[0].totalAmount))}
                        className="flex-1 bg-[#ff10f0] text-white py-4 rounded-xl font-black text-xl active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,16,240,0.2)]"
                    >
                        BOOK NOW
                    </button>
                </div>
            </div>
        </main>
    );
}
