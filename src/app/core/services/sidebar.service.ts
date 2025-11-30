import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private collapsedSubject = new BehaviorSubject<boolean>(false);
  public collapsed$: Observable<boolean> = this.collapsedSubject.asObservable();

  constructor() {
    // Load saved state from localStorage if available
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.collapsedSubject.next(savedState === 'true');
    }
  }

  toggle(): void {
    const newState = !this.collapsedSubject.value;
    this.collapsedSubject.next(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  }

  setCollapsed(collapsed: boolean): void {
    this.collapsedSubject.next(collapsed);
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }

  getCollapsed(): boolean {
    return this.collapsedSubject.value;
  }
}

