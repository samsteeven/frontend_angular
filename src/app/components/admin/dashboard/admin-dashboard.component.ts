import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { DashboardStats } from '../../../models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule,/* RouterLink*/],
  template: `
    
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.userService.getUserStats()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (stats: DashboardStats) => (this.stats = stats),
        error: (error: any) => console.error('Erreur chargement stats:', error)
      });
  }

  /* roleEntries(): [string, number][] {
     return this.stats?.roles ? Object.entries(this.stats.roles) : [];
   }
 
   logout(): void {
     this.authService?.logout?.();
   }*/
}