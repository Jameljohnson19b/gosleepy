import LegalLayout from "@/components/LegalLayout";

export default function TermsPage() {
    const content = `
Welcome to Go Sleepy. By using our service, you agree to these terms.

1. Service Scope: Go Sleepy is a hotel search and referral platform. We do not process payments or manage reservations directly. All transactions occur between you and the hotel property.

2. Bookings: All reservations made through Go Sleepy are "Pay at Property" unless explicitly stated otherwise. You are responsible for fulfilling the payment according to the hotel's individual policy.

3. Accuracy: While we strive for 100% accuracy, hotel inventory and pricing change rapidly. Go Sleepy is not liable for price discrepancies or overbookings at the property level.

4. User Conduct: You agree not to misuse our roadside search tools or automate requests to our API.
  `;

    return <LegalLayout title="Terms of Service" content={content} />;
}
