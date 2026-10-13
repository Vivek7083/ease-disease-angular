import { Component, computed, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';
import { EyebrowLabel } from '../eyebrow-label/eyebrow-label';

interface ChatMessage {
  readonly sender: 'client' | 'coach';
  readonly text: string;
  readonly time: string;
  readonly reaction?: string;
}

interface ChatThread {
  readonly id: string;
  /** Short theme shown under the phone and read out to screen readers. */
  readonly label: string;
  /** Letter and colour of the chat avatar — clients' names are withheld. */
  readonly initial: string;
  readonly tone: string;
  /** Header sub-line. */
  readonly status: string;
  /** Last-message snippet and time shown in the desktop chat list. */
  readonly preview: string;
  readonly listTime: string;
  /** Optional date chip at the top of the thread. */
  readonly date?: string;
  readonly messages: readonly ChatMessage[];
}

// Real client messages to Carol on WhatsApp, shared with permission and left
// verbatim (typos included) so they read as authentic. Names are withheld.
// Add, remove or reorder threads here; nothing else depends on the content.
const THREADS: readonly ChatThread[] = [
  {
    id: 'energy',
    label: 'Energy & mindset',
    initial: 'A',
    tone: 'var(--oxblood)',
    status: 'Female · 35 yo · Mumbai',
    preview: "I'm honestly so grateful to Carol for the difference she has made in my life. ❤️",
    listTime: '10:08 PM',
    messages: [
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
    ],
  },
  {
    id: 'weight',
    label: 'Weight & insulin',
    initial: 'B',
    tone: 'var(--terracotta)',
    status: 'Male · 37 yo · Thane',
    preview: 'Lost upto 5kg weight beside normalized insulin.',
    listTime: '25 Aug',
    date: 'Tue, 25 Aug',
    messages: [
      {
        sender: 'client',
        text:
          'Evey one wants a fit and healthy persona with strong mind and non disruptive confidence. But one cant achive this without following Carol. Prior to visiting Her, I was leading an indisciplined life style which caused unwarranted wight gain and other elements of health releted insecurity. Now I am almost free from all thses tensions since when I followed Carole standards of nutritional advises. It is significant to mention that I lost upto 5kg wieght beside normalized insulin. Lots of thanks to Her, I strongly recommend her sessions to those who desires to lead a fit, fine and healthy life style.',
        time: '10:07 AM',
        reaction: '❤️',
      },
    ],
  },
  {
    id: 'heard',
    label: 'Feeling heard',
    initial: 'C',
    tone: 'var(--olive)',
    status: 'Female · 53 yo · Mumbai',
    preview: 'I really enjoyed speaking with you over the phone.',
    listTime: '9:33 PM',
    messages: [
      {
        sender: 'client',
        text:
          'Okay, Carol. Will do the tests.\nI really enjoyed speaking with you over the phone. You were very kind and patient, and I genuinely appreciated how comfortable you made me feel.',
        time: '9:32 PM',
        reaction: '❤️',
      },
      {
        sender: 'client',
        text:
          "I'm sure working with you will be a great experience. Also, could you please walk me through what's included in the program? I'd love to understand how it's structured, what the follow-ups look like, and what kind of guidance and support I'll receive throughout the three months. Whatever works for you.\n\nAlso, do you have daily check-ins, or would I be sharing meal pictures? Is there any app or platform you use to track progress?",
        time: '9:33 PM',
        reaction: '❤️',
      },
    ],
  },
];

const SWIPE_MIN_PX = 50;

@Component({
  selector: 'app-testimonials',
  imports: [NgTemplateOutlet, ScrollRevealDirective, EyebrowLabel],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class Testimonials {
  protected readonly threads = THREADS;
  protected readonly active = signal(0);
  protected readonly current = computed(() => THREADS[this.active()]);

  /** Accessible, non-visual transcript of every exchange for screen readers — the chat chrome itself is aria-hidden. */
  protected readonly transcript = THREADS.map(
    (thread, i) =>
      `Message ${i + 1} of ${THREADS.length}, ${thread.label}: ` +
      thread.messages.map((message) => message.text.replace(/\n+/g, ' ')).join(' '),
  );

  private swipeStart: { x: number; y: number } | null = null;

  protected select(index: number): void {
    this.active.set(index);
  }

  protected step(direction: 1 | -1): void {
    this.active.update((i) => (i + direction + THREADS.length) % THREADS.length);
  }

  protected onPointerDown(event: PointerEvent): void {
    this.swipeStart = event.pointerType === 'touch' ? { x: event.clientX, y: event.clientY } : null;
  }

  protected onPointerUp(event: PointerEvent): void {
    const start = this.swipeStart;
    this.swipeStart = null;
    if (!start) {
      return;
    }
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
      this.step(dx < 0 ? 1 : -1);
    }
  }
}
