import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-failure.component.html',
  styleUrl: './payment-failure.component.css'
})
export class PaymentFailureComponent implements OnInit {
  errorMessage: string = 'Payment failed. Please try again.';

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.errorMessage = params['error'];
      }
    });
  }

  retryPayment(): void {
    this.router.navigate(['/landlords/subscriptions']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
