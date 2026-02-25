import { Resend } from 'resend';
import { BookingConfirmationEmail } from '@/components/emails/BookingConfirmation';
import { SupportTicketEmail } from '@/components/emails/SupportTicket';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendBookingConfirmation({
  to,
  firstName,
  lastName,
  hotelName,
  checkIn,
  checkOut,
  confirmationNumber,
  totalAmount,
  currency
}: {
  to: string;
  firstName: string;
  lastName: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  confirmationNumber: string;
  totalAmount: number;
  currency: string;
}) {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY is missing. Mocking email send to:', to);
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Go Sleepy <bookings@gosleepy.xyz>',
      to: [to],
      subject: `Confirmed: Your Stay at ${hotelName}`,
      react: BookingConfirmationEmail({
        firstName,
        lastName,
        hotelName,
        checkIn,
        checkOut,
        confirmationNumber,
        totalAmount,
        currency
      })
    });

    if (error) {
      console.error('Failed to send booking confirmation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Resend Exception:', error);
    return { success: false, error };
  }
}

export async function sendSupportTicketConfirmation({
  to,
  ticketId,
  category,
  subject,
  message
}: {
  to: string;
  ticketId: string;
  category: string;
  subject: string;
  message: string;
}) {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY is missing. Mocking support email send to:', to);
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Go Sleepy Support <support@gosleepy.xyz>',
      to: [to],
      subject: `Support Ticket Received: #${ticketId}`,
      react: SupportTicketEmail({
        ticketId,
        category,
        subject,
        message
      })
    });

    if (error) {
      console.error('Failed to send support ticket email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Resend Support Exception:', error);
    return { success: false, error };
  }
}

