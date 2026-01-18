import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED'
}

interface Order {
  id: string;
  customerName: string;
  itemsCount: number;
  total: number;
  status: OrderStatus;
  time: string;
}

@Component({
  selector: 'app-order-kanban',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-kanban.html',
  styleUrl: './order-kanban.css'
})
export class OrderKanbanComponent implements OnInit {

  orders: Order[] = [];

  columns = [
    { label: 'En Attente', status: OrderStatus.PENDING, color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Payées', status: OrderStatus.PAID, color: 'bg-blue-100 text-blue-800' },
    { label: 'En Préparation', status: OrderStatus.PREPARING, color: 'bg-orange-100 text-orange-800' },
    { label: 'Prêtes / Livrées', status: OrderStatus.READY, color: 'bg-green-100 text-green-800' }
  ];

  constructor() { }

  ngOnInit(): void {
    // Mock Data
    this.orders = [
      { id: 'ORD-001', customerName: 'Jean Dupont', itemsCount: 3, total: 24.50, status: OrderStatus.PENDING, time: '10:30' },
      { id: 'ORD-002', customerName: 'Marie Curie', itemsCount: 1, total: 9.90, status: OrderStatus.PAID, time: '10:45' },
      { id: 'ORD-003', customerName: 'Pierre Paul', itemsCount: 5, total: 58.20, status: OrderStatus.PREPARING, time: '11:00' },
      { id: 'ORD-004', customerName: 'Alice Merveille', itemsCount: 2, total: 15.00, status: OrderStatus.READY, time: '09:15' }
    ];
  }

  getOrdersByStatus(status: OrderStatus): Order[] {
    if (status === OrderStatus.READY) {
      return this.orders.filter(o => o.status === OrderStatus.READY || o.status === OrderStatus.DELIVERING || o.status === OrderStatus.DELIVERED);
    }
    return this.orders.filter(o => o.status === status);
  }

  moveStatus(order: Order, newStatus: string): void {
    // TODO: Call API
    const status = newStatus as OrderStatus;
    order.status = status;

    if (status === OrderStatus.READY) {
      alert(`Commande ${order.id} prête ! Assignation livreur lancée...`);
    }
  }

  // Helper for template to expose OrderStatus enum
  public get OrderStatusEnum(): typeof OrderStatus {
    return OrderStatus;
  }
}
