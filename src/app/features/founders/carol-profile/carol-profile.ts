import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';
import { EyebrowLabel } from '../../../shared/components/eyebrow-label/eyebrow-label';
import { CtaPill } from '../../../shared/components/cta-pill/cta-pill';
import { SiteFooter } from '../../../shared/components/site-footer/site-footer';
import { SocialLinks, type SocialLink } from '../../../shared/components/social-links/social-links';
import { BookingModalService } from '../../../core/services/booking-modal';

/**
 * Routed at /founders/carol - Carol's page: who she is, why she does this
 * work, and her credentials. Deliberately short; her work history and
 * skills live on LinkedIn, which is the only social link here.
 */
@Component({
  selector: 'app-carol-profile',
  imports: [RouterLink, NgOptimizedImage, ScrollRevealDirective, EyebrowLabel, CtaPill, SiteFooter, SocialLinks],
  templateUrl: './carol-profile.html',
  styleUrl: './carol-profile.scss',
})
export class CarolProfile {
  protected readonly headline = 'Certified Functional Nutritionist and Healthcare Management Professional';

  protected readonly socials: readonly SocialLink[] = [
    { platform: 'linkedin', url: 'https://www.linkedin.com/in/carol-r-774526103/' },
  ];

  protected readonly credentials: readonly string[] = [
    'Certified Functional Nutritionist (iCFN), iThrive Academy & Research Centre',
    'MBA, Business Administration & Management, NMIMS',
    'PG Diploma, Hospital Business & Administration, NHCA Singapore',
    'Lean Six Sigma Green Belt, Healthcare',
    'Infection Prevention & Control Management',
    'Quality Control Management',
  ];

  private readonly bookingModal = inject(BookingModalService);

  protected bookConsultation(): void {
    this.bookingModal.open();
  }
}
