/**
 * Phase 1 booking: every "Book now" style CTA opens this Google Form in a new
 * tab. Google Form link supplied by the founders.
 */
export const BOOKING_FORM_URL = 'https://forms.gle/17RboZ41sxWPk9cn7';

/** The one main offer every primary CTA points at - Level 1. */
export const MAIN_PLAN = {
  label: 'Book a consultation',
  duration: '30 min',
  price: '₹2499',
  originalPrice: '₹5000',
} as const;

export function openBookingForm(): void {
  window.open(BOOKING_FORM_URL, '_blank', 'noopener,noreferrer');
}
