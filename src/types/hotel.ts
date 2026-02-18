export type BookingStatus =
  | 'DRAFT'
  | 'PENDING_SUPPLIER'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCEL_REQUESTED'
  | 'CANCELED';

export type PayType = 'PAY_AT_PROPERTY';

export interface Rate {
  rateId: string;
  roomName: string;
  totalAmount: number;
  currency: string;
  payType: PayType;
  refundable: boolean;
  cancellationPolicyText: string;
  supplierPayload: any; // Opaque token needed to book
}

export interface Offer {
  hotelId: string;
  hotelName: string;
  hotelPhone?: string;
  distanceMiles: number;
  rating?: number;
  stars?: number;
  address?: string;
  lat?: number;
  lng?: number;
  images?: string[];
  amenities?: string[];
  rates: Rate[];
  supportRisk?: {
    riskScore: number;
    label: 'LOW' | 'MEDIUM' | 'HIGH';
    reasonCodes: string[];
  };
}

export interface Booking {
  id: string;
  userId?: string;
  status: BookingStatus;
  payType: PayType;

  // Supplier Refs
  supplier: string;
  supplierBookingId?: string;
  supplierHotelId: string;

  // Hotel Details
  hotelName: string;
  hotelPhone?: string;
  hotelAddress?: string;

  // Guest Info
  guestFirstName: string;
  guestLastName: string;
  email: string;
  phone?: string;

  // Stay Info
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  guests: number;

  // Financial Info
  totalAmount: number;
  currency: string;

  // Persistent Data
  rateId: string;
  ratePayload: any;
  cancellationPolicyJson?: any;

  createdAt: string;
  updatedAt: string;
}
