import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth-service/auth-service';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

export const ROUTES: RouteInfo[] = [
    { path: '/admin/dashboard', title: 'Dashboard',  icon: 'dashboard', class: '' },
    { path: '/admin/account', title: 'User Profile',  icon:'person', class: '' },
    { path: '/admin/vehicules', title: 'Véhicules',  icon: 'directions_car', class: '' },
    { path: '/admin/missions', title: 'Missions',  icon: 'assignment', class: '' },
    { path: '/admin/signalements', title: 'Signalements',  icon: 'warning', class: '' },
    { path: '/admin/reparations', title: 'Réparations',  icon: 'build', class: '' },
    { path: '/admin/notifications', title: 'Notifications',  icon:'notifications', class: '' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[] = [];
  authority: string | null = '';

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.getAuthority();
    //this.menuItems = ROUTES.filter(menuItem => menuItem);
  }

  getAuthority() {
    this.authority=this.authService.getUserRole()? this.authService.getUserRole() : '';
    if (this.authority === 'ADMIN') {
      this.menuItems = ROUTES;
    } else if (this.authority === 'USER') {
      this.menuItems = ROUTES.filter(menuItem => menuItem.title !== 'Réparations');
    } else {
      this.menuItems = [];
    }
  }

  isMobileMenu() {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 991;
    }
    return false;
  }
}
