import RouteContentClient from "./RouteContentClient";

export default function RouteResultsPage({ searchParams }: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const origin = String(searchParams.origin ?? "");
    const destination = String(searchParams.destination ?? "");
    const radius = Number(searchParams.radius ?? 50);
    const bookingTime = String(searchParams.bookingTime ?? "now");
    const duration = Number(searchParams.duration ?? 1);

    return (
        <RouteContentClient
            origin={origin}
            destination={destination}
            radius={radius}
            bookingTime={bookingTime}
            duration={duration}
        />
    );
}
