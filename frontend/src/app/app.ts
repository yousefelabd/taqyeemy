import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ThemeService } from './core/services/theme.service';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
    <app-footer />
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
    }
  `]
})
export class App implements OnInit {
  // حقن الـ service هنا بيشغّله فوراً عند بدء التطبيق
  // ويطبق الـ theme المحفوظ في localStorage تلقائياً
  readonly themeService = inject(ThemeService);
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.init();
  }
}
