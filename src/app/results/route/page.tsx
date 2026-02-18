import RouteContentClient from "./RouteContentClient";
import { getOrSetGoSleepySessionId } from "@/lib/session";

export default async function RouteResultsPage({ searchParams }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const origin = String(params.origin ?? "");
    const destination = String(params.destination ?? "");
    const radius = Number(params.radius ?? 50);
    const bookingTime = String(params.bookingTime ?? "now");
    const duration = Number(params.duration ?? 1);

    const sessionId = await getOrSetGoSleepySessionId();

    return (
        <RouteContentClient
            origin={origin}
            destination={destination}
            radius={radius}
            bookingTime={bookingTime}
            duration={duration}
            sessionId={sessionId}
        />
    );
}
