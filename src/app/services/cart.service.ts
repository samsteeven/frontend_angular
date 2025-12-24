import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OrderItem } from '../models/order.model';
import { PharmacyMedicationDTO } from '../models/pharmacy.model';

export interface CartState {
    items: OrderItem[];
    pharmacyId: string | null;
    pharmacyName?: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
    private cartSubject = new BehaviorSubject<CartState>({ items: [], pharmacyId: null });
    public cart$ = this.cartSubject.asObservable();

    constructor() {
        this.loadCart();
    }

    getCart(): CartState {
        return this.cartSubject.value;
    }

    addItem(pharmacyId: string, pharmacyName: string, product: PharmacyMedicationDTO, quantity: number = 1): void {
        const currentCart = this.getCart();

        // Check if adding from a different pharmacy
        if (currentCart.pharmacyId && currentCart.pharmacyId !== pharmacyId) {
            if (!confirm('Votre panier contient des articles d\'une autre pharmacie. Voulez-vous le vider pour commander dans celle-ci ?')) {
                return;
            }
            this.clearCart();
        }

        const currentState = this.getCart(); // Re-get after potential clear
        const items = [...currentState.items];
        const existingItemIndex = items.findIndex(item => item.medicationId === product.medicationId);

        if (existingItemIndex > -1) {
            items[existingItemIndex].quantity += quantity;
        } else {
            items.push({
                medicationId: product.medicationId,
                medicationName: product.name,
                quantity,
                price: product.price
            });
        }

        this.updateCart({
            items,
            pharmacyId,
            pharmacyName
        });
    }

    removeItem(medicationId: string): void {
        const currentState = this.getCart();
        const items = currentState.items.filter(item => item.medicationId !== medicationId);

        if (items.length === 0) {
            this.clearCart();
        } else {
            this.updateCart({ ...currentState, items });
        }
    }

    updateQuantity(medicationId: string, quantity: number): void {
        const currentState = this.getCart();
        const items = currentState.items.map(item => {
            if (item.medicationId === medicationId) {
                return { ...item, quantity };
            }
            return item;
        });
        this.updateCart({ ...currentState, items });
    }

    clearCart(): void {
        this.updateCart({ items: [], pharmacyId: null });
    }

    private updateCart(state: CartState): void {
        this.cartSubject.next(state);
        localStorage.setItem('cart', JSON.stringify(state));
    }

    private loadCart(): void {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cartSubject.next(JSON.parse(savedCart));
        }
    }

    getTotal(): number {
        return this.getCart().items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
    }
}
