"use client";

import { Offer } from "@/types/hotel";
import { Star, MapPin, TrendingDown, Clock, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { PriceTrendBar } from "./PriceTrendBar";

interface HotelCardProps {
    offer: Offer;
}

export function HotelCard({ offer }: HotelCardProps) {
    const lowestRate = offer.rates[0];

    return (
        <Link
            href={`/hotel/${offer.hotelId}?risk=${offer.supportRisk?.label || 'LOW'}&name=${encodeURIComponent(offer.hotelName)}&amount=${lowestRate.totalAmount}`}
            className="block group bg-[#111] border border-gray-800 rounded-3xl overflow-hidden active:scale-[0.98] transition-all"
        >
            <div className="relative h-48 w-full border-b border-gray-800">
                <img
                    src={offer.images?.[0] || "/hotel-placeholder.jpg"}
                    alt={offer.hotelName}
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all opacity-80"
                />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                    <MapPin className="w-3.5 h-3.5 text-[#ff10f0]" />
                    <span className="text-xs font-bold text-white">{offer.distanceMiles}mi</span>
                </div>

                {offer.rating && (
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                        <Star className="w-3.5 h-3.5 text-[#ff10f0] fill-[#ff10f0]" />
                        <span className="text-xs font-bold text-white">{offer.rating}</span>
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-black tracking-tight leading-tight max-w-[70%]">
                        {offer.hotelName.toUpperCase()}
                    </h3>
                    <div className="text-right">
                        <div className="text-2xl font-black text-white leading-none">
                            ${lowestRate.totalAmount}
                        </div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                            Total Tonight
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs bg-emerald-400/10 px-2 py-1 rounded-lg">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        PAY AT PROPERTY
                    </div>
                    {offer.supportRisk?.label === 'HIGH' ? (
                        <div className="flex items-center gap-1.5 text-[#ff10f0] font-bold text-xs bg-[#ff10f0]/10 px-2 py-1 rounded-lg animate-pulse">
                            <Zap className="w-3.5 h-3.5" />
                            {offer.supportRisk.reasonCodes[0].replace(/_/g, ' ')}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs bg-blue-400/10 px-2 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5" />
                            24H DESK
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-900">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-4 h-4 text-[#ff10f0]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Price Trend (Last 24h)
                        </span>
                    </div>
                    <PriceTrendBar hotelId={offer.hotelId} />
                    <div className="mt-2 text-[10px] text-[#ff10f0]/60 font-medium italic">
                        Lowest price seen today: ${lowestRate.totalAmount - 5}
                    </div>
                </div>
            </div>
        </Link>
    );
}
