import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CanvasStoryService } from './core/services/canvas-story';
import { BookingCtaService } from './core/services/booking-cta';
import { Wordmark } from './shared/components/wordmark/wordmark';
import { ScrollProgress } from './shared/components/scroll-progress/scroll-progress';
import { CtaPill } from './shared/components/cta-pill/cta-pill';
import { FlowLines } from './shared/components/flow-lines/flow-lines';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Wordmark, ScrollProgress, CtaPill, FlowLines],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly canvasStory = inject(CanvasStoryService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly canvasColor = this.canvasStory.canvasColor;
  protected readonly bookingCta = inject(BookingCtaService);

  constructor() {
    this.canvasStory.start(this.destroyRef);
  }
}
