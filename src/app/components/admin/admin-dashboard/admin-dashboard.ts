import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {

  // KPIs
  dailyTurnover: number = 0;
  pendingOrders: number = 0;
  lowStockItems: number = 0;

  // Revenue Chart (Line)
  public revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        data: [650, 590, 800, 810, 560, 550, 400],
        label: 'Chiffre d\'Affaires (€)',
        fill: true,
        tension: 0.5,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.3)'
      }
    ]
  };
  public revenueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false
  };

  // Top Products Chart (Bar)
  public productsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Doliprane', 'Spasfon', 'Efferalgan', 'Advil', 'Fervex'],
    datasets: [
      { data: [65, 59, 80, 81, 56], label: 'Unités Vendues', backgroundColor: '#10b981' }
    ]
  };
  public productsChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false
  };

  constructor() { }

  ngOnInit(): void {
    // TODO: Fetch real data from backend
    this.dailyTurnover = 1250.50;
    this.pendingOrders = 12;
    this.lowStockItems = 5;
  }
}
