import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'PV',
    component: TabsPage,
    children: [
      {
        path: 'current',
        loadComponent: () =>
          import('../current-view/current-view.page').then((m) => m.CurrentViewPage),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('../history/history.page').then((m) => m.HistoryPage),
      },
      {
        path: 'powerGrid',
        loadComponent: () =>
          import('../power-grid/power-grid.page').then((m) => m.PowerGridPage),
      },
      {
        path: '',
        redirectTo: '/PV/current/',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/PV/current',
    pathMatch: 'full',
  },
];
