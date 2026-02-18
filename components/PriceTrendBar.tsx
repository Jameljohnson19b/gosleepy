"use client";

interface PriceTrendBarProps {
    hotelId: string;
}

export function PriceTrendBar({ hotelId }: PriceTrendBarProps) {
    // Mock trend data based on hotelId
    const getMockData = () => {
        const hours = ["12PM", "3PM", "6PM", "9PM", "11PM", "Now"];
        const baseValue = 40;
        return hours.map((h, i) => ({
            hour: h,
            height: baseValue + Math.random() * 50
        }));
    };

    const data = getMockData();

    return (
        <div className="flex items-end justify-between gap-1.5 h-12 w-full px-1">
            {data.map((point, i) => (
                <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1 group"
                >
                    <div
                        className={`w-full rounded-t-sm transition-all duration-500 ${i === data.length - 1
                                ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                : "bg-gray-800"
                            }`}
                        style={{ height: `${point.height}%` }}
                    />
                </div>
            ))}
        </div>
    );
}
