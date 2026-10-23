import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, vi } from 'vitest';
import { Countdown } from './countdown';

describe('Countdown', () => {
  let countdown: Countdown;

  beforeEach(() => {
    vi.useFakeTimers();
    countdown = runInInjectionContext(TestBed.inject(Injector), () => new Countdown());
  });

  afterEach(() => vi.useRealTimers());

  it('is idle (0) until started', () => {
    expect(countdown.seconds()).toBe(0);
  });

  it('counts down once a second and stops at 0', async () => {
    countdown.start(3);
    expect(countdown.seconds()).toBe(3);
    await vi.advanceTimersByTimeAsync(1000);
    expect(countdown.seconds()).toBe(2);
    await vi.advanceTimersByTimeAsync(2000);
    expect(countdown.seconds()).toBe(0);
    await vi.advanceTimersByTimeAsync(5000);
    expect(countdown.seconds()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('restarting replaces the old countdown instead of running two', async () => {
    countdown.start(10);
    await vi.advanceTimersByTimeAsync(4000);
    countdown.start(2);
    expect(countdown.seconds()).toBe(2);
    await vi.advanceTimersByTimeAsync(2000);
    expect(countdown.seconds()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('rounds a fractional wait up, and ignores a zero or negative one', () => {
    countdown.start(1.2);
    expect(countdown.seconds()).toBe(2);
    countdown.start(0);
    expect(countdown.seconds()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    countdown.start(-5);
    expect(countdown.seconds()).toBe(0);
  });

  it('stop() cancels it', async () => {
    countdown.start(5);
    countdown.stop();
    await vi.advanceTimersByTimeAsync(3000);
    expect(countdown.seconds()).toBe(5);
    expect(vi.getTimerCount()).toBe(0);
  });
});
