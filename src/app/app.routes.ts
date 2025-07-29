import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { FormAjoutVehicule } from './pages/form-ajout-vehicule/form-ajout-vehicule';

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
      },
      {
        path: 'vehicules',
        loadComponent: () => import('./pages/vehicules/vehicules.component').then(m => m.VehiculesComponent)
      },
      {
        path: 'vehicules/:id',
        loadComponent: () => import('./pages/vehicule-details/vehicule-details').then(m => m.VehiculeDetails)
      },
      {
        path: 'missions',
        loadComponent: () => import('./pages/missions/missions').then(m => m.Missions)
      },
      {
        path: 'form-mission',
        loadComponent: () => import('./pages/form-mission/form-mission').then(m => m.FormMissionComponent)
      },
      {
        path: 'form-mission/:id',
        loadComponent: () => import('./pages/form-mission/form-mission').then(m => m.FormMissionComponent)
      },
      {
        path: 'form-ajout-vehicule',
        loadComponent: () => import('./pages/form-ajout-vehicule/form-ajout-vehicule').then(m => m.FormAjoutVehicule) // Assurez-vous que ce composant existe
      },
      {
        path: 'modifier-vehicule/:id',
        loadComponent: () => import('./pages/form-ajout-vehicule/form-ajout-vehicule').then(m => m.FormAjoutVehicule)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login' // Route wildcard pour les URLs inexistantes
  }
];
