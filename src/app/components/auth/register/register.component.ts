// app/components/auth/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  role: string = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      city: [''],
      latitude: [0],
      longitude: [0],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });

    // Ajout des champs selon le rôle
    this.route.params.subscribe(params => {
      this.role = params['role'] || 'client';
      this.addRoleSpecificFields();
    });
  }

  ngOnInit(): void { }

  addRoleSpecificFields(): void {
    // Champs spécifiques selon le rôle si nécessaire
    // if (this.role === 'collecteur') { ... }
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  getRoleLabel(): string {
    switch (this.role) {
      case 'admin': return 'Administrateur';
      case 'collecteur': return 'Collecteur';
      case 'client': return 'Client';
      default: return 'Utilisateur';
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Modifiez la méthode onSubmit :
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;

      // Préparez les données
      // Préparez les données
      const formValue = this.registerForm.value;

      // Fonction utilitaire pour envoyer null si vide (meilleure compatibilité backend)
      const toNull = (val: any) => (val === '' || val === null || val === undefined) ? null : val;
      const toNumOrNull = (val: any) => (val === 0 || val === '0' || val === '' || val === null || val === undefined) ? null : Number(val);

      const formData: any = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        password: formValue.password,
        role: this.role.toUpperCase(),
        phone: toNull(formValue.phone),
        address: toNull(formValue.address),
        city: toNull(formValue.city),
        latitude: toNumOrNull(formValue.latitude),
        longitude: toNumOrNull(formValue.longitude)
      };

      console.log('Register Payload (Final Try):', formData);

      // Appelez register avec UN SEUL argument
      this.authService.register(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Redirection selon le rôle
          switch (this.role) {
            case 'admin':
              this.router.navigate(['/admin/dashboard']);
              break;
            case 'collecteur':
              this.router.navigate(['/collecteur/dashboard']);
              break;
            case 'client':
              this.router.navigate(['/client/dashboard']);
              break;
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur lors de l\'inscription:', error);
        }
      });
    }
  }
}