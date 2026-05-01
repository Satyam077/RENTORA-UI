import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-spinner',
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule],
    template: `
    <div *ngIf="isLoading" style="
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 48px 0;
      width: 100%;
    ">
      <mat-spinner [diameter]="diameter" color="primary"></mat-spinner>
      <p *ngIf="message" style="margin-top: 16px; color: #888; font-size: 14px;">{{ message }}</p>
    </div>
  `,
})
export class SpinnerComponent {
    @Input() isLoading = false;
    @Input() diameter = 40;
    @Input() message = '';
}
