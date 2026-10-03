# تشغيل PayPal في منصة محمد الحزمي AI

## ما تم بناؤه

- `POST /api/payment/paypal/create`: ينشئ PayPal Order مرتبطاً بالمستخدم والخطة أو حزمة REMO.
- `POST /api/payment/paypal/capture`: يلتقط الدفع بعد عودة المستخدم من PayPal، ويتحقق من حالة `COMPLETED` ثم يشحن الرصيد أو يفعّل الاشتراك.
- `POST /api/payment/paypal/webhook`: يتحقق من توقيع PayPal Webhook ويمنع الشحن المكرر.
- الشحن idempotent: إذا كانت الدفعة مكتملة فلن تُشحن مرة أخرى.
- خطط إضافية: **Creator** و **Enterprise**.

## المتغيرات المطلوبة في Vercel

أضفها إلى بيئة **Preview** أولاً:

```text
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_ENV=sandbox
PAYPAL_WEBHOOK_ID=...
NEXT_PUBLIC_APP_URL=https://mohammed-alhazmi-ai-complete-1.vercel.app
PAYPAL_RETURN_URL=https://mohammed-alhazmi-ai-complete-1.vercel.app/dashboard/billing?paypal=success
PAYPAL_CANCEL_URL=https://mohammed-alhazmi-ai-complete-1.vercel.app/dashboard/billing?paypal=cancelled
```

لا تضع `PAYPAL_CLIENT_SECRET` داخل GitHub أو في متغير يبدأ بـ `NEXT_PUBLIC_`.

## اختبار Sandbox

1. أنشئ PayPal Developer App من حساب PayPal التجاري.
2. استخدم Client ID وSecret الخاصة بـ **Sandbox**.
3. اجعل `PAYPAL_ENV=sandbox`.
4. أنشئ Webhook بعنوان:
   `https://mohammed-alhazmi-ai-complete-1.vercel.app/api/payment/paypal/webhook`
5. فعّل الحدث:
   `PAYMENT.CAPTURE.COMPLETED`
6. ضع Webhook ID في `PAYPAL_WEBHOOK_ID`.
7. استخدم حساب PayPal Sandbox كمشتري، وليس الحساب التجاري الحقيقي.
8. اختبر خطة أو حزمة منخفضة القيمة، ثم تحقق من:
   - حالة Payment في قاعدة البيانات.
   - زيادة `paidCredits`.
   - إنشاء WalletTransaction.
   - تحديث Subscription للخطة.

## التحويل إلى الدفع الحقيقي

بعد نجاح Sandbox فقط:

```text
PAYPAL_ENV=live
PAYPAL_CLIENT_ID=<Live Client ID>
PAYPAL_CLIENT_SECRET=<Live Secret>
PAYPAL_WEBHOOK_ID=<Live Webhook ID>
```

أنشئ Webhook منفصلاً في بيئة Live، ولا تعِد استخدام Webhook Sandbox.

## ملاحظة مهمة

ربط حساب PayPal داخل محادثة Manus لا يضيف تلقائياً مفاتيح PayPal REST إلى مشروع Vercel. التكامل البرمجي جاهز، لكن لا يمكن تفعيل استقبال الأموال الحقيقي قبل إضافة بيانات PayPal Developer App إلى Vercel والتحقق من Sandbox.
