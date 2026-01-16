import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
// import { UserService } from '../../../services/user.service';
import { AdminService } from '../../../services/admin.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCoins, faUsers, faClinicMedical, faShoppingCart, faDownload, faPills, faBoxOpen, faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  faCoins = faCoins;
  faUsers = faUsers;
  faClinicMedical = faClinicMedical;
  faShoppingCart = faShoppingCart;
  faDownload = faDownload;
  faPills = faPills;
  faBoxOpen = faBoxOpen;
  faSearch = faSearch;

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

  exportData(): void {
    this.adminService.exportGlobalReport().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-global-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Error exporting global report', err);
        alert('Erreur lors de la génération du rapport.');
      }
    });
  }

}