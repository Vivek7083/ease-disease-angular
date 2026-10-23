import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { apiErrorInterceptor } from '../api/api-error.interceptor';
import type { PackageItem } from '../api/api-types';
import { MAIN_PLAN } from '../config/booking';
import { PackagesService, formatRupees } from './packages';

const consult = (over: Partial<PackageItem> = {}): PackageItem => ({
  id: '11111111-1111-4111-8111-111111111111',
  title: 'One-Time Consult',
  description: ['3-week plan.'],
  pricePaise: 299900,
  currency: 'INR',
  durationMinutes: 45,
  ...over,
});

describe('formatRupees', () => {
  it('shows whole rupees without decimals', () => {
    expect(formatRupees(249900)).toBe('₹2499');
  });

  it('keeps paise when there are any', () => {
    expect(formatRupees(249950)).toBe('₹2499.50');
  });
});

describe('PackagesService', () => {
  let service: PackagesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiErrorInterceptor])), provideHttpClientTesting()],
    });
    service = TestBed.inject(PackagesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('shows the fallback copy and the environment package id before anything loads', () => {
    expect(service.plan()).toEqual(MAIN_PLAN);
    expect(service.packageId()).toBe(environment.launchPackageId);
  });

  it('shows the API price and duration once the package loads, keeping the marketing original price', () => {
    service.load();
    http.expectOne('/v1/packages').flush({ packages: [consult()] });
    expect(service.plan().price).toBe('₹2999');
    expect(service.plan().duration).toBe('45 min');
    expect(service.plan().originalPrice).toBe(MAIN_PLAN.originalPrice);
    expect(service.durationWords()).toBe('45 minutes');
    expect(service.packageId()).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('keeps the fallback when the endpoint is missing or fails', () => {
    service.load();
    http.expectOne('/v1/packages').flush(
      { error: { code: 'INTERNAL', message: 'Cannot GET /v1/packages', details: {}, requestId: 'r' } },
      { status: 404, statusText: 'Not Found' },
    );
    expect(service.mainPackage()).toBeNull();
    expect(service.plan()).toEqual(MAIN_PLAN);
  });

  it('keeps the fallback when the list has no INR package', () => {
    service.load();
    http.expectOne('/v1/packages').flush({ packages: [] });
    expect(service.plan()).toEqual(MAIN_PLAN);
  });

  it('asks the API only once however many times load() is called', () => {
    service.load();
    service.load();
    http.expectOne('/v1/packages').flush({ packages: [consult()] });
  });
});
