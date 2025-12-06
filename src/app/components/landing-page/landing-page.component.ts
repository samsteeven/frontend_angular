import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  animations: [
    trigger('featureCard', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px) scale(0.8)' }),
        animate('800ms cubic-bezier(0.35, 0, 0.25, 1)', 
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ])
  ]
})
export class LandingPageComponent implements OnInit, OnDestroy {
  // Backgrounds premium
  backgrounds = [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1585435557343-3b092031d5ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  ];

  currentBackground = this.backgrounds[0];
  private backgroundInterval: any;

  // Stats animées
  stats = [
    { value: 50, label: 'Médicaments IA' },
    { value: 1000, label: 'Pharmacies Tech' },
    { value: 250, label: 'Diagnostics/jour' }
  ];

  countUpOptions = {
    duration: 2,
    useGrouping: false
  };

  // Résultats de recherche simulés
  searchResults = [
    'Doliprane 1000mg',
    'Vitamine C Boost',
    'Oméga-3 Premium',
    'Complexe B+'
  ];

  // Features avec icônes et technologies
  features = [
    {
      icon: 'fas fa-robot',
      title: 'IA Médicale',
      description: 'Notre intelligence artificielle analyse vos symptômes et recommande les meilleurs traitements.',
      tech: ['Deep Learning', 'NLP', 'Predictive AI']
    },
    {
      icon: 'fas fa-bolt',
      title: 'Livraison Drone',
      description: 'Recevez vos médicaments en moins de 30 minutes par drone autonome.',
      tech: ['GPS Tracking', 'Auto-Pilot', 'Real-time']
    },
    {
      icon: 'fas fa-vr-cardboard',
      title: 'Consultation VR',
      description: 'Consultez un médecin en réalité virtuelle depuis votre salon.',
      tech: ['VR Tech', '3D Audio', 'Hologram']
    },
    {
      icon: 'fas fa-dna',
      title: 'Analyse ADN',
      description: 'Tests ADN complets pour des recommandations personnalisées.',
      tech: ['Genomics', 'Bio-Tech', 'AI Analysis']
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Blockchain Secured',
      description: 'Vos données médicales sécurisées par blockchain inviolable.',
      tech: ['Blockchain', 'Encryption', 'Web3']
    },
    {
      icon: 'fas fa-chart-network',
      title: 'Réseau Global',
      description: 'Accédez à un réseau mondial de professionnels de santé.',
      tech: ['Global API', 'Cloud', '5G Ready']
    }
  ];

  ngOnInit() {
    this.startBackgroundRotation();
  }

  ngOnDestroy() {
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
    }
  }

  private startBackgroundRotation() {
    let index = 0;
    this.backgroundInterval = setInterval(() => {
      index = (index + 1) % this.backgrounds.length;
      this.currentBackground = this.backgrounds[index];
    }, 6000);
  }
}