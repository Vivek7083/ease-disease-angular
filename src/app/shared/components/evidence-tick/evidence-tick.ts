import { Component } from '@angular/core';

@Component({
  selector: 'app-evidence-tick',
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true" width="17" height="17">
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }
    path {
      fill: none;
      stroke: var(--evidence-blue);
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
})
export class EvidenceTick {}
