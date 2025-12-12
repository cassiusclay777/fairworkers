# FairWorkers

Férová platforma pro sex workery s pouze 15% provizí.

## 🚀 Platformy

- **Web**: Nasazeno na Vercel - [fairworkers.vercel.app](https://vercel.com/cashi777s-projects/fairworkers)
- **Android**: Nativní Android aplikace pomocí Capacitor

## 📱 Technologie

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + Sequelize
- **Database**: PostgreSQL (production) / SQLite (development)
- **Real-time**: Socket.io
- **Video**: WebRTC (Simple-peer)
- **Mobile**: Capacitor 8

## 🛠️ Instalace a Spuštění

### Web Development

```bash
# Nainstalovat závislosti
pnpm install

# Spustit development servery (backend + frontend)
pnpm dev

# Pouze frontend
pnpm frontend:dev

# Pouze backend
pnpm backend:dev
```

### Android Build

Pro build Android APK viz: **[ANDROID-BUILD.md](./ANDROID-BUILD.md)**

Rychlý build:
```bash
# Windows
build-android.bat

# Linux/Mac
./build-android.sh
```

## 📦 Struktura Projektu

```
fairworkers/
├── frontend/              # React webová aplikace + Android
│   ├── src/               # React komponenty
│   ├── android/           # Android nativní projekt (Capacitor)
│   └── capacitor.config.json
├── backend/               # Node.js API server
│   ├── routes/            # API endpointy
│   ├── models/            # Business logika
│   ├── db-models/         # Sequelize modely
│   └── server.js
├── build-android.bat      # Windows build script
├── build-android.sh       # Linux/Mac build script
└── ANDROID-BUILD.md       # Detailní Android instrukce
```

## 🔑 Hlavní Features

- ✅ Zjednodušené přihlášení (heslo: 8 znaků + 1 speciální znak)
- ✅ Real-time chat a notifikace
- ✅ Video hovory (WebRTC)
- ✅ Live streaming
- ✅ Album management
- ✅ Booking system
- ✅ Wallet a platby
- ✅ Rating systém
- ✅ AI Matchmaking
- ✅ Stories
- ✅ Wishlist
- ✅ **Android podpora**

## 🔐 Bezpečnost

- JWT autentizace
- Bcrypt pro hashování hesel
- Rate limiting
- Input validace
- CORS ochrana
- HTTPS připojení (production)

## 📝 Poznámky

- Web verze zůstává zachována a deployuje se normálně na Vercel
- Android aplikace sdílí stejný kód jako web (React komponenty)
- Backend API musí být dostupné z mobilní sítě pro Android app
- CORS musí být nakonfigurován pro mobilní přístup

## 🤝 Contributing

1. Fork projekt
2. Vytvořte feature branch (`git checkout -b feature/amazing-feature`)
3. Commit změny (`git commit -m 'Add amazing feature'`)
4. Push do branch (`git push origin feature/amazing-feature`)
5. Otevřete Pull Request

## 📄 License

MIT
