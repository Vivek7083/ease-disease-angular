import { AfterViewInit, Directive, ElementRef, inject, input } from '@angular/core';
import { CanvasStoryService } from '../services/canvas-story';

/**
 * Marks a scrollytelling section as a canvas color stop. `from`/`to` are CSS
 * color values (usually `var(--canvas-*-from|to)`); the canvas blends
 * between them as the section scrolls through the viewport.
 */
@Directive({
  selector: '[appCanvasStop]',
})
export class CanvasStopDirective implements AfterViewInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly canvasStory = inject(CanvasStoryService);

  readonly from = input.required<string>();
  readonly to = input.required<string>();

  ngAfterViewInit(): void {
    this.canvasStory.registerStop({
      element: this.elementRef.nativeElement,
      from: this.from(),
      to: this.to(),
    });
  }
}
