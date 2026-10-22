import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);

  private readonly baseUrl = 'https://taqyeemy11.pages.dev';
  private readonly defaultTitle = 'تقييمي | اختبار تحديد مستوى اللغة الإنجليزية مجاناً بالذكاء الاصطناعي (CEFR)';
  private readonly defaultDescription =
    'منصة تقييمي: اختبر وحدد مستواك في اللغة الإنجليزية مجاناً بالذكاء الاصطناعي وفق معيار CEFR العالمي (من A1 إلى C2). تقييم شامل للقواعد والمفردات والكتابة والتحدث الصوتي.';

  init(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        let route = this.activatedRoute.root;
        while (route.firstChild) {
          route = route.firstChild;
        }

        const data = route.snapshot.data || {};
        const pageTitle: string = data['seoTitle'] || this.defaultTitle;
        const pageDescription: string = data['description'] || this.defaultDescription;
        const robots: string = data['robots'] || 'index, follow';

        const cleanPath = event.urlAfterRedirects.split('?')[0].split('#')[0];
        const canonicalUrl = `${this.baseUrl}${cleanPath === '/' ? '/' : cleanPath}`;

        this.title.setTitle(pageTitle);
        this.meta.updateTag({ name: 'description', content: pageDescription });
        this.meta.updateTag({ name: 'robots', content: robots });

        this.meta.updateTag({ property: 'og:title', content: pageTitle });
        this.meta.updateTag({ property: 'og:description', content: pageDescription });
        this.meta.updateTag({ property: 'og:url', content: canonicalUrl });

        this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
        this.meta.updateTag({ name: 'twitter:description', content: pageDescription });

        this.updateCanonicalLink(canonicalUrl);
      });
  }

  private updateCanonicalLink(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
