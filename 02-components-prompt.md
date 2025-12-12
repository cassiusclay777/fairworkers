# Fairworkers UX Overhaul - STEP 2: Components

## FOLLOW-UP PROMPT: Components + Design System

```
@claude "VYGENERUJ shadcn/ui komponenty dle wireframů:

KOMPONENTY (10 max):
1. HeroButton (64px height, full-width, accent color)
2. JobCard (swipeable, image, title, pay, +15% badge)
3. GoogleAuthButton (OAuth flow)
4. BalanceDisplay (earnings animované counter)
5. SwipeContainer (Framer Motion gesture detection)
6. BottomSheet (job details modal)
7. VoiceInput (Web Speech API)
8. NotificationBell (PWA push)
9. ProgressBar (registration funnel)
10. EmptyState (fallback UI)

DESIGN SYSTEM:
- Primary: #000000 (black)
- Accent: #FF4081 (magenta)
- Background: #FFFFFF
- Text: #1A1A1A
- Contrast: 15:1 WCAG AAA

TYPOGRAFIE:
- Heading: SF Pro Display, weight 900, size 48px
- Body: -apple-system, weight 500, size 16px
- Line height: 1.2 (tight)

OUTPUT FORMAT:
- Tailwind config (kopíruj do tailwind.config.ts)
- Každá komponenta jako .tsx soubor
- Storybook stories (optional)

PRIORITY: HeroButton + JobCard (ostatní lze později)"
```

## Jak to použít

1. Ctrl+L v VS Code
2. Napiš: `@file 02-components-prompt.md → "Generuj komponenty."`
3. Enter
4. Claude vygeneruje:
   - 10 React komponenty (.tsx)
   - Tailwind config
   - Storybook setup

## Co si pak vezmeš

- Všechny `.tsx` komponenty → `src/components/`
- `tailwind.config.ts` → přepsat lokální
- Storybook `*.stories.tsx` → `src/stories/`

---

**ČAS: 15 minut | READY: ANO** ✅
