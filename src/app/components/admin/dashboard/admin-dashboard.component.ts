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
  stats: any = null;
  loading = false;
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private adminService: AdminService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.adminService.getDashboardStats()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (stats: any) => (this.stats = stats),
        error: (error: any) => console.error('Erreur chargement stats:', error)
      });
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'A';
    return `${this.currentUser.firstName?.charAt(0) || ''}${this.currentUser.lastName?.charAt(0) || ''}`.toUpperCase();
  }
}