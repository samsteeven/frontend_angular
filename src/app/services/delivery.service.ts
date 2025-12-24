import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Delivery, DeliveryStatus } from '../models/delivery.model';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
    private apiUrl = '/api/v1/deliveries';

    constructor(private http: HttpClient) { }

    // Get deliveries for a specific pharmacy (Admin view)
    getPharmacyDeliveries(pharmacyId: string): Observable<Delivery[]> {
        return this.http.get<Delivery[]>(`${this.apiUrl}/pharmacy/${pharmacyId}`);
    }

    // Get available deliveries (Ready orders waiting for courier)
    getAvailableDeliveries(pharmacyId: string): Observable<Delivery[]> {
        return this.http.get<Delivery[]>(`${this.apiUrl}/available?pharmacyId=${pharmacyId}`);
    }

    // Get deliveries assigned to the current user (Courier view)
    getMyDeliveries(): Observable<Delivery[]> {
        return this.http.get<Delivery[]>(`${this.apiUrl}/my-deliveries`);
    }

    // Assign a delivery to the current user
    acceptDelivery(deliveryId: string): Observable<Delivery> {
        return this.http.post<Delivery>(`${this.apiUrl}/${deliveryId}/accept`, {});
    }

    // Update delivery status
    updateStatus(id: string, status: DeliveryStatus): Observable<Delivery> {
        return this.http.patch<Delivery>(`${this.apiUrl}/${id}/status?status=${status}`, {});
    }
}
