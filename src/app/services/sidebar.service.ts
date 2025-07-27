import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  public isCollapsed$ = this.isCollapsedSubject.asObservable();

  constructor() { }

  toggleSidebar(): void {
    this.isCollapsedSubject.next(!this.isCollapsedSubject.value);
  }

  collapseSidebar(): void {
    this.isCollapsedSubject.next(true);
  }

  expandSidebar(): void {
    this.isCollapsedSubject.next(false);
  }

  get isCollapsed(): boolean {
    return this.isCollapsedSubject.value;
  }
}
