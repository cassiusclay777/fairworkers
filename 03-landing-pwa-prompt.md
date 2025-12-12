# Fairworkers UX Overhaul - STEP 3: Landing + PWA

## FOLLOW-UP PROMPT: Landing Page + App Setup

```
@claude "VYGENERUJ landing page + PWA setup:

LANDING PAGE STRUKTURA (max 3 sekce):
1. HERO
   - Video BG (2 sekund, 'práce+peníze')
   - H1: 'Práce na míru. Bez čekání.'
   - Subheading: 'Zaregistruj se, pracuj, dostań peníze.'
   - CTA: 'Začít (1 klik)' [HeroButton]

2. PROOF
   - 2 screenshots (registrace + earnings)
   - Social proof: '85% vydělávajících'
   - Real numbers (if available)

3. CTA SECTION
   - Google OAuth button
   - Phone input backup
   - Privacy disclaimer

PERFORMANCE METRICS:
- LCP <1s
- CLS <0.1
- FID <50ms

PWA SETUP:
1. manifest.json (app name, icons, colors, theme)
2. service-worker.ts (cache-first for images, network-first for API)
3. _app.tsx hook (registerServiceWorker)
4. next.config.js (next-pwa plugin config)

FEATURES:
- Offline job list (cached)
- Push notifications (job alerts)
- Home screen install prompt
- Custom splash screen

OUTPUT:
- app/(landing)/page.tsx
- public/manifest.json
- public/service-worker.ts
- next.config.js (updated)
- globals.css (animations)

OPTIMALIZACE:
- Image component <Image> (Next.js)
- Dynamic imports pro komponenty
- CSS modules kde je to potřeba"
```

## Jak to použít

1. Ctrl+L v VS Code
2. Napiš: `@file 03-landing-pwa-prompt.md → "Generuj landing page + PWA."`
3. Enter
4. Claude vygeneruje vše v jednom go

## Co si pak vezmeš

- `app/page.tsx` → nahrad existující
- `public/manifest.json` → nový
- `public/service-worker.ts` → nový
- `next.config.js` → update
- `globals.css` → merge animace

---

## 🎯 COMPLETE WORKFLOW (4 HODINY CELKEM)

```
13:00 - Ctrl+L → @file 01-master-prompt.md (5 min)
13:05 - Review wireframes + copy do Figma (10 min)

13:15 - Ctrl+L → @file 02-components-prompt.md (15 min)
13:30 - Kopíruj komponenty do src/components/ (10 min)

13:40 - Ctrl+L → @file 03-landing-pwa-prompt.md (20 min)
14:00 - Integruj do projektu + test (20 min)

14:20 - pnpm dev (localhost:3000 kontrola) (10 min)
14:30 - Lighthouse check + tweaks (15 min)

15:00 - vercel --prod (2 min)
15:02 - 🎉 LIVE
```

---

**CELKOVÝ ČAS: 4 HODINY | READY: ANO** ✅
