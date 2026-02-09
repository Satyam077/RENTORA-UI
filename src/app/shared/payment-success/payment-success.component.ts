import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent implements OnInit {
  txnId: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.txnId = params['txnId'];
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToSubscriptions(): void {
    this.router.navigate(['/landlords/subscriptions']);
  }
}
