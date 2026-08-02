# تشغيل التوليد الكامل

## 1) مفتاح Gemini (إلزامي)

1. افتح: https://aistudio.google.com/apikey
2. سجّل الدخول بحساب Google
3. Create API Key
4. انسخ المفتاح إلى `.env`:

```env
GEMINI_API_KEY="AIza..."
```

5. أعد تشغيل السيرفر: `npm run dev`

## 2) قاعدة البيانات

```bash
npx prisma generate
npx prisma db push
```

## 3) التحقق

افتح: http://localhost:3000/api/health

يجب أن يظهر `"generateReady": true`

## 4) اختبار من اللوحة

- سجّل دخولاً
- افتح قسم الدردشة أو مولد النصوص
- اكتب طلباً واضغط توليد (يُخصم 5 Credits)
