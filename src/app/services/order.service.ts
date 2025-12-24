import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderDTO, Order, OrderStatus } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private apiUrl = '/api/v1/orders';

    constructor(private http: HttpClient) { }

    createOrder(order: CreateOrderDTO): Observable<Order> {
        return this.http.post<Order>(this.apiUrl, order);
    }

    getMyOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/my-orders`);
    }

    getPharmacyOrders(pharmacyId: string): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/pharmacy-orders/${pharmacyId}`);
    }

    getOrderById(id: string): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`);
    }

    updateStatus(id: string, status: OrderStatus): Observable<Order> {
        return this.http.patch<Order>(`${this.apiUrl}/${id}/status?status=${status}`, {});
    }
}
