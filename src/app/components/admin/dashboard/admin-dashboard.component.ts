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
    // Prepare CSV content
    const csvContent = this.generateCSV();

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `medicam-dashboard-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private generateCSV(): string {
    let csv = '';

    // Header
    csv += 'MEDICAM - Rapport du Tableau de Bord\n';
    csv += `Date d'export: ${new Date().toLocaleString('fr-FR')}\n\n`;

    // Global Statistics
    csv += 'STATISTIQUES GLOBALES\n';
    csv += 'Indicateur,Valeur\n';
    if (this.globalStats) {
      csv += `Revenu Total,${this.globalStats.totalRevenue || 0} FCFA\n`;
      csv += `Commandes Totales,${this.globalStats.totalOrders || 0}\n`;
      csv += `Commandes en Attente,${this.globalStats.pendingOrders || 0}\n`;
      csv += `Pharmacies Actives,${this.globalStats.activePharmacies || 0}\n`;
      csv += `Patients Totaux,${this.globalStats.totalPatients || 0}\n`;
    }
    csv += '\n';

    // Top Sold Medications
    csv += 'TOP MEDICAMENTS VENDUS\n';
    csv += 'Rang,Nom,Quantité Vendue\n';
    this.topSold.forEach((med, index) => {
      csv += `${index + 1},${med.name || 'N/A'},${med.soldCount || 0}\n`;
    });
    csv += '\n';

    // Top Searches
    csv += 'TOP RECHERCHES\n';
    csv += 'Rang,Terme de Recherche,Nombre de Recherches\n';
    this.topSearches.forEach((search, index) => {
      csv += `${index + 1},${search.searchTerm || 'N/A'},${search.searchCount || 0}\n`;
    });

    return csv;
  }
}