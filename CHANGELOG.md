# LoadTrack - Dokumentacja Zmian i Statusu Projektu (Maj 2026)

## 🏗️ Architektura Systemu (Refaktoryzacja)
Aplikacja została przeniesiona z modelu monolitycznego na nowoczesną **architekturę warstwową (Layered Architecture)**.

### Backend (Express + Prisma)
- **Separation of Concerns:** Kod podzielony na `Routes`, `Controllers`, `Services`.
- **Validation Layer:** Wdrożenie **Zod** do rygorystycznej walidacji danych wejściowych (API nie przyjmie błędnych danych).
- **Service Layer:** Cała logika biznesowa (skanowanie, budowanie palet, załadunek) odseparowana od warstwy HTTP.
- **Audit Logging:** Scentralizowany system logowania operacji (kto, co, kiedy) zintegrowany z bazą danych.
- **Pagination:** Wprowadzona paginacja dla logów audytowych, zapewniająca wydajność przy dużej ilości danych.

### Frontend (React + TanStack Query)
- **Data Synchronization:** Wdrożenie **React Query**. Automatyczne keszowanie, odświeżanie w tle (dashboard co 30s) i natychmiastowa inwalidacja danych po akcjach (np. skan -> update stats).
- **UX Skanera:** 
  - `Focus Lock`: System pilnujący, aby kursor zawsze był w polu skanowania.
  - `Flash Feedback`: Wizualne potwierdzenie skanu (Zielony/Czerwony błysk).
- **Ergonomia:** Wprowadzenie dolnej nawigacji mobilnej dla wygodnej obsługi skanerów ręcznych.
- **Analytics:** Zaawansowane raporty z filtrowaniem, sortowaniem i wskaźnikami KPI.

## 📁 Struktura Projektu
- `server/src/services`: Logika biznesowa.
- `server/src/controllers`: Obsługa endpointów.
- `server/src/routes`: Definicje ścieżek API.
- `server/src/schemas`: Schematy walidacji Zod.
- `client/src/hooks`: Customowe hooki (np. `useFocusLock`).

## 📋 Co zostało zrobione (Zrealizowane)
- [x] Pełna refaktoryzacja backendu na warstwy.
- [x] Wdrożenie React Query i optymalizacja sync danych.
- [x] Nowy UI/UX dla skanerów (Focus Lock, Mobile Nav).
- [x] Zaawansowane raportowanie KPI, **Raport Szczegółowy (z historią twórcy)** i eksport XLSX.
- [x] System Audit Log z paginacją.
- [x] **NAPRAWA (Maj 2026):** Rozwiązanie problemu "White Screen" na Dashboardzie (bezpieczne mapowanie danych).
- [x] **NAPRAWA (Maj 2026):** Fix wyścigu (race condition) przy autoryzacji i przywrócenie poprawnego routingu API w trybie produkcyjnym.


## 🚀 Co jest do zrobienia (TODO / Future)
- [ ] **Walidacja Regex:** Wprowadzenie wzorców dla kodów paczek (np. blokada kodów spoza standardu firmy).
- [ ] **WebSockets:** Powiadomienia w czasie rzeczywistym o nowych skanach bez odświeżania (Socket.io).
- [ ] **Offline Mode:** Możliwość skanowania przy braku zasięgu i synchronizacja po odzyskaniu WiFi.
- [ ] **Powiadomienia PWA:** Instalacja aplikacji na skanerze jako natywnej apki mobilnej.
- [ ] **Multi-Warehouse:** Obsługa wielu magazynów w jednej instancji systemu.

## 🛠️ Instrukcja Git
Projekt jest gotowy do wypchnięcia na GitHub. Pamiętaj, aby nie udostępniać pliku `.env` z `DATABASE_URL` i `JWT_SECRET`.
