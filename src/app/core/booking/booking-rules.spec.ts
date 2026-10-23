import {
  ageProblem,
  buildCreateBookingRequest,
  emailProblem,
  normalisePhone,
  textProblem,
  type BookingFormValue,
} from './booking-rules';

const valid: BookingFormValue = {
  name: '  Priya   Sharma ',
  phone: '+91 98765 43210',
  email: '  Priya@Example.COM ',
  age: 34,
  city: ' Pune ',
  gender: '',
  consent: true,
};

describe('normalisePhone', () => {
  it('accepts a number with its country code, ignoring spaces, dashes, dots and brackets', () => {
    expect(normalisePhone('+91 98765 43210')).toBe('+919876543210');
    expect(normalisePhone('+44 (7911) 123-456')).toBe('+447911123456');
  });

  it('gives a bare 10-digit Indian mobile number its +91', () => {
    expect(normalisePhone('98765 43210')).toBe('+919876543210');
  });

  it('refuses what the API would refuse', () => {
    for (const bad of ['', '+91 ', '+91 12345', '919876543210', '+0 1234567890', '+1234567', '+1234567890123456', 'abc', '5876543210']) {
      expect(normalisePhone(bad)).toBeNull();
    }
  });
});

describe('emailProblem', () => {
  it('accepts an ordinary address, whatever its case or surrounding spaces', () => {
    expect(emailProblem('  Priya@Example.COM ')).toBeNull();
  });

  it('refuses malformed addresses and non-ASCII ones (PayU pattern)', () => {
    for (const bad of ['', 'priya', 'priya@', 'priya@example', 'pri ya@example.com', 'priyá@example.com']) {
      expect(emailProblem(bad)).toBe('invalid');
    }
  });

  it('refuses more than 50 characters (PayU limit)', () => {
    expect(emailProblem(`${'a'.repeat(40)}@example.com`)).toBe('too-long');
    expect(emailProblem(`${'a'.repeat(38)}@example.com`)).toBeNull();
  });
});

describe('textProblem', () => {
  it('trims before counting', () => {
    expect(textProblem('  A  ', 'Name', 2, 100)).toContain('at least 2');
    expect(textProblem(' Al ', 'Name', 2, 100)).toBeNull();
  });

  it('refuses over-long and control characters', () => {
    expect(textProblem('x'.repeat(101), 'City', 2, 100)).toContain('at most 100');
    expect(textProblem('Pu\u0000ne', 'City', 2, 100)).toContain('not allowed');
  });

  it('counts characters the way the database does (an emoji is one)', () => {
    expect(textProblem('\u{1F600}\u{1F600}', 'Name', 2, 2)).toBeNull();
  });
});

describe('ageProblem', () => {
  it('accepts whole numbers 1 to 119', () => {
    expect(ageProblem(1)).toBeNull();
    expect(ageProblem(119)).toBeNull();
  });

  it('refuses empty, 0, 120, and fractions', () => {
    for (const bad of [null, 0, 120, -3, 34.5]) {
      expect(ageProblem(bad)).toContain('1 to 119');
    }
  });
});

describe('buildCreateBookingRequest', () => {
  it('builds the API body: trimmed, E.164 phone, lower-case email, age as a number, consent true', () => {
    expect(buildCreateBookingRequest(valid, 'pkg-1')).toEqual({
      packageId: 'pkg-1',
      name: 'Priya   Sharma',
      whatsappNumber: '+919876543210',
      email: 'priya@example.com',
      age: 34,
      city: 'Pune',
      consent: true,
    });
  });

  it('leaves gender out when none is chosen, and sends it when one is', () => {
    expect('gender' in buildCreateBookingRequest(valid, 'p')).toBe(false);
    expect(buildCreateBookingRequest({ ...valid, gender: 'Female' }, 'p').gender).toBe('Female');
  });

  it('never carries a price or notes', () => {
    const keys = Object.keys(buildCreateBookingRequest({ ...valid, gender: 'Other' }, 'p'));
    expect(keys.sort()).toEqual(['age', 'city', 'consent', 'email', 'gender', 'name', 'packageId', 'whatsappNumber']);
  });
});
