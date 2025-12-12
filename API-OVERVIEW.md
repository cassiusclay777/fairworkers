# FairWorkers - Kompletní Přehled API Endpointů

## 📋 Úvod
Tento dokument obsahuje kompletní přehled všech API endpointů dostupných v FairWorkers backendu. Všechny endpointy jsou dostupné pod `/api/` prefixem.

---

## 🔐 Autentifikace (`/api/auth/`)

### Registrace a Přihlášení
- **POST** `/api/auth/register` - Registrace nového uživatele
  - Body: `{ email, password, role, username, display_name, phone }`
  - Role: `worker` nebo `client`

- **POST** `/api/auth/login` - Přihlášení uživatele
  - Body: `{ email, password }`

- **POST** `/api/auth/refresh` - Obnovení access tokenu
  - Body: `{ refreshToken }`

- **POST** `/api/auth/logout` - Odhlášení (client-side)

### Uživatelské Informace
- **GET** `/api/auth/me` - Získání informací o přihlášeném uživateli
  - Vyžaduje: Bearer token

---

## 👥 Pracovníci (`/api/workers/`)

### Veřejné Endpointy
- **GET** `/api/workers` - Seznam všech pracovníků
  - Query params: `location`, `min_rate`, `max_rate`, `available_only`

- **GET** `/api/workers/:id` - Detail konkrétního pracovníka

### Pro Přihlášené Pracovníky
- **PUT** `/api/workers/profile` - Aktualizace profilu pracovníka
  - Body: `{ stage_name, age, location, languages, hourly_rate, minimum_booking_hours, is_available, accepts_new_clients }`

- **POST** `/api/workers/services` - Přidání nové služby
  - Body: `{ name, description, duration_minutes, price, requires_deposit, deposit_amount }`

- **PUT** `/api/workers/services/:serviceId` - Aktualizace služby

- **DELETE** `/api/workers/services/:serviceId` - Deaktivace služby

- **GET** `/api/workers/my/services` - Seznam mých služeb

---

## 💰 Platby a Výdělky (`/api/payments/`)

### Kalkulační Endpointy
- **POST** `/api/payments/calculate` - Výpočet výdělku z ceny služby
  - Body: `{ servicePrice }`

- **POST** `/api/payments/simulate-monthly` - Simulace měsíčního výdělku
  - Body: `{ services: array }`

- **POST** `/api/payments/compare` - Porovnání s konkurencí
  - Body: `{ servicePrice }`

---

## 📅 Rezervace (`/api/bookings/`)

### Správa Rezervací
- **GET** `/api/bookings/user/:userId` - Rezervace uživatele
  - Query: `role` (worker/client)

- **POST** `/api/bookings` - Vytvoření nové rezervace
  - Body: `{ clientId, workerId, serviceId, startTime, duration, location, specialRequests, servicePrice }`

- **PATCH** `/api/bookings/:bookingId/status` - Změna stavu rezervace
  - Body: `{ status, notes, role }`

- **GET** `/api/bookings/:bookingId` - Detail rezervace

- **POST** `/api/bookings/:bookingId/cancel` - Zrušení rezervace

### Statistiky
- **GET** `/api/bookings/stats/:userId` - Statistiky rezervací
  - Query: `role` (worker/client)

### Dostupnost
- **GET** `/api/bookings/worker/:workerId` - Rezervace pracovníka
- **GET** `/api/bookings/availability/:workerId` - Dostupnost pracovníka
- **POST** `/api/bookings/set-availability` - Nastavení dostupnosti
  - Body: `{ workerId, date, times }`

- **POST** `/api/bookings/create` - Zjednodušené vytvoření rezervace
  - Body: `{ workerId, clientId, serviceId, date, time, price, duration }`

---

## 💳 Peněženka (`/api/wallet/`)

### Správa Peněženky
- **GET** `/api/wallet` - Informace o peněžence
- **GET** `/api/wallet/balance` - Rychlý zůstatek
- **POST** `/api/wallet/topup` - Dobití peněženky
  - Body: `{ amount }`

### Transakce
- **GET** `/api/wallet/transactions` - Historie transakcí
  - Query: `limit`, `offset`, `type`

---

## 🎨 Alba a Obsah (`/api/albums/`)

*Poznámka: Endpointy pro správu alb a mediálního obsahu*

---

## 🔒 Bezpečnost (`/api/security/`)

*Poznámka: Endpointy pro bezpečnostní funkce*

---

## 👥 Komunita (`/api/community/`)

*Poznámka: Endpointy pro komunitu a sociální funkce*

---

## ⭐ Hodnocení (`/api/ratings/`)

*Poznámka: Endpointy pro hodnocení a recenze*

---

## 🔍 Vyhledávání (`/api/search/`)

*Poznámka: Endpointy pro pokročilé vyhledávání*

---

## 📤 Nahrávání Souborů (`/api/uploads/`)

*Poznámka: Endpointy pro nahrávání souborů*

---

## 🌐 Veřejné Endpointy

### Health Check
- **GET** `/health` - Stav serveru a databáze

### Demo
- **GET** `/api/demo/compare` - Ukázka férového systému vs konkurence

---

## 💬 Real-time Chat (Socket.IO)

### Socket Events
- `user-online` - Přihlášení do chatu
- `send-message` - Odeslání zprávy
- `mark-read` - Označení zprávy jako přečtené
- `typing` - Indikace psaní zprávy

### WebRTC Video Chat
- `join-stream` - Připojení k živému streamu
- `leave-stream` - Opuštění streamu
- `start-stream` - Spuštění streamu
- `stop-stream` - Ukončení streamu
- `webrtc-offer` - WebRTC nabídka
- `webrtc-answer` - WebRTC odpověď
- `ice-candidate` - ICE kandidát
- `request-private-call` - Žádost o soukromý hovor
- `accept-private-call` - Přijetí hovoru
- `reject-private-call` - Zamítnutí hovoru
- `end-private-call` - Ukončení hovoru
- `stream-chat-message` - Zpráva v chatu streamu
- `stream-tip` - Spropitné během streamu

---

## 🔐 Autentifikace a Bezpečnost

### Tokeny
- **Access Token**: 7 dní platnost
- **Refresh Token**: 30 dní platnost

### Rate Limiting
- Registrace: 3 pokusy za 15 minut
- Přihlášení: 10 pokusů za 15 minut
- Ostatní API: 100 požadavků za 15 minut

### IDOR Ochrana
- Všechny endpointy kontrolují, zda uživatel má přístup k požadovaným zdrojům

---

## 📊 Response Formát

Všechny API endpointy vrací standardizovaný formát:

```json
{
  "success": true/false,
  "message": "Popisová zpráva",
  "data": { ... }, // nebo přímo data
  "error": "Chybová zpráva (pouze při success: false)"
}
```

---

## 🚀 Použití na Webu

### Frontend Integrace
1. **Autentifikace**: Použijte `/api/auth/login` a `/api/auth/register`
2. **Pracovníci**: `/api/workers` pro seznam, `/api/workers/:id` pro detail
3. **Rezervace**: `/api/bookings` pro správu rezervací
4. **Peněženka**: `/api/wallet` pro finanční operace
5. **Real-time**: Socket.IO pro chat a video hovory

### Příklady Použití
```javascript
// Registrace
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    role: 'worker'
  })
})

// Seznam pracovníků
fetch('/api/workers?available_only=true&min_rate=500')
  .then(res => res.json())
  .then(data => console.log(data.workers))
```

---

## 📞 Podpora

Pro technickou podporu kontaktujte vývojový tým nebo nahlédněte do dokumentace v `SETUP.md`.
