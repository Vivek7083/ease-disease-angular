import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';
import { EyebrowLabel } from '../eyebrow-label/eyebrow-label';

interface Outcome {
  readonly title: string;
  readonly body: string;
}

interface Testimonial {
  readonly quote: string;
  readonly name: string;
  readonly context: string;
  /** True while the quote is invented stand-in copy; drives data-placeholder on the card so it's greppable. */
  readonly isPlaceholder: boolean;
}

// PRD §4 outcomes, worded as "can" / "many people" rather than guarantees —
// same softening the content doc applies to the remission line. The
// medication line explicitly keeps the doctor in the loop.
const OUTCOMES: readonly Outcome[] = [
  { title: 'Steadier energy', body: 'Fewer afternoon crashes, and more in the tank by evening.' },
  { title: 'Better sleep', body: 'Falling asleep easier, and staying asleep.' },
  { title: 'Balanced mood and hormones', body: 'A calmer baseline, and cycles that settle.' },
  { title: 'Less reliance on medication', body: 'With your doctor, many people can step down what they once thought was for life.' },
  { title: 'Numbers in their optimal range', body: 'Labs judged against optimal ranges, not just "normal".' },
  { title: 'Confidence in your own health', body: 'You understand your body and how to manage stress, so the change lasts.' },
];

// STAND-IN, NOT A REAL TESTIMONIAL — no client testimonials have been
// supplied yet (content doc: "No testimonials are included"). The quote,
// name and city below are invented for layout/design review only and MUST be
// replaced with a real, consented client quote before launch. Swap this
// object; nothing else in the template needs to change. Tracked in
// need-review/testimonial-placeholder.md.
const TESTIMONIAL: Testimonial = {
  quote:
    'For years I was told my tests were fine, yet I was bloated and exhausted by mid-afternoon. In my first consultation, someone finally sat down and asked about everything: my food, my sleep, my stress. A few weeks into the plan I have more energy, I sleep better, and I actually understand what my body is telling me.',
  name: 'Priya Sharma',
  context: 'Mumbai',
  isPlaceholder: true,
};

@Component({
  selector: 'app-results',
  imports: [ScrollRevealDirective, EyebrowLabel],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results {
  protected readonly outcomes = OUTCOMES;
  protected readonly testimonial = TESTIMONIAL;
}
