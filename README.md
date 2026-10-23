# 🎓 منصة تقييمي (Taqyeemy) — AI-Powered CEFR English Assessment Platform

منصة ويب عربية متكاملة لتحديد وتقييم مستوى اللغة الإنجليزية وفق **الإطار الأوروبي المرجعي المشترك للغات (CEFR)** من المستوى **A1** حتى **C2**، مدعومة بالذكاء الاصطناعي (**Google Gemini 2.5 Flash**) لتقييم مهارات **القواعد والمفردات (MCQ)**، **الكتابة التعبيرية (Writing)**، و**التحدث الصوتي (Speaking)** مع تقرير تحليلي شامل باللغة العربية.

---

## 🌐 الروابط الحية (Live Demo)

- **الواجهة الأمامية (Frontend — Cloudflare Pages):** [https://taqyeemy11.pages.dev](https://taqyeemy11.pages.dev)
- **الخادم الخلفي (Backend API — Vercel Serverless):** [https://taqyeemy-backend.vercel.app](https://taqyeemy-backend.vercel.app)

---

## ✨ المميزات الرئيسية (Key Features)

1. **بنك أسئلة ضخم ومتدرج (1,000+ سؤال):**
   - يغطي جميع مستويات CEFR الستة (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`).
   - خوارزمية التوقف الذكي (3 أخطاء في المستوى الحالي تنقل الطالب تلقائياً إلى مرحلة الكتابة والتحدث المناسبة لمستواه).
2. **تقييم شامل لـ 3 مهارات أساسية:**
   - **القواعد والمفردات (Multiple Choice):** تصحيح فوري محمي على السيرفر بدون كشف الإجابات في المتصفح.
   - **الكتابة (Writing):** تقييم آلي للبراجراف المكتوب من حيث القواعد، الترابط، وتنوع المفردات.
   - **التحدث الصوتي (Speaking):** تسجيل مباشر من المايكروفون في المتصفح أو رفع ملف صوتي، مع تفريغ نصي (Transcript) وتقييم من 10 درجات لكل من (القواعد، النطق، الطلاقة، والثقة).
3. **حفظ الجلسة ومكافحة الغش:**
   - حفظ تلقائي لتقدم الطالب في الاختبار عند تحديث الصفحة (`Refresh`).
   - منع النسخ واللصق والقص والقائمة المختصرة داخل شاشة الاختبار.
4. **الأمان والحماية (Security Checklist 14/14):**
   - مصادقة كاملة عبر **Supabase Auth** مع تأكيد البريد الإلكتروني برمز تحقق **OTP (6 أرقام)** وتشفير كلمات المرور بـ `bcrypt`.
   - حماية الصفوف في قاعدة البيانات عبر **Row Level Security (RLS)** و **Parameterized Queries**.
   - تفعيل **Rate Limiting**، **Security Headers**، **CORS Policy**، **Input ValidationPipe**، **Strong Password Enforcement**، و**Captcha** على نماذج الدخول والتسجيل.
5. **تهيئة محركات البحث (SEO Ready):**
   - دعم كامل لـ `sitemap.xml`، `robots.txt`، `manifest.webmanifest`، وبيانات `JSON-LD Schema.org` مع تحديث ديناميكي للعناوين والوصف عبر `SeoService`.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

| الطبقة | التقنية |
|---|---|
| **Frontend** | Angular (Standalone Components, Signals, Zoneless Change Detection), Angular Material, TypeScript, SCSS |
| **Backend** | NestJS 11, TypeScript, Class-Validator, Multer |
| **Database & Auth** | Supabase (PostgreSQL + Auth OTP + RLS) |
| **AI Engine** | Google Generative AI (`gemini-2.5-flash`) + Smart Fallback Evaluator |
| **Deployment** | Cloudflare Pages (Frontend) + Vercel Serverless (Backend) |

---

## 🚀 طريقة التشغيل محلياً (Local Setup)

### 1. المتطلبات المسبقة
- **Node.js** (إصدار 20 أو أحدث)
- حساب مشروع على **Supabase**
- مفتاح API من **Google AI Studio (Gemini)**

### 2. إعداد الباك إند (`backend/`)
```bash
cd backend
npm install
cp .env.example .env
```
قم بملء المتغيرات داخل ملف `backend/.env`:
```env
PORT=3000
FRONTEND_URL=http://localhost:4200
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```
ثم شغّل السيرفر:
```bash
npm run start:dev
```

### 3. إعداد الفرونت إند (`frontend/`)
```bash
cd frontend
npm install
npm start
```
سيعمل الموقع محلياً على الرابط: `http://localhost:4200`.

---

## 📦 البناء للإنتاج (Production Build)

```bash
# بناء الباك إند
npm --prefix backend run build

# بناء الفرونت إند
npm --prefix frontend run build
```
مخرجات الفرونت إند الجاهزة للنشر تكون داخل `frontend/dist/browser`.
