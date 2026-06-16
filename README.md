# Al Rayyan Cars Admin

نظام إدارة داخلي منفصل لمكتب الريان كار.

هذا المشروع مستقل عن موقع التسويق العام ولا يضيف أي مسارات `/admin` داخله.

## التشغيل

يستخدم نفس قاعدة بيانات موقع التسويق:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:55432/car_rental
AUTH_SESSION_SECRET=replace-with-a-random-secret-at-least-32-characters
```

لتطبيق schema:

```bash
npm run db:schema
```

## ملاحظات قبل الإنتاج

- غيّر `AUTH_SESSION_SECRET` لقيمة قوية لا تقل عن 32 حرفاً.
- غيّر كلمة مرور حساب المدير الافتراضي فوراً من صفحة الموظفين.
- لا تعتمد على `public/uploads` كمساحة تخزين دائمة في استضافة serverless. استخدم Storage دائم مثل S3 أو Cloudinary أو Supabase Storage.
- ملفات PDF للفواتير يتم تحميلها للعميل فقط ولا يتم حفظها على السيرفر.
- لا ترفع ملف `.env.local` أو أي ملفات داخل `public/uploads/customers`, `public/uploads/invoices`, `public/uploads/receipts`, `public/uploads/rentals`.

## الجداول الأساسية

تم إضافة PostgreSQL schema للجداول:

- `employees`
- `customers`
- `rentals`
- `payments`
- `invoices`
