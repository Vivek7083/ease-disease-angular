import { Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';
import { EyebrowLabel } from '../eyebrow-label/eyebrow-label';

interface ChatMessage {
  readonly sender: 'client' | 'coach';
  readonly text: string;
  readonly time: string;
  readonly reaction?: string;
}

// The client's name is withheld — the header identifies her only by gender,
// age and city instead.
const PROFILE = { gender: 'Female', age: 35, location: 'Mumbai' } as const;

// A real client message to Carol on WhatsApp, shared with her permission.
// Carol's reply is the message that followed it in the same thread. Swap
// MESSAGES if this needs to change; nothing else in the template depends on
// its content.
const MESSAGES: readonly ChatMessage[] = [
  {
    sender: 'client',
    text:
      "I'm honestly so grateful to Carol for the difference she has made in my life. ❤️ Her guidance with my diet, lifestyle and supplements has helped me feel so much better, not just physically but mentally too.\n\nSince I started working with her, I've noticed a real change in how I feel about myself and my overall well-being. I feel healthier, more energetic and more confident, and most importantly, I feel like I'm in a much better space mentally.\n\nThank you, Carol, for always being so patient and supportive. I'm genuinely so glad I found you and would highly recommend her to anyone looking for someone who truly cares about overall health. ❤️",
    time: '12:26 PM',
    reaction: '🎉',
  },
  {
    sender: 'coach',
    text: 'Lovely to know you feel better 💐',
    time: '10:08 PM',
    reaction: '❤️',
  },
];

@Component({
  selector: 'app-testimonials',
  imports: [NgTemplateOutlet, ScrollRevealDirective, EyebrowLabel],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class Testimonials {
  protected readonly messages = MESSAGES;
  protected readonly profileLabel = `${PROFILE.gender} · ${PROFILE.age} yo · ${PROFILE.location}`;

  /** Accessible, non-visual transcript of the same exchange for screen readers — the chat chrome itself is aria-hidden. */
  protected readonly transcript = MESSAGES.map((message) => message.text.replace(/\n+/g, ' ')).join(' ');
}
