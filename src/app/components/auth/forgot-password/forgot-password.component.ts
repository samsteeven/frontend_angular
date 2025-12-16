// ...existing code...
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
//import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, /*RouterLink*/],
  template: `
    <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="forgot-form">
      <label for="email">Email</label>
      <input id="email" formControlName="email" type="email" />
      <div *ngIf="email?.invalid && email?.touched" class="error">
        <div *ngIf="email?.errors?.['required']">Email requis</div>
        <div *ngIf="email?.errors?.['email']">Email invalide</div>
      </div>

      <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
      <div *ngIf="successMessage" class="success">{{ successMessage }}</div>

      <button type="submit" [disabled]="loading || forgotForm.invalid">
        {{ loading ? 'Envoi...' : 'Envoyer' }}
      </button>
    </form>
  `
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.forgotForm.get('email');
  }

  onSubmit(): void {
    if (!this.forgotForm.valid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.forgotForm.disable();

    // CORRECTION : Utilisez 1 argument (objet)
    const payload = {
      email: this.forgotForm.value.email
    };

    this.authService.forgotPassword(payload) // 1 argument seulement
      .pipe(finalize(() => {
        this.loading = false;
        this.forgotForm.enable();
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'Email envoyé avec succès !';
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || err?.message || 'Erreur lors de l\'envoi de l\'email';
        }
      });
  }
}