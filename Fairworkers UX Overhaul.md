# FAIRWORKERS UX OVERHAUL 2025
**Mission: 5% → 45% Conversion | Mobile-First | 1-Click Signup**

---

## 📊 BUSINESS OBJECTIVES

| Metric | Current | Target | Growth |
|--------|---------|--------|--------|
| Conversion Rate | 5% | 45% | 9x |
| Signup Time | ~3 min | <10 sec | 18x faster |
| Mobile Traffic | 60% | 85% | Primary focus |
| Voice Search | 0% | 25% | New channel |

---

## 🎨 WIREFRAMES (ASCII ART)

### 1. LANDING PAGE - Hero + Instant CTA
```
┌─────────────────────────────────────┐
│  ☰  FAIRWORKERS      [Sign In] 👤  │
├─────────────────────────────────────┤
│                                     │
│     🎯 Find Your Dream Gig         │
│        in 60 Seconds                │
│                                     │
│   [🎙️ Try "Designer near me"]      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🔵 Continue with Google    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐       │
│  │ 💼│  │ 🎨│  │ 💻│  │ 📸│       │
│  └───┘  └───┘  └───┘  └───┘       │
│  Sales  Design  Dev  Photo         │
│                                     │
│  ────────────────────────────────  │
│                                     │
│  ⭐ "Earned $5K in 1st month"      │
│     - Jana K., Graphic Designer    │
│                                     │
│  📊 Live Stats:                    │
│  • 12,450 active workers           │
│  • 89% avg satisfaction            │
│  • $2.1M paid this month           │
│                                     │
└─────────────────────────────────────┘
       ┌───┬───┬───┬───┬───┐
       │🏠 │🔍 │➕ │💬 │👤 │  ← Bottom Nav
       └───┴───┴───┴───┴───┘
```

**Key Features:**
- Voice search input (primary CTA)
- Google OAuth button (no email form)
- Category quick links (4 top categories)
- Social proof (live testimonial)
- Real-time stats (trust signals)

---

### 2. JOB BOARD - Tinder-Style Swipe Cards
```
┌─────────────────────────────────────┐
│  ← Jobs Near You (12)    [Filter]⚙️│
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ╔═══════════════════════╗   │   │
│  │ ║  👩‍💼 Sarah Martinez    ║   │   │
│  │ ║  UX/UI Designer        ║   │   │
│  │ ║  ⭐ 4.9 (127 reviews)  ║   │   │
│  │ ╚═══════════════════════╝   │   │
│  │                             │   │
│  │  📍 Prague 2 (1.2 km)       │   │
│  │  💰 $45-65/hour             │   │
│  │  ⏰ Available today          │   │
│  │                             │   │
│  │  🎨 Portfolio (8)           │   │
│  │  [img][img][img][img]       │   │
│  │                             │   │
│  │  ✨ "Award-winning designs" │   │
│  │     Fast turnaround         │   │
│  └─────────────────────────────┘   │
│                                     │
│     ┌───┐         ┌───┐            │
│     │ ❌ │         │ 💚 │            │
│     └───┘         └───┘            │
│     PASS          BOOK             │
│                                     │
│  ○○○●○○○ (Card 4/7)                │
└─────────────────────────────────────┘
       ┌───┬───┬───┬───┬───┐
       │🏠 │🔍 │➕ │💬 │👤 │
       └───┴───┴───┴───┴───┘
```

**Swipe Gestures:**
- **Swipe Right** → Instant booking modal
- **Swipe Left** → Next card
- **Tap Card** → Full profile
- **Pull Down** → Refresh feed

**Card Data Hierarchy:**
1. Photo + Name + Rating (3s decision)
2. Location + Price (dealbreakers)
3. Availability (urgency)
4. Portfolio preview (trust)

---

### 3. USER PROFILE - Earnings Dashboard
```
┌─────────────────────────────────────┐
│  ← Profile              [⚙️Settings]│
├─────────────────────────────────────┤
│   ┌────┐                            │
│   │ 👤 │  Anna Nováková             │
│   └────┘  ⭐ 4.8 (94 reviews)       │
│           🔵 Verified Pro            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 💰 THIS MONTH               │   │
│  │                             │   │
│  │    $3,240                   │   │
│  │    ▲ 23% vs last month      │   │
│  │                             │   │
│  │  ████████░░░░ 67% to $5K    │   │
│  └─────────────────────────────┘   │
│                                     │
│  📊 Quick Stats                     │
│  ┌──────┬──────┬──────┐            │
│  │  42  │ 4.8⭐│ 98%  │            │
│  │ Jobs │Rating│ Rate │            │
│  └──────┴──────┴──────┘            │
│                                     │
│  🎯 Active Gigs (3)                 │
│  ┌─────────────────────────────┐   │
│  │ Logo Design • Due in 2h     │   │
│  │ ████████████░░ 85%          │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Website Mockup • 1 day left │   │
│  │ ██████░░░░░░░░ 40%          │   │
│  └─────────────────────────────┘   │
│                                     │
│  💳 Quick Actions                   │
│  [💸 Withdraw] [📊 Analytics]       │
│  [🎨 Portfolio] [📣 Promote]        │
│                                     │
└─────────────────────────────────────┘
       ┌───┬───┬───┬───┬───┐
       │🏠 │🔍 │➕ │💬 │👤 │
       └───┴───┴───┴───┴───┘
```

**Gamification Elements:**
- Progress bar to next earnings milestone
- Achievement badges (Verified Pro)
- Completion percentage on active gigs
- Real-time earnings counter

---

## 🎯 USER FLOW DIAGRAM

```
┌────────────┐
│  Landing   │
│   Screen   │
└─────┬──────┘
      │
      ├─────────────┐
      │             │
┌─────▼──────┐ ┌───▼────────┐
│ Voice      │ │ Google     │
│ Search     │ │ OAuth      │
└─────┬──────┘ └───┬────────┘
      │            │
      │      ┌─────▼──────┐
      │      │ Permission │
      │      │ Screen     │
      │      └─────┬──────┘
      │            │
      └────────┬───┘
               │
         ┌─────▼──────┐
         │ Job Board  │
         │ (Swipe)    │
         └─────┬──────┘
               │
        ┌──────┼──────┐
        │      │      │
   ┌────▼─┐ ┌─▼──┐ ┌─▼────┐
   │Swipe │ │Tap │ │Filter│
   │Right │ │Card│ │      │
   └────┬─┘ └─┬──┘ └──────┘
        │     │
   ┌────▼─────▼──┐
   │ Booking     │
   │ Modal       │
   └────┬────────┘
        │
   ┌────▼────────┐
   │ Payment     │
   │ (1-Click)   │
   └────┬────────┘
        │
   ┌────▼────────┐
   │ Confirmation│
   │ + Chat      │
   └─────────────┘
```

**Critical Path:**
1. **Land** → 0s
2. **Sign In** → 3s (Google OAuth)
3. **Browse** → 5s (see first card)
4. **Swipe** → 8s (first decision)
5. **Book** → 12s (payment)
6. **Confirm** → 15s ✅

**Target: 15 seconds from landing to first booking.**

---

## 🧩 10 ATOMIC COMPONENTS

### 1. **SwipeCard** (`components/ui/swipe-card.tsx`)
```typescript
interface SwipeCardProps {
  worker: Worker;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTap: () => void;
}
```
**Features:**
- Gesture detection (Framer Motion)
- Spring animations
- Loading skeleton
- Image lazy loading

---

### 2. **VoiceSearchInput** (`components/ui/voice-search.tsx`)
```typescript
interface VoiceSearchProps {
  placeholder: string;
  onVoiceInput: (transcript: string) => void;
  onTextInput: (text: string) => void;
}
```
**Features:**
- Web Speech API
- Real-time transcription
- Fallback to text input
- Mic permission handling

---

### 3. **GoogleOAuthButton** (`components/auth/google-oauth.tsx`)
```typescript
interface OAuthButtonProps {
  onSuccess: (user: User) => void;
  onError: (error: Error) => void;
}
```
**Features:**
- Supabase Auth integration
- Loading state
- Error handling
- Brand guidelines compliance

---

### 4. **EarningsWidget** (`components/dashboard/earnings-widget.tsx`)
```typescript
interface EarningsWidgetProps {
  currentMonth: number;
  previousMonth: number;
  goal: number;
}
```
**Features:**
- Animated counter (react-spring)
- Progress bar
- Percentage change indicator
- Currency formatting

---

### 5. **BottomNavigation** (`components/layout/bottom-nav.tsx`)
```typescript
interface BottomNavProps {
  activeTab: 'home' | 'search' | 'add' | 'messages' | 'profile';
  onTabChange: (tab: string) => void;
}
```
**Features:**
- Active state indicator
- Haptic feedback (mobile)
- Badge notifications
- Safe area insets

---

### 6. **CategoryPill** (`components/ui/category-pill.tsx`)
```typescript
interface CategoryPillProps {
  icon: string;
  label: string;
  count?: number;
  isActive?: boolean;
  onClick: () => void;
}
```
**Features:**
- Hover/active states
- Icon + text layout
- Optional count badge
- Keyboard navigation

---

### 7. **StatsCard** (`components/ui/stats-card.tsx`)
```typescript
interface StatsCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  trend?: 'up' | 'down';
  trendValue?: number;
}
```
**Features:**
- Large number typography
- Trend indicator
- Icon support
- Compact layout

---

### 8. **BookingModal** (`components/booking/booking-modal.tsx`)
```typescript
interface BookingModalProps {
  worker: Worker;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (booking: BookingData) => void;
}
```
**Features:**
- Date/time picker
- Price calculator
- Payment method selector
- Form validation

---

### 9. **PortfolioGrid** (`components/ui/portfolio-grid.tsx`)
```typescript
interface PortfolioGridProps {
  images: string[];
  maxVisible?: number;
  onImageClick: (index: number) => void;
}
```
**Features:**
- Masonry layout
- Lightbox integration
- Lazy loading
- +N more indicator

---

### 10. **LoadingSkeleton** (`components/ui/skeleton.tsx`)
```typescript
interface SkeletonProps {
  variant: 'card' | 'text' | 'avatar' | 'button';
  count?: number;
  animation?: 'pulse' | 'wave';
}
```
**Features:**
- Multiple variants
- Shimmer animation
- Accessible (aria-busy)
- Customizable dimensions

---

## 🎨 FIGMA DESIGN SYSTEM

### Color Palette
```css
/* Primary - Vibrant Blue (Trust + Energy) */
--primary-50: #EFF6FF;
--primary-100: #DBEAFE;
--primary-500: #3B82F6;
--primary-600: #2563EB;
--primary-900: #1E3A8A;

/* Success - Green (Money + Positive) */
--success-50: #F0FDF4;
--success-500: #10B981;
--success-600: #059669;

/* Warning - Amber (Urgency) */
--warning-50: #FFFBEB;
--warning-500: #F59E0B;

/* Error - Red (Caution) */
--error-50: #FEF2F2;
--error-500: #EF4444;

/* Neutral - Slate (Text + Backgrounds) */
--neutral-50: #F8FAFC;
--neutral-100: #F1F5F9;
--neutral-500: #64748B;
--neutral-900: #0F172A;
```

### Typography Scale
```css
/* Font Family */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-display: 'Cal Sans', 'Inter', sans-serif;

/* Sizes (Mobile-First) */
--text-xs: 0.75rem;    /* 12px - Labels */
--text-sm: 0.875rem;   /* 14px - Body */
--text-base: 1rem;     /* 16px - Primary */
--text-lg: 1.125rem;   /* 18px - Subheading */
--text-xl: 1.25rem;    /* 20px - Heading */
--text-2xl: 1.5rem;    /* 24px - Hero */
--text-4xl: 2.25rem;   /* 36px - Display */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing System (4px Base Grid)
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
```

### Border Radius
```css
--radius-sm: 0.375rem;  /* 6px - Buttons */
--radius-md: 0.5rem;    /* 8px - Cards */
--radius-lg: 0.75rem;   /* 12px - Modals */
--radius-xl: 1rem;      /* 16px - Featured */
--radius-full: 9999px;  /* Pills */
```

### Shadows (Material Design Inspired)
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

## 🔧 TECH IMPLEMENTATION

### App.tsx Refactor Plan

**Current Issues:**
- Monolithic component structure
- No code splitting
- Poor mobile performance
- Mixed concerns (auth, routing, data)

**New Architecture:**
```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx          # Google OAuth + Voice
│   └── layout.tsx             # Auth shell
├── (main)/
│   ├── layout.tsx             # Bottom nav wrapper
│   ├── page.tsx               # Job board (swipe cards)
│   ├── profile/
│   │   └── page.tsx           # Earnings dashboard
│   ├── search/
│   │   └── page.tsx           # Advanced filters
│   └── messages/
│       └── page.tsx           # Chat interface
├── api/
│   ├── auth/
│   │   └── route.ts           # Supabase callbacks
│   └── workers/
│       └── route.ts           # Job listings API
└── layout.tsx                 # Root layout
```

**Key Changes:**
1. **App Router** (Next.js 15)
   - Route groups for auth/main
   - Parallel routes for modals
   - Server Components by default

2. **State Management**
   - Zustand for global state
   - React Query for server state
   - Local storage for preferences

3. **Data Fetching**
   ```typescript
   // app/(main)/page.tsx
   import { getWorkers } from '@/lib/api';

   export default async function JobBoard() {
     const workers = await getWorkers();
     return <SwipeCards workers={workers} />;
   }
   ```

---

### globals.css (Tailwind 4 Ready)

```css
@import "tailwindcss";

/* Design Tokens */
@theme {
  /* Colors from design system above */
  --color-primary-*: ...;

  /* Typography */
  --font-sans: 'Inter', system-ui;
  --font-display: 'Cal Sans', 'Inter';

  /* Spacing (inherited from Tailwind) */
  /* Shadows (inherited from Tailwind) */
}

/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  /* 62.5% = 10px base for easier rem calc */
  font-size: 100%; /* Keep 16px for accessibility */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  background: var(--neutral-50);
  color: var(--neutral-900);
  overflow-x: hidden;
}

/* Mobile Safe Areas (iPhone notch/home indicator) */
@supports (padding: env(safe-area-inset-bottom)) {
  .bottom-nav {
    padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
  }
}

/* Swipe Card Animations */
@keyframes swipe-right {
  to {
    transform: translateX(200%) rotate(20deg);
    opacity: 0;
  }
}

@keyframes swipe-left {
  to {
    transform: translateX(-200%) rotate(-20deg);
    opacity: 0;
  }
}

/* Voice Input Pulse */
@keyframes pulse-mic {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.mic-active {
  animation: pulse-mic 1.5s ease-in-out infinite;
}

/* Loading Skeleton Shimmer */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--neutral-100) 25%,
    var(--neutral-200) 50%,
    var(--neutral-100) 75%
  );
  background-size: 2000px 100%;
  animation: shimmer 2s infinite linear;
}
```

---

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          900: '#1E3A8A',
        },
        success: {
          50: '#F0FDF4',
          500: '#10B981',
          600: '#059669',
        },
        // ... other colors
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        display: ['var(--font-display)', ...fontFamily.sans],
      },
      animation: {
        'swipe-right': 'swipe-right 0.3s ease-out',
        'swipe-left': 'swipe-left 0.3s ease-out',
        'pulse-mic': 'pulse-mic 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
```

---

## 📱 PWA CONFIGURATION

### manifest.json
```json
{
  "name": "Fairworkers - Find Gigs Fast",
  "short_name": "Fairworkers",
  "description": "Book verified freelancers in 60 seconds",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/swipe.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "categories": ["business", "productivity"],
  "shortcuts": [
    {
      "name": "Find Jobs",
      "url": "/search",
      "icons": [{ "src": "/icons/search-96.png", "sizes": "96x96" }]
    },
    {
      "name": "My Earnings",
      "url": "/profile",
      "icons": [{ "src": "/icons/wallet-96.png", "sizes": "96x96" }]
    }
  ]
}
```

### service-worker.ts (Workbox)
```typescript
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses (jobs, workers)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/workers'),
  new StaleWhileRevalidate({
    cacheName: 'api-workers',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 }), // 5 min
    ],
  })
);

// Cache images (portfolio, avatars)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }), // 30 days
    ],
  })
);

// Offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html'))
    );
  }
});
```

---

## ✅ MOBILE PERFORMANCE CHECKLIST

### Critical Metrics (iPhone SE Baseline)
- [ ] **Largest Contentful Paint (LCP)** < 2.5s
- [ ] **First Input Delay (FID)** < 100ms
- [ ] **Cumulative Layout Shift (CLS)** < 0.1
- [ ] **Time to Interactive (TTI)** < 3.5s

### Image Optimization
- [ ] Use Next.js `<Image>` component (auto WebP)
- [ ] Lazy load images below fold
- [ ] Responsive images (srcset)
- [ ] Placeholder blur (LQIP)
- [ ] Max 80% quality for JPEGs

### JavaScript Bundle
- [ ] Code splitting per route
- [ ] Dynamic imports for heavy components
- [ ] Tree-shake unused libraries
- [ ] Bundle size < 200KB (initial)
- [ ] Compress with Brotli

### CSS Optimization
- [ ] Critical CSS inlined
- [ ] Unused CSS purged (Tailwind)
- [ ] CSS-in-JS avoided (use Tailwind)
- [ ] Font subsetting (Google Fonts)

### Network
- [ ] HTTP/2 enabled
- [ ] CDN for static assets
- [ ] API response compression (gzip)
- [ ] Service Worker caching
- [ ] Prefetch critical resources

### Rendering
- [ ] Server Components (Next.js 15)
- [ ] Virtualized lists (react-window)
- [ ] Debounced search inputs
- [ ] Optimistic UI updates
- [ ] Skeleton screens (no spinners)

### Mobile-Specific
- [ ] Touch target size ≥ 44x44px
- [ ] Viewport meta tag set
- [ ] No horizontal scroll
- [ ] Safe area insets (notch)
- [ ] Disable 300ms tap delay

### Accessibility
- [ ] ARIA labels on interactive elements
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Keyboard navigation
- [ ] Screen reader tested (VoiceOver)
- [ ] Focus indicators visible

---

## 📐 COMPONENT STORYBOOK SETUP

### .storybook/main.ts
```typescript
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/nextjs',
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

### Example Story: SwipeCard
```typescript
// components/ui/swipe-card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SwipeCard } from './swipe-card';

const meta: Meta<typeof SwipeCard> = {
  title: 'UI/SwipeCard',
  component: SwipeCard,
  tags: ['autodocs'],
  argTypes: {
    onSwipeLeft: { action: 'swiped left' },
    onSwipeRight: { action: 'swiped right' },
    onTap: { action: 'tapped' },
  },
};

export default meta;
type Story = StoryObj<typeof SwipeCard>;

export const Default: Story = {
  args: {
    worker: {
      id: '1',
      name: 'Sarah Martinez',
      role: 'UX/UI Designer',
      rating: 4.9,
      reviewCount: 127,
      location: 'Prague 2',
      distance: 1.2,
      hourlyRate: [45, 65],
      availability: 'today',
      portfolio: ['/img1.jpg', '/img2.jpg'],
      tagline: 'Award-winning designs with fast turnaround',
    },
  },
};

export const Loading: Story = {
  args: {
    worker: undefined, // Show skeleton
  },
};
```

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1)
- [x] Wireframes + user flow
- [ ] Design system setup (Tailwind config)
- [ ] Component library scaffolding
- [ ] Storybook configuration

### Phase 2: Core Components (Week 2)
- [ ] SwipeCard + gesture detection
- [ ] VoiceSearchInput + Web Speech API
- [ ] GoogleOAuthButton + Supabase
- [ ] BottomNavigation
- [ ] LoadingSkeleton

### Phase 3: Screens (Week 3)
- [ ] Landing page (hero + CTA)
- [ ] Job board (swipe interface)
- [ ] User profile (earnings dashboard)
- [ ] Booking modal

### Phase 4: Polish (Week 4)
- [ ] PWA manifest + service worker
- [ ] Performance optimization
- [ ] A11y audit
- [ ] Mobile testing (iPhone SE, Android)
- [ ] Production deployment

---

## 🎯 SUCCESS METRICS

| KPI | Baseline | Target | How to Measure |
|-----|----------|--------|----------------|
| Signup Conversion | 5% | 45% | GA4 funnel |
| Time to First Booking | 180s | 15s | Custom event tracking |
| Mobile Bounce Rate | 65% | 25% | GA4 mobile segment |
| Voice Search Adoption | 0% | 25% | Custom dimension |
| PWA Install Rate | 0% | 15% | BeforeInstallPrompt event |
| Core Web Vitals | Poor | Good | PageSpeed Insights |

---

## 📚 REFERENCES

- [Next.js 15 Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS 4 Beta](https://tailwindcss.com/docs)
- [Framer Motion Gestures](https://www.framer.com/motion/gestures/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [PWA Best Practices](https://web.dev/pwa-checklist/)

---

**Document Version:** 1.0
**Last Updated:** 2025-12-12
**Author:** Claude Sonnet 4.5
**Status:** ✅ Ready for Review
