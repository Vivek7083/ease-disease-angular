/**
 * Every "Book now" style CTA opens the on-site booking form (see
 * BookingModalService and app-booking-form), which replaced the old Google Form.
 * The form is in demo mode for now: nothing is sent and the payment button only
 * shows a note, until email delivery (Web3Forms) and the payment link
 * (Razorpay) are set up.
 */

/** The one main offer every primary CTA points at - Level 1. */
export const MAIN_PLAN = {
  label: 'Book a consultation',
  duration: '30 min',
  price: '₹2499',
  originalPrice: '₹5000',
} as const;
