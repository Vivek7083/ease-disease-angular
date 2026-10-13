import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal';
import { EyebrowLabel } from '../../shared/components/eyebrow-label/eyebrow-label';
import { SiteFooter } from '../../shared/components/site-footer/site-footer';

interface PastEvent {
  readonly title: string;
  /** Shown big on the ticket stub; a range like "16–17" for multi-day events. */
  readonly day: string;
  readonly month: string;
  readonly year: string;
  /** ISO date of the first day, for the <time> element. */
  readonly iso: string;
  readonly time: string;
  readonly venue: string;
  readonly image: string;
  readonly imageAlt: string;
  /** Posters are shown whole; photos fill the frame. */
  readonly fit: 'contain' | 'cover';
}

/**
 * Routed at /events. Upcoming events are empty for now (the brewing state
 * below); past events are a plain display — a gallery per event can replace
 * these cards later. Event details come from deeparajani.com/events.
 */
@Component({
  selector: 'app-events',
  imports: [NgOptimizedImage, ScrollRevealDirective, EyebrowLabel, SiteFooter],
  templateUrl: './events.html',
  styleUrl: './events.scss',
})
export class Events {
  protected readonly pastEvents: readonly PastEvent[] = [
    {
      title: 'Digest with E.A.S.E. – The Gut Health Revolution with Barbara O’Neill',
      day: '29',
      month: 'May',
      year: '2026',
      iso: '2026-05-29',
      time: '2:00 PM – 7:30 PM',
      venue: 'Yashwantrao Chavan Centre, Nariman Point, Mumbai 400021',
      image: 'images/events/digest-with-ease.jpeg',
      imageAlt:
        'Poster for Digest with E.A.S.E., The Gut Health Revolution with Barbara O’Neill, on 29 May 2026 at Yashwantrao Chavan Centre, Nariman Point, Mumbai.',
      fit: 'contain',
    },
    {
      title: 'Barbara O’Neill, first time in Mumbai!',
      day: '16–17',
      month: 'May',
      year: '2025',
      iso: '2025-05-16',
      time: '3:00 PM – 7:00 PM, both days',
      venue: 'Bal Gandharva Rang Mandir, Mumbai',
      image: 'images/events/barbara-oneill-mumbai.jpg',
      imageAlt: 'Barbara O’Neill speaking on stage in Mumbai, one hand raised, wearing a maroon kurta and a pink scarf.',
      fit: 'cover',
    },
  ];
}
