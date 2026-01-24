import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.css'
})
export class SuperAdminDashboardComponent implements OnInit {
  stats = {
    totalLandlords: 0,
    totalAdmins: 0,
    totalTenants: 0,
    totalRevenue: 0
  };

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/AdminDashboad/stats`).subscribe({
      next: (res) => {
        this.stats.totalLandlords = res.totalLandlords || res.TotalLandlords || 0;
        this.stats.totalAdmins = res.totalAdmins || res.TotalAdmins || 0;
        this.stats.totalTenants = res.totalTenants || res.TotalTenants || 0;
        this.stats.totalRevenue = res.totalRevenue || res.TotalRevenue || 0;
      },
      error: (err) => console.error('Error fetching dashboard stats:', err)
    });
  }
}
