import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';
import { EyebrowLabel } from '../../../shared/components/eyebrow-label/eyebrow-label';
import { CtaPill } from '../../../shared/components/cta-pill/cta-pill';
import { SiteFooter } from '../../../shared/components/site-footer/site-footer';
import { SocialLinks, type SocialLink } from '../../../shared/components/social-links/social-links';
import { openBookingForm } from '../../../core/config/booking';

interface Book {
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly status: string;
  readonly cover: string;
  readonly buyUrl: string;
}

interface Programme {
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
}

interface Collaborator {
  readonly name: string;
  readonly detail: string;
}

interface Testimonial {
  readonly quote: string;
  readonly name: string;
}

/**
 * Routed at /founders/deepa - intentionally a different shape from Carol's
 * page (carol-profile.ts, a LinkedIn-style resume). Deepa's public footprint
 * is book + programme + community led, so this page is built around those
 * instead of a timeline.
 */
@Component({
  selector: 'app-deepa-profile',
  imports: [RouterLink, NgOptimizedImage, ScrollRevealDirective, EyebrowLabel, CtaPill, SiteFooter, SocialLinks],
  templateUrl: './deepa-profile.html',
  styleUrl: './deepa-profile.scss',
})
export class DeepaProfile {
  protected readonly headline = 'IFM (USA) certified Health Coach & Functional Nutritionist · Founder, Awaken Your Soul';
  protected readonly location = 'Mumbai, Maharashtra, India';

  protected readonly socials: readonly SocialLink[] = [
    { platform: 'linkedin', url: 'https://www.linkedin.com/in/deepa-rajani/' },
    { platform: 'instagram', url: 'https://www.instagram.com/ays.awakenyoursoul/' },
    { platform: 'facebook', url: 'https://www.facebook.com/celiacmanagementby.deeparajani/' },
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UCdkqiWAyyxf2xqtM8VSu0lg/videos' },
  ];

  protected readonly about =
    'Deepa works with people whose gut issues and inner states feed each other - she doesn’t just treat the symptom, she helps ' +
    'reprogram how someone thinks, feels, digests and heals. That whole-person lens comes from her own path: years of yoga ' +
    'and functional nutrition work later, she built Awaken Your Soul to put gut health and mindset coaching under one roof.';

  protected readonly book: Book = {
    title: 'The Magic In You',
    subtitle: 'Awaken Your Soul',
    description:
      'A guide to connecting with a higher consciousness - understanding that the gift of intelligence is what lets us make ' +
      'better choices and become creators of our own destiny.',
    status: 'Published',
    cover: 'images/books/the-magic-in-you.webp',
    buyUrl: 'https://www.amazon.in/Magic-You-Deepa-Rajani/dp/9390166322',
  };

  protected readonly programmes: readonly Programme[] = [
    {
      name: 'E.A.S.E. Dis-ease',
      tagline: 'Celiac Management Programme',
      description: '360° management of celiac disease and gut healing - gluten-free protocol, gut-lining repair and correcting nutritional deficiencies, built around the person, not just the diagnosis.',
    },
    {
      name: 'F.A.B. L.I.F.E.',
      tagline: '90-day transformation journey',
      description: 'Becoming Creators of a F.A.B. L.I.F.E. - a 90-day journey pairing gut-health protocols with the mindset work needed to make them stick.',
    },
  ];

  protected readonly collaborators: readonly Collaborator[] = [
    { name: 'Institute for Functional Medicine', detail: 'IFM (USA) certification' },
    { name: 'Empower Living', detail: 'Your Wellness Platform' },
    { name: 'E.A.S.E. Dis-ease', detail: 'Deepa’s own Celiac Management Programme' },
  ];

  protected readonly testimonials: readonly Testimonial[] = [
    { quote: 'Wisdom in bite-size pieces - it speaks to any reader.', name: 'Ketan Bhatia' },
    { quote: 'Written from the heart. It sparked a renewed motivation to pursue my dreams.', name: 'Dipti' },
    { quote: 'Made me more positive and open to believing in miracles.', name: 'Laveena Wadhwa' },
  ];

  protected bookConsultation(): void {
    openBookingForm();
  }
}
