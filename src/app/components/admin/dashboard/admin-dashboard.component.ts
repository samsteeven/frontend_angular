import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
// import { UserService } from '../../../services/user.service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  globalStats: any = null;
  topSold: any[] = [];
  topSearches: any[] = [];
  loading = false;
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private adminService: AdminService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Use forkJoin to load everything in parallel if possible, or just sequential
    // For simplicity, let's load them
    this.adminService.getGlobalStats()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => this.globalStats = data,
        error: (err) => console.error('Error loading global stats', err)
      });

    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.adminService.getTopSoldMedications().subscribe({
      next: (data) => this.topSold = data,
      error: (err) => console.error('Error loading top sold', err)
    });

    this.adminService.getTopSearchTrends().subscribe({
      next: (data) => this.topSearches = data,
      error: (err) => console.error('Error loading trends', err)
    });
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'A';
    return `${this.currentUser.firstName?.charAt(0) || ''}${this.currentUser.lastName?.charAt(0) || ''}`.toUpperCase();
  }
}