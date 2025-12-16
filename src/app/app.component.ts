import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, Event } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header *ngIf="!isAuthPage"></app-header>
    <router-outlet></router-outlet>
    <app-footer *ngIf="!isAuthPage"></app-footer>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'medi-find';
  isAuthPage = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkIfAuthPage(event.url);
    });
  }

  private checkIfAuthPage(url: string): void {
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    this.isAuthPage = authRoutes.some(route => url.includes(route));
  }
}