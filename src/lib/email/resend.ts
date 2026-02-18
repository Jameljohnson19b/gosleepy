import { Resend } from 'resend';
import { Booking } from '@/types/hotel';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(booking: Booking) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('Resend API Key missing. Skipping email.');
        return;
    }

    try {
        await resend.emails.send({
            from: 'Go Sleepy <stay@gosleepy.xyz>',
            to: booking.email,
            subject: `Room Secured: ${booking.hotelName}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; background: #000; color: #fff; padding: 20px;">
          <h1 style="color: #ffd700; text-transform: uppercase;">Room Secured</h1>
          <p>Your reservation at <strong>${booking.hotelName}</strong> is confirmed.</p>
          <div style="background: #111; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Confirmation #:</strong> ${booking.supplierBookingId}</p>
            <p><strong>Check-in:</strong> ${booking.checkIn}</p>
            <p><strong>Total Due at Property:</strong> ${booking.totalAmount} ${booking.currency}</p>
          </div>
          <p style="color: #ffd700; font-weight: bold;">PAY AT PROPERTY - NO CARD CHARGED TODAY</p>
          <hr style="border-color: #333;" />
          <p style="font-size: 12px; color: #666;">Go Sleepy - Helping you find rest, fast.</p>
        </div>
      `
        });
    } catch (error) {
        console.error('Failed to send confirmation email:', error);
    }
}
