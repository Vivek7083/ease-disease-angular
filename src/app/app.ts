import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CanvasStoryService } from './core/services/canvas-story';
import { AppUpdateService } from './core/services/app-update';
import { FragmentScrollService } from './core/services/fragment-scroll';
import { AuthService } from './core/services/auth';
import { PackagesService } from './core/services/packages';
import { SiteNav } from './shared/components/site-nav/site-nav';
import { ScrollProgress } from './shared/components/scroll-progress/scroll-progress';
import { FlowLines } from './shared/components/flow-lines/flow-lines';
import { BookingForm } from './shared/components/booking-form/booking-form';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteNav, ScrollProgress, FlowLines, BookingForm],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly canvasStory = inject(CanvasStoryService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly canvasColor = this.canvasStory.canvasColor;

  constructor() {
    this.canvasStory.start(this.destroyRef);
    inject(AppUpdateService).start(this.destroyRef);
    inject(FragmentScrollService).start(this.destroyRef);
    inject(PackagesService).load();
    inject(AuthService).start();
  }
}
