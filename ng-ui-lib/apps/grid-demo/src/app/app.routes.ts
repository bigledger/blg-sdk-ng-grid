import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/editor-demo',
    pathMatch: 'full'
  },
  {
    path: 'editor-demo',
    loadComponent: () => 
      import('./examples/editor-demo.component').then(m => m.EditorDemoComponent),
    title: 'BLG Editor Demo'
  },
  {
    path: 'grid-demo',
    loadComponent: () => 
      import('./examples/basic-example.component').then(m => m.BasicExampleComponent),
    title: 'BigLedger Grid Demo'
  }
];
