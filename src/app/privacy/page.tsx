import LegalLayout from "@/components/LegalLayout";

export default function PrivacyPage() {
    const content = `
Summary: We don't sell your data. Period.

1. Data Collection: We collect necessary information to facilitate your booking, including name, email, and phone number. This data is passed directly to the hotel supplier to secure your room.

2. Tracking: We use minimal tracking to improve search performance and detect 1 AM usage patterns to better serve the "Cyberrest" aesthetic.

3. Cookies: We use essential cookies to remember your search history and support your current session.

4. Third Parties: Information is shared only with our hotel suppliers (e.g., Amadeus) for the purpose of fulfilling your reservation.
  `;

    return <LegalLayout title="Privacy Policy" content={content} />;
}
