/**
 * Every "Book now" style CTA opens the on-site booking form (see
 * BookingModalService and app-booking-form). Payment goes through PayU via the
 * Ease Disease API.
 */

/** What the CTAs show about the main offer. */
export interface Plan {
  readonly label: string;
  readonly duration: string;
  readonly price: string;
  readonly originalPrice: string;
}

/**
 * The main offer every primary CTA points at - Level 1. This is the copy shown
 * until PackagesService has the real package from the API (and when the API
 * cannot be reached), so the page never renders without a price. The struck-
 * through original price is a marketing figure that is not in the API.
 */
export const MAIN_PLAN: Plan = {
  label: 'Book a consultation',
  duration: '30 min',
  price: '₹2499',
  originalPrice: '₹5000',
};
