"use client";

import { Offer } from "@/types/hotel";
import { Star, MapPin, TrendingDown, Clock, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { PriceTrendBar } from "./PriceTrendBar";

interface HotelCardProps {
    offer: Offer;
    duration?: number;
}

export function HotelCard({ offer, duration = 1 }: HotelCardProps) {
    const lowestRate = offer.rates[0];

    return (
        <Link
            href={`/hotel/${offer.hotelId}?risk=${offer.supportRisk?.label || 'LOW'}&name=${encodeURIComponent(offer.hotelName)}&amount=${lowestRate.totalAmount}&address=${encodeURIComponent(offer.address || '')}&rating=${offer.rating || ''}&stars=${offer.stars || ''}&phone=${encodeURIComponent(offer.hotelPhone || '')}&lat=${offer.lat}&lng=${offer.lng}&official=${offer.hasOfficialMedia}&duration=${duration}`}
            className="block group bg-[#111] border border-gray-800 rounded-2xl lg:rounded-3xl overflow-hidden active:scale-[0.98] transition-all"
        >
            <div className="relative h-28 lg:h-40 w-full border-b border-gray-800">
                <img
                    src={offer.images?.[0] || "/hotel-placeholder.jpg"}
                    alt={offer.hotelName}
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all opacity-80"
                />

                {!offer.hasOfficialMedia && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="bg-black/80 border border-white/5 px-3 py-1.5 rounded-full">
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Representative View</span>
                        </div>
                    </div>
                )}

                <div className="absolute top-2 left-2 flex flex-col gap-2">
                    <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 border border-white/10">
                        <MapPin className="w-3 h-3 text-[#ff10f0]" />
                        <span className="text-[10px] font-bold text-white">{offer.distanceMiles}mi</span>
                    </div>

                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${offer.lat},${offer.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#ff10f0] shadow-[0_0_10px_rgba(255,16,240,0.4)] p-1.5 rounded-full flex items-center justify-center hover:scale-110 transition-transform border border-white/20"
                        title="Verify actual building via Satellite"
                    >
                        <Zap className="w-3.5 h-3.5 text-white fill-white" />
                    </a>
                </div>

                {offer.rating && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 border border-white/10">
                        <Star className="w-3 h-3 text-[#ff10f0] fill-[#ff10f0]" />
                        <span className="text-[10px] font-bold text-white">{offer.rating}</span>
                    </div>
                )}
            </div>

            <div className="p-3 lg:p-4">
                <div className="flex justify-between items-start mb-1 h-10 overflow-hidden">
                    <h3 className="text-sm lg:text-base font-black tracking-tight leading-tight">
                        {offer.hotelName.toUpperCase()}
                    </h3>
                </div>

                <div className="flex items-end justify-between mt-2">
                    <div className="flex flex-col">
                        <div className="text-lg lg:text-xl font-black text-white leading-none">
                            ${lowestRate.totalAmount}
                        </div>
                        <div className="text-[8px] text-gray-500 font-bold uppercase">
                            Total ({duration} {duration === 1 ? 'night' : 'nights'})
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                    <div className="flex items-center gap-1 text-emerald-400 font-bold text-[9px] bg-emerald-400/10 px-1.5 py-0.5 rounded">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        PAY AT PROPERTY
                    </div>
                    {offer.supportRisk?.label === 'HIGH' ? (
                        <div className="flex items-center gap-1 text-[#ff10f0] font-bold text-[9px] bg-[#ff10f0]/10 px-1.5 py-0.5 rounded animate-pulse">
                            <Zap className="w-2.5 h-2.5" />
                            RISK
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-blue-400 font-bold text-[9px] bg-blue-400/10 px-1.5 py-0.5 rounded">
                            <Clock className="w-2.5 h-2.5" />
                            24H DESK
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-900">
                    <PriceTrendBar hotelId={offer.hotelId} />
                    <div className="mt-2 text-[8px] text-[#ff10f0]/60 font-black uppercase tracking-tighter italic">
                        Price Trend (24H)
                    </div>
                </div>
            </div>
        </Link>
    );
}
