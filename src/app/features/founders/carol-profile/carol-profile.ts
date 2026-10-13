import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';
import { EyebrowLabel } from '../../../shared/components/eyebrow-label/eyebrow-label';
import { CtaPill } from '../../../shared/components/cta-pill/cta-pill';
import { SiteFooter } from '../../../shared/components/site-footer/site-footer';
import { SocialLinks, type SocialLink } from '../../../shared/components/social-links/social-links';
import { openBookingForm } from '../../../core/config/booking';

interface ExperienceEntry {
  readonly title: string;
  readonly org: string;
  readonly period: string;
  readonly location: string;
  readonly detail?: string;
  readonly skills?: readonly string[];
}

interface Certification {
  readonly name: string;
  readonly issuer: string;
  readonly issued: string;
}

interface SkillGroup {
  readonly label: string;
  readonly skills: readonly string[];
}

/**
 * Routed at /founders/carol — a dedicated portfolio-style page, distinct
 * from Deepa's (founders.ts), since the two founders' material doesn't fit
 * the same template: Carol's is a LinkedIn-style professional record
 * (experience, certifications, skills), not a single bio paragraph.
 */
@Component({
  selector: 'app-carol-profile',
  imports: [RouterLink, NgOptimizedImage, ScrollRevealDirective, EyebrowLabel, CtaPill, SiteFooter, SocialLinks],
  templateUrl: './carol-profile.html',
  styleUrl: './carol-profile.scss',
})
export class CarolProfile {
  protected readonly headline = 'Functional Nutritionist · Root-cause healing for chronic diseases & dysfunctions · 5+ years in healthcare';
  protected readonly location = 'Mumbai, Maharashtra, India';

  protected readonly socials: readonly SocialLink[] = [
    { platform: 'linkedin', url: 'https://www.linkedin.com/in/carol-r-774526103/' },
    { platform: 'instagram', url: 'https://instagram.com/carolribeiro.nutrition' },
  ];

  protected readonly about =
    'Carol helps people trace chronic conditions back to their root cause, with a focus on type 2 diabetes, ' +
    'autoimmunity, thyroid health and menopause. Her background spans hospital operations and patient care before ' +
    'functional nutrition — she brings a clinical eye to a field that often skips it.';

  protected readonly featuredPost = {
    org: 'HELPED',
    title: 'Understanding Men’s Mental Health',
    subtitle: 'A Conversation on Awareness, Support, and Well-Being',
    description: 'Certificate of participation — a community mental health webinar Carol attended, reflecting the same whole-person lens she brings to nutrition work: health rarely has just one cause.',
  };

  protected readonly experience: readonly ExperienceEntry[] = [
    {
      title: 'Practitioner',
      org: 'FM Nutrition',
      period: 'Mar 2026 – Present · 8 mos',
      location: 'India',
      skills: ['Food Science', 'Entrepreneurship'],
    },
    {
      title: 'Assistant Manager – Partnership and Operations',
      org: 'Qube Health',
      period: 'Jun 2024 – Jan 2026 · 1 yr 8 mos',
      location: 'Andheri Versova · On-site',
    },
    {
      title: 'Patient Care Service – OT Coordinator',
      org: 'Fortis Healthcare',
      period: 'Aug 2023 – Jan 2024 · 6 mos',
      location: 'Mumbai, Maharashtra, India · On-site',
      detail:
        'Collaborated with surgeons, anesthesiologists, nurses and other healthcare professionals to coordinate ' +
        'preoperative activities: patient preparation, surgical scheduling and equipment readiness.',
      skills: ['Responsiveness', 'Operations Management'],
    },
    {
      title: 'Officer – Patient Care Services',
      org: 'Fortis Healthcare',
      period: 'Apr 2022 – Aug 2023 · 1 yr 5 mos',
      location: 'Mumbai, Maharashtra, India',
      skills: ['Relationship Development'],
    },
  ];

  protected readonly certifications: readonly Certification[] = [
    { name: 'iThrive’s Certification in Functional Nutrition (iCFN)', issuer: 'CertifyMe', issued: 'Issued Mar 2026' },
    { name: 'Post Graduate Diploma in Hospital Business and Administration', issuer: 'NHCA Singapore', issued: 'Issued Feb 2024' },
  ];

  protected readonly skillGroups: readonly SkillGroup[] = [
    { label: 'Industry knowledge', skills: ['Food Science', 'Sports Nutrition', 'Nutrition', 'Entrepreneurship', 'Hospital Operations'] },
    { label: 'Interpersonal skills', skills: ['Responsiveness', 'Operations Management', 'Relationship Development'] },
  ];

  protected bookConsultation(): void {
    openBookingForm();
  }
}
