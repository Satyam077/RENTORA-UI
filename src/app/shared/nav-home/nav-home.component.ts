import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-home',
  imports: [],
  templateUrl: './nav-home.component.html',
  styleUrl: './nav-home.component.css',
})
export class NavHomeComponent {
  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
  navigateToPlans() {
    this.router.navigate(['/subscriptions-plans']);
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToAbout() {
    this.router.navigate(['/about-us']);
  }
}
