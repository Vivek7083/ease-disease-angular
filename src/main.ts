import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Desktop Mac only (iPads report "MacIntel" too, but have touch points).
if (/^Mac/.test(navigator.platform) && navigator.maxTouchPoints === 0) {
  document.documentElement.classList.add('is-mac');
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
