import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    data: {
      seoTitle: 'تقييمي | اختبار تحديد مستوى اللغة الإنجليزية مجاناً بالذكاء الاصطناعي (CEFR)',
      description: 'اكتشف مستواك الحقيقي في اللغة الإنجليزية من A1 إلى C2 عبر اختبار تكيفي ذكي يشمل القواعد، الكتابة، والتحدث الصوتي بالذكاء الاصطناعي وفق معيار CEFR العالمي.',
      robots: 'index, follow',
    },
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        data: {
          seoTitle: 'تسجيل الدخول | منصة تقييمي لاختبار مستوى اللغة الإنجليزية',
          description: 'سجّل دخولك إلى منصة تقييمي لبدء اختبار تحديد مستوى اللغة الإنجليزية بالذكاء الاصطناعي ومتابعة سجل نتائجك وتطورك.',
          robots: 'index, follow',
        },
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        data: {
          seoTitle: 'إنشاء حساب مجاني | منصة تقييمي لاختبار مستوى اللغة الإنجليزية',
          description: 'أنشئ حساباً مجانياً في منصة تقييمي وابدأ اختبار تحديد مستواك في اللغة الإنجليزية من A1 إلى C2 مع تحليل ذكي للكتابة والتحدث.',
          robots: 'index, follow',
        },
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        data: {
          seoTitle: 'استعادة كلمة المرور | منصة تقييمي',
          description: 'استعد كلمة المرور لحسابك في منصة تقييمي لاختبار مستوى اللغة الإنجليزية.',
          robots: 'noindex, nofollow',
        },
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'test-selection',
    canActivate: [authGuard],
    loadComponent: () => import('./features/test-selection/test-selection.component').then(m => m.TestSelectionComponent),
    data: {
      seoTitle: 'اختيار نوع الاختبار | تقييمي',
      description: 'اختر بين اختبار تحديد المستوى الشامل أو اختبار مستوى معين من A1 إلى C2 في اللغة الإنجليزية.',
      robots: 'noindex, nofollow',
    },
  },
  {
    path: 'test',
    canActivate: [authGuard],
    loadComponent: () => import('./features/test/test.component').then(m => m.TestComponent),
    data: {
      seoTitle: 'اختبار اللغة الإنجليزية التفاعلي | تقييمي',
      description: 'اختبار تحديد مستوى اللغة الإنجليزية التفاعلي الشامل للقواعد والكتابة والتحدث.',
      robots: 'noindex, nofollow',
    },
  },
  {
    path: 'result/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/result/result.component').then(m => m.ResultComponent),
    data: {
      seoTitle: 'نتيجة وتقرير الاختبار التفصيلي | تقييمي',
      description: 'تقرير تقييم مستوى اللغة الإنجليزية وفق معيار CEFR مع تحليل نقاط القوة والضعف وتقييم التحدث والكتابة.',
      robots: 'noindex, nofollow',
    },
  },
  {
    path: 'history',
    canActivate: [authGuard],
    loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent),
    data: {
      seoTitle: 'سجل الاختبارات السابقة | تقييمي',
      description: 'استعرض سجل اختباراتك السابقة في اللغة الإنجليزية وتابع تطور مستواك على منصة تقييمي.',
      robots: 'noindex, nofollow',
    },
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    data: {
      seoTitle: 'إعدادات الحساب | تقييمي',
      description: 'إدارة إعدادات حسابك الشخصي في منصة تقييمي.',
      robots: 'noindex, nofollow',
    },
  },
  { path: '**', redirectTo: '' },
];
