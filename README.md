# ماشین حساب سه‌تمه ✨ APK Ready

ماشین حساب فارسی زیبا با **۳ تم مختلف**: روشن ☀️ · تاریک 🌙 · نئون ⚡

**نسخه 2.0 – حالا با خروجی اندروید (APK) via Capacitor**

ساخته شده با HTML, CSS و JavaScript خالص – بدون وابستگی – + Capacitor برای APK

## ویژگی‌ها

- 🎨 **۳ تم کامل:**
  - **روشن (Light)** – تمیز و مینیمال
  - **تاریک (Dark)** – بنفش گرادینت
  - **نئون (Neon)** – سایبرپانک glow واقعی
  
- 📱 **نسخه اندروید APK آماده**
  - Capacitor 8
  - PWA installable
  - آیکون اختصاصی
  - Service Worker آفلاین

- 💾 ذخیره خودکار تم
- ⌨️ کیبورد کامل
- 📱 ریسپانسیو

## اجرای لایو (وب)

```bash
npm run dev
# http://localhost:8080
```

سرور live reload فعال است.

## ساخت APK

### روش ۱ – Android Studio (ساده‌ترین – ۲ دقیقه)
```bash
npm install
npm run android
# Android Studio باز می‌شود
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```
APK در:
`android/app/build/outputs/apk/debug/app-debug.apk`

### روش ۲ – GitHub Actions (اتوماتیک – بدون نصب SDK)
1. پوش به GitHub
2. تب Actions → workflow "Build Android APK" اجرا می‌شود
3. Artifact `calculator-pro-debug` را دانلود کنید → فایل `app-debug.apk` آماده نصب

فایل workflow آماده است: `.github/workflows/android.yml`

### روش ۳ – خط فرمان (اگر JDK + Android SDK دارید)
```bash
npm run sync
cd android
./gradlew assembleDebug
```

## نصب PWA

در کروم موبایل: منو ⋮ → **Install app / افزودن به صفحه اصلی**

- آفلاین کار می‌کند (Service Worker)
- تمام صفحه – مثل اپ نیتیو

## ساختار

```
calculator-app/
├── index.html              # اپ اصلی
├── css/style.css           # ۳ تم
├── js/app.js
├── manifest.json           # PWA
├── sw.js                   # Service Worker آفلاین
├── icons/                  # آیکون 72 → 512
├── www/                    # خروجی وب برای Capacitor
├── android/                # پروژه اندروید Capacitor
│   ├── app/
│   └── gradlew
├── capacitor.config.json
└── .github/workflows/android.yml  # بیلد اتومات APK
```

## اطلاعات APK

- **App ID:** `com.calculatorpro.app`
- **App Name:** Calculator Pro
- **minSdkVersion:** 22 (Android 5.1+)
- **targetSdkVersion:** 35
- **Permissions:** INTERNET (فقط برای Capacitor، اپ کاملا آفلاین کار می‌کند)

## میانبرها

- `Ctrl + T` → تغییر تم
- `Enter` → مساوی
- `Esc` → پاک
- `Backspace` → حذف

لذت ببرید! 🚀
