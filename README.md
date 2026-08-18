# تقييمي — Taqyeemy 🎓

منصة اختبار مستوى اللغة الإنجليزية بالذكاء الاصطناعي وفق الإطار الأوروبي المرجعي (CEFR).

---

## 🛠️ التقنيات المستخدمة

| الطبقة | التقنية |
|---|---|
| Frontend | Angular 19 + Angular Material (M3) |
| Backend | NestJS + TypeScript |
| Auth & DB | Supabase (Auth + PostgreSQL + RLS) |
| AI | Google Gemini 2.5 Flash |

---

## 📁 هيكل المشروع

```
taqyeemy/
├── frontend/   # Angular 19 — واجهة المستخدم العربية
└── backend/    # NestJS — API والذكاء الاصطناعي
```

---

## 🚀 تشغيل المشروع محلياً

### المتطلبات
- Node.js v18+
- Angular CLI v19+
- حساب Supabase
- مفتاح Google Gemini API

### 1. إعداد الباك إند

```bash
cd backend
npm install
cp .env.example .env
# عدّل ملف .env بقيم Supabase و Gemini الخاصة بك
npm run start:dev
```

### 2. إعداد الفرونت إند

```bash
cd frontend
npm install
ng serve --port=4200
```

### 3. إعداد قاعدة البيانات

شغّل ملف `backend/supabase-schema.sql` في **Supabase SQL Editor**.

---

## ✨ المميزات

- 🔐 تسجيل دخول وإنشاء حساب عبر Supabase Auth
- 📝 اختبار تحديد المستوى (A1 → C2) — 18 سؤالاً متدرجاً
- 🎯 اختبار مستوى محدد (A1 / A2 / B1 / B2 / C1 / C2)
- 🤖 تقييم ذكي بـ Gemini 2.5 Flash مع نقاط القوة والضعف بالعربية
- 📊 سجل النتائج والتاريخ
- 🔒 حماية البيانات بـ Row Level Security (RLS)
- 🌐 واجهة عربية بالكامل مع دعم RTL
