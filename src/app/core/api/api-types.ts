/** Request and response shapes of the Ease Disease API (contract: ease-disease-backend/api-flow.md). Money is integer paise. */

export interface ApiErrorBody {
  error: { code: string; message: string; details: Record<string, unknown>; requestId: string };
}
/** `details.fields` on VALIDATION_FAILED: API field name to message. */
export type FieldErrors = Record<string, string>;

export type AuthProvider = 'google.com' | 'emailLink';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  dob: string | null;
  authProvider: AuthProvider;
  lastAuthProvider: AuthProvider;
}
/** `profileComplete` is informational; it must not gate anything. */
export interface ProfileResponse {
  user: UserProfile;
  profileComplete: boolean;
}

export interface PackageItem {
  id: string;
  title: string;
  description: string[];
  pricePaise: number;
  /** The struck-through "was" price, when the package has one; absent or null otherwise. */
  originalPricePaise?: number | null;
  currency: 'INR';
  durationMinutes: number;
}

export interface CreateBookingRequest {
  packageId: string;
  /** 2-100 chars. */
  name: string;
  /** Must start with + and the country code, e.g. "+91 98765 43210". */
  whatsappNumber: string;
  /** Max 50 chars (PayU limit); lower-cased by the API. */
  email: string;
  /** Whole number 1-119, sent as a JSON number. */
  age: number;
  /** 2-100 chars. */
  city: string;
  /** Optional free text, max 50. Omit when empty, never send "". */
  gender?: string | null;
  /** Optional, max 1000. */
  notes?: string | null;
  /** Must be exactly true. */
  consent: true;
}

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'EXPIRED'
  | 'NEEDS_ATTENTION'
  | 'FAILED';
export type PaymentStatus = 'CREATED' | 'INITIATED' | 'SUCCESS' | 'FAILURE' | 'PENDING' | 'CANCELLED' | 'EXPIRED';

/** POST /v1/bookings answers `{ booking }`. */
export interface BookingCreated {
  reference: string;
  status: 'PENDING_PAYMENT';
  packageTitle: string;
  amountPaise: number;
  currency: 'INR';
  name: string;
  whatsappNumber: string;
  email: string;
  age: number;
  city: string;
  gender: string | null;
  canPay: boolean;
  payment: null;
  createdAt: string;
}

/** GET /v1/bookings/{reference} answers `{ booking }`. */
export interface BookingDetail extends Omit<BookingCreated, 'status' | 'payment'> {
  status: BookingStatus;
  notes: string | null;
  payment: { orderId: string; status: PaymentStatus; mode: string | null; paidAt: string | null } | null;
}

export interface BookingListItem {
  reference: string;
  status: BookingStatus;
  packageTitle: string;
  amountPaise: number;
  paymentStatus: PaymentStatus | null;
  canPay: boolean;
  createdAt: string;
}
/** `nextCursor` is opaque: pass it back as `cursor`, never build or edit one. */
export interface BookingList {
  items: BookingListItem[];
  nextCursor: string | null;
}

/** POST /v1/bookings/{reference}/checkout: the browser posts `fields` to `gatewayUrl`, exactly as given. */
export interface CheckoutForm {
  gatewayUrl: string;
  method: 'POST';
  fields: Record<string, string>;
}
