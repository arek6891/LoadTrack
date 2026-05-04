# LoadTrack - System WMS

Nowoczesny system zarządzania magazynem (Warehouse Management System) zoptymalizowany pod kątem skanerów ręcznych.

## Kluczowe Funkcjonalności
- **Skaner Paczek:** Przyjmowanie i walidacja paczek.
- **Budowanie Palet:** Agregacja paczek na jednostki paletowe.
- **Ruchy Magazynowe:** Zarządzanie lokalizacjami i regałami.
- **Zarządzanie Załadunkiem:** Kontrola wydań towaru i walidacja z listą oczekiwaną.
- **Importy Masowe:** Szybkie zasilanie bazy z plików Excel/CSV.
- **Audit Log:** Pełna historia operacji (kto, co, kiedy).
- **Szablony Etykiet:** Elastyczny system drukowania oparty na HTML/CSS.
- **Mobile First:** Interfejs zaprojektowany pod skanery magazynowe.

## Technologie
- **Frontend:** React, Vite, Tailwind CSS, Axios.
- **Backend:** Node.js, Express, Prisma ORM.
- **Baza Danych:** PostgreSQL.
- **Logika:** JWT Auth, Multer, XLSX processing.

## Uruchomienie Systemu
Aplikacja działa w modelu monorepo.

### Backend
```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```
Domyślny port: **3601**

### Frontend
```bash
cd client
npm install
npm run dev -- --port 3602
```
Domyślny port: **3602**

## Dane Logowania (Admin)
- **Login:** `admin`
- **Hasło:** `logwin`

## Struktura Plików
- `/client`: Aplikacja React (Vite).
- `/server`: API Express + Prisma.
- `ARCHITECTURE.md`: Opis architektury systemu.
- `GEMINI.md`: Status i historia rozwoju projektu.

---
System stworzony w ramach projektu LoadTrack.
