import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";
import { NavHomeComponent } from '../nav-home/nav-home.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FooterComponent, NavHomeComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent {
  constructor(private router: Router) { }

  enterAsLandlord(): void {
    this.router.navigate(['/login'], { queryParams: { role: 'landlords' } });
  }

  enterAsTenant(): void {
    this.router.navigate(['/login'], { queryParams: { role: 'tenants' } });
  }
}
