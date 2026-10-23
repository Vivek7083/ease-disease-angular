import type { CreateBookingRequest } from '../api/api-types';

/**
 * The booking form's rules, mirrored from the API (ease-disease-backend: bookings/create-booking.ts, whatsapp-number.ts,
 * payments/payu/payu-checkout-fields.ts). The API is the authority and re-checks everything; these only let the form
 * say what is wrong before anything is sent.
 */
export const NAME_MIN = 2;
export const NAME_MAX = 100;
export const CITY_MIN = 2;
export const CITY_MAX = 100;
export const GENDER_MAX = 50;
export const AGE_MIN = 1;
export const AGE_MAX = 119;
/** PayU's limit: the email is part of the payment hash. */
export const EMAIL_MAX = 50;

/** E.164: `+`, then 8 to 15 digits, the first not 0. */
const E164 = /^\+[1-9][0-9]{7,14}$/;
/** Punctuation people type between the parts of a number. */
const SEPARATORS = /[\s\-.()]/g;
/** A 10-digit Indian mobile number typed without its country code. */
const INDIAN_MOBILE = /^[6-9][0-9]{9}$/;
/** The same pattern PayU accepts (the API uses it too). */
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const CONTROL = /\p{Cc}/u;

/** Characters (code points), the way the database counts them. */
export const length = (text: string): number => Array.from(text).length;
/** Trimmed and Unicode-normalised, like the API does before it checks anything. */
export const clean = (text: string): string => text.normalize('NFC').trim();

/**
 * The WhatsApp number as E.164 (`+919876543210`), or null when it is not one. The API never guesses a country; the
 * form is allowed one convenience: a bare 10-digit Indian mobile number gets `+91`.
 */
export function normalisePhone(raw: string): string | null {
  const compact = raw.replace(SEPARATORS, '');
  if (INDIAN_MOBILE.test(compact)) {
    return `+91${compact}`;
  }
  return E164.test(compact) ? compact : null;
}

export type EmailProblem = 'invalid' | 'too-long' | null;

export function emailProblem(raw: string): EmailProblem {
  const email = clean(raw).toLowerCase();
  if (email.length > EMAIL_MAX) {
    return 'too-long';
  }
  return EMAIL_PATTERN.test(email) ? null : 'invalid';
}

/** A message when `raw` is not a valid name or city of the given size, else null. */
export function textProblem(raw: string, label: string, min: number, max: number): string | null {
  const value = clean(raw);
  if (CONTROL.test(value)) {
    return `${label} contains characters that are not allowed.`;
  }
  if (length(value) < min) {
    return `Please enter your ${label.toLowerCase()} (at least ${min} characters).`;
  }
  return length(value) > max ? `${label} can be at most ${max} characters.` : null;
}

export function ageProblem(age: number | null): string | null {
  return age !== null && Number.isInteger(age) && age >= AGE_MIN && age <= AGE_MAX
    ? null
    : `Enter your age in years (${AGE_MIN} to ${AGE_MAX}).`;
}

/** What the form holds. `age` is a number (or null while empty); `gender` is a chip's text or ''. */
export interface BookingFormValue {
  name: string;
  phone: string;
  email: string;
  age: number | null;
  city: string;
  gender: string;
  consent: boolean;
}

/**
 * The request body for POST /v1/bookings. Call only with a form that passed its rules. The price is never part of it:
 * the server takes it from the package.
 */
export function buildCreateBookingRequest(value: BookingFormValue, packageId: string): CreateBookingRequest {
  const gender = clean(value.gender);
  return {
    packageId,
    name: clean(value.name),
    whatsappNumber: normalisePhone(value.phone) ?? clean(value.phone),
    email: clean(value.email).toLowerCase(),
    age: value.age as number,
    city: clean(value.city),
    // An empty gender is left out, never sent as "".
    ...(gender ? { gender } : {}),
    consent: true,
  };
}

/** The booking form's field names mapped to the API's, for putting a server complaint under the right control. */
export const API_FIELD_TO_FORM_FIELD: Readonly<Record<string, keyof BookingFormValue>> = {
  name: 'name',
  whatsappNumber: 'phone',
  email: 'email',
  age: 'age',
  city: 'city',
  gender: 'gender',
  consent: 'consent',
};
