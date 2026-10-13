import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'events',
    loadComponent: () => import('./features/events/events').then((m) => m.Events),
  },
  {
    path: 'founders',
    redirectTo: 'founders/carol',
    pathMatch: 'full',
  },
  {
    path: 'founders/carol',
    loadComponent: () => import('./features/founders/carol-profile/carol-profile').then((m) => m.CarolProfile),
  },
  {
    path: 'founders/deepa',
    loadComponent: () => import('./features/founders/deepa-profile/deepa-profile').then((m) => m.DeepaProfile),
  },
];
