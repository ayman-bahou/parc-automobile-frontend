import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    canActivate: [loginGuard] // Empêche l'accès si déjà connecté
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard], // Protège toutes les routes admin
    children: [
      {
        path: '',
        redirectTo: '/admin/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      // Toutes les futures routes admin seront automatiquement protégées
      {
        path: 'account',
        loadComponent: () => import('./pages/account/account').then(m => m.Account)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login' // Route wildcard pour les URLs inexistantes
  }
];
