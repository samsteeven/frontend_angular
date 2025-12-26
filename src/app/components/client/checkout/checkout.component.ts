import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { OrderService, CreateOrderRequest, OrderItemRequest } from '../../../services/order.service';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
    checkoutForm: FormGroup;
    isSubmitting = false;
    totalPrice = 0;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private cartService: CartService,
        private orderService: OrderService,
        private router: Router
    ) {
        this.checkoutForm = this.fb.group({
            address: ['', [Validators.required, Validators.minLength(5)]],
            latitude: [null], // Optional for now, user can enter text address
            longitude: [null]
        });
    }

    ngOnInit(): void {
        this.totalPrice = this.cartService.getTotalPrice();
        // Use geolocation if available (Simple implementation)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.checkoutForm.patchValue({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            });
        }
    }

    onSubmit(): void {
        if (this.checkoutForm.invalid) {
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        const cartItems = this.cartService['cartItems'].value; // Accessing BehaviorSubject value directly for now or via subscription
        if (cartItems.length === 0) {
            this.errorMessage = "Votre panier est vide.";
            this.isSubmitting = false;
            return;
        }

        // Group items by Pharmacy ID (Assuming one order per pharmacy for MVP simplicity, or backend handles split)
        // For MVP: We'll create one order per pharmacy found in cart.
        const itemsByPharmacy = new Map<string, OrderItemRequest[]>();

        cartItems.forEach(item => {
            const pharmId = item.medication.pharmacy.id;
            if (!itemsByPharmacy.has(pharmId)) {
                itemsByPharmacy.set(pharmId, []);
            }
            itemsByPharmacy.get(pharmId)?.push({
                medicationId: item.medication.medicationId,
                quantity: item.quantity
            });
        });

        // Create order for the first pharmacy found (MVP limitation or Loop)
        // Let's loop and create multiple orders if needed.
        const requests = Array.from(itemsByPharmacy.entries()).map(([pharmacyId, items]) => {
            const orderRequest: CreateOrderRequest = {
                pharmacyId: pharmacyId,
                items: items,
                deliveryAddress: this.checkoutForm.get('address')?.value,
                deliveryLatitude: this.checkoutForm.get('latitude')?.value,
                deliveryLongitude: this.checkoutForm.get('longitude')?.value
            };
            return this.orderService.createOrder(orderRequest).toPromise();
        });

        Promise.all(requests)
            .then(() => {
                this.cartService.clearCart();
                alert('Commande(s) créée(s) avec succès !');
                this.router.navigate(['/patient/search']); // Redirect to home or orders list
            })
            .catch(err => {
                console.error('Checkout error', err);
                this.errorMessage = 'Une erreur est survenue lors de la commande.';
            })
            .finally(() => {
                this.isSubmitting = false;
            });
    }
}
