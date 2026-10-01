import { Component, computed, signal } from '@angular/core';
import { ScrollRevealDirective } from '../../../core/directives/scroll-reveal';
import { ConditionNoteCard } from './condition-note';
import { NOTES } from './conditions-data';

/** How many notes show before the "more" button — the first half of the PRD list. */
const INITIAL_NOTES = 8;

/**
 * Mobile "pinboard" under the root map: a single column of notes, the first
 * half to start with and the rest on request. Normal flow, no pin — a calm
 * beat after the map. (Large screens place the same notes around the
 * pinned map instead — see root-map.ts.)
 */
@Component({
  selector: 'app-conditions-board',
  imports: [ScrollRevealDirective, ConditionNoteCard],
  template: `
    <p class="board-hint">Tap a note for the full list</p>
    <ul class="board" id="board-notes" aria-label="Conditions we treat">
      @for (note of visibleNotes(); track note.id; let i = $index) {
        <li class="slot reveal" [appScrollReveal]="0" [revealRepeat]="true" [class.is-odd]="i % 2 === 0">
          <app-condition-note [note]="note" [tilt]="i" [open]="openId() === note.id" (toggled)="toggle(note.id)" />
        </li>
      }
    </ul>
    <div class="board-more">
      <button type="button" class="board-more-btn" [attr.aria-expanded]="showAll()" aria-controls="board-notes" (click)="toggleAll($event)">
        {{ showAll() ? 'Show fewer conditions' : 'See ' + hiddenCount + ' more conditions' }}
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .board-hint {
      margin: 0 0 var(--sp-6);
      text-align: center;
      font-family: var(--font-mono);
      font-size: 0.74rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      color: var(--text-quiet-light);
    }

    .board {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--sp-6);
    }

    /* The li owns the scroll-reveal transform. The alternating side
       margins stagger the notes like they were pinned by hand rather than
       ruled into a list. */
    .slot {
      margin-right: 7%;
    }

    .slot.is-odd {
      margin-right: 0;
      margin-left: 7%;
    }

    .board-more {
      margin-top: var(--sp-8);
      display: flex;
      justify-content: center;
    }

    .board-more-btn {
      min-height: var(--tap-min);
      padding: 0 var(--sp-6);
      border-radius: var(--r-pill);
      border: 1px solid color-mix(in oklab, var(--oxblood) 40%, transparent);
      background: transparent;
      color: var(--oxblood-deep);
      font-family: var(--font-body);
      font-size: 0.95rem;
      cursor: pointer;
    }

    .board-more-btn:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 3px;
    }
  `,
})
export class ConditionsBoard {
  protected readonly hiddenCount = NOTES.length - INITIAL_NOTES;

  /** One note open at a time — opening another closes the last, so the board never grows into a wall of text. */
  protected readonly openId = signal<string | null>(null);

  /** Only the first half show until the reader asks for the rest — newly shown notes arrive through the usual scroll reveal. */
  protected readonly showAll = signal(false);
  protected readonly visibleNotes = computed(() => (this.showAll() ? NOTES : NOTES.slice(0, INITIAL_NOTES)));

  protected toggleAll(event: Event): void {
    const button = event.currentTarget as HTMLElement;
    const wasOpen = this.showAll();
    this.showAll.set(!wasOpen);
    if (wasOpen) {
      // Collapsing shortens the page under the reader — keep the button, and the reader, in place.
      this.openId.set(null);
      requestAnimationFrame(() => button.scrollIntoView({ block: 'center', behavior: 'smooth' }));
    }
  }

  protected toggle(id: string): void {
    this.openId.update((current) => (current === id ? null : id));
  }
}
