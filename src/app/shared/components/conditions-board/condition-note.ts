import { Component, computed, input, output } from '@angular/core';
import { ConditionNote, PREVIEW_COUNT, SHOW_ALL_MAX } from './conditions-data';

/**
 * One pinned note: group name, a one-line preview, and (for the longer
 * lists) a tap to open the full set as chips. Open/closed state lives with
 * the parent, so only one note is open at a time across a whole board.
 * Used by the mobile column, the desktop pinboard and the desktop grid —
 * the same note everywhere, only its placement changes.
 */
@Component({
  selector: 'app-condition-note',
  template: `
    <div class="note" [class.is-open]="open()" [class.is-odd]="tilt() % 2 === 0" [class.is-compact]="compact()">
      <span class="note-pin" aria-hidden="true"></span>
      <p class="note-family">{{ note().family }}</p>
      @if (expandable()) {
        <button
          type="button"
          class="note-head"
          [attr.aria-expanded]="open()"
          [attr.aria-controls]="'note-body-' + note().id"
          (click)="toggled.emit()"
        >
          <span class="note-title">{{ note().title }}</span>
          <span class="note-preview">{{ preview() }}</span>
          <svg class="note-chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 8l5 5 5-5" /></svg>
        </button>
        <div class="note-body" [id]="'note-body-' + note().id">
          <ul class="note-items">
            @for (item of note().items; track item) {
              <li>{{ item }}</li>
            }
          </ul>
        </div>
      } @else {
        <div class="note-head">
          <span class="note-title">{{ note().title }}</span>
          <span class="note-preview">{{ preview() }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    /* The host owns any scroll-reveal transform (set by whoever places the
       note); the tilt lives on the inner .note so the two never fight over
       the same transform property. */
    .note {
      position: relative;
      padding: var(--sp-6) var(--sp-4) var(--sp-4);
      border-radius: var(--r-sm);
      border: 1px solid var(--rule-on-light);
      background: var(--surface-card-light);
      box-shadow: var(--shadow-soft);
      transform: rotate(-0.9deg);
      transform-origin: 50% 0;
      transition:
        transform var(--dur-base) var(--ease),
        box-shadow var(--dur-base) var(--ease);
    }

    .note.is-odd {
      transform: rotate(0.8deg);
    }

    /* An opened note straightens up and lifts, like it's been unpinned
       and held to read. */
    .note.is-open {
      transform: none;
      box-shadow: var(--shadow-lift);
    }

    /* Tighter variant for the notes pinned beside the large-screen map,
       where three stack in one column and must fit a laptop viewport. */
    .note.is-compact {
      padding: var(--sp-5) var(--sp-4) var(--sp-3);
    }

    .note.is-compact .note-title {
      font-size: 1.08rem;
    }

    .note.is-compact .note-preview {
      font-size: 0.84rem;
      margin-top: var(--sp-1);
    }

    .note-pin {
      position: absolute;
      top: -7px;
      left: 50%;
      width: 14px;
      height: 14px;
      margin-left: -7px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, var(--terracotta), var(--oxblood) 70%);
      box-shadow: 0 2px 3px rgba(43, 10, 15, 0.35);
    }

    .note-family {
      margin: 0 0 var(--sp-2);
      font-family: var(--font-mono);
      font-size: 0.66rem;
      letter-spacing: var(--ls-eyebrow);
      text-transform: uppercase;
      color: color-mix(in oklab, var(--olive) 70%, var(--text-quiet-light));
    }

    .note-head {
      display: block;
      position: relative;
      width: 100%;
      padding: 0;
      border: 0;
      background: none;
      text-align: left;
      font: inherit;
      color: inherit;
    }

    button.note-head {
      cursor: pointer;
      min-height: var(--tap-min);
      padding-right: var(--sp-8);
    }

    .note-title {
      display: block;
      font-family: var(--font-display);
      font-weight: 400;
      font-size: 1.2rem;
      line-height: 1.2;
      color: var(--ink);
    }

    .note-preview {
      display: block;
      margin-top: var(--sp-2);
      font-size: 0.9rem;
      line-height: var(--lh-body);
      color: var(--text-quiet-light);
    }

    .note-chevron {
      position: absolute;
      top: 2px;
      right: 0;
      width: 22px;
      height: 22px;
      transition: transform var(--dur-base) var(--ease);
    }

    .note-chevron path {
      fill: none;
      stroke: var(--oxblood);
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .note.is-open .note-chevron {
      transform: rotate(180deg);
    }

    button.note-head:focus-visible {
      outline: 2px solid var(--oxblood);
      outline-offset: 4px;
      border-radius: var(--r-xs);
    }

    /* Collapsed → open without measuring heights: animate the grid row
       between 0fr and 1fr. The preview line goes as the full list takes
       its place, so the same words never show twice. */
    .note-body {
      display: grid;
      grid-template-rows: 0fr;
      visibility: hidden;
      transition:
        grid-template-rows var(--dur-base) var(--ease),
        visibility 0s linear var(--dur-base);
    }

    .note.is-open .note-body {
      grid-template-rows: 1fr;
      visibility: visible;
      transition:
        grid-template-rows var(--dur-base) var(--ease),
        visibility 0s;
    }

    .note.is-open .note-preview {
      display: none;
    }

    .note-items {
      min-height: 0;
      overflow: hidden;
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
    }

    .note.is-open .note-items {
      padding-top: var(--sp-3);
    }

    .note-items li {
      padding: 5px 12px;
      border-radius: var(--r-sm);
      border: 1px solid color-mix(in oklab, var(--oxblood) 25%, transparent);
      background: color-mix(in oklab, var(--oxblood) 5%, var(--ivory));
      font-size: 0.84rem;
      line-height: 1.35;
      color: var(--oxblood-deep);
    }

    @media (prefers-reduced-motion: reduce) {
      .note,
      .note-chevron,
      .note-body {
        transition: none;
      }
    }
  `,
})
export class ConditionNoteCard {
  readonly note = input.required<ConditionNote>();
  readonly open = input(false);
  readonly compact = input(false);
  /** Any number — only its parity matters, to alternate the tilt direction between neighbouring notes. */
  readonly tilt = input(0);
  readonly toggled = output<void>();

  protected readonly expandable = computed(() => this.note().items.length > SHOW_ALL_MAX);

  protected readonly preview = computed(() => {
    const note = this.note();
    if (note.preview) {
      return note.preview;
    }
    if (!this.expandable()) {
      return note.items.join(' · ');
    }
    return `${note.items.slice(0, PREVIEW_COUNT).join(' · ')} +${note.items.length - PREVIEW_COUNT} more`;
  });
}
