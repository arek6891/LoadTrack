# LoadTrack - System WMS (Warehouse Management System)

LoadTrack to nowoczesny, lekki system zarządzania magazynem, zaprojektowany z myślą o szybkości pracy na terminalach mobilnych oraz pełnej analityce dla managerów.

## 🚀 Kluczowe Funkcje

### 📱 Tryb Operatora (Skaner)
- **Skanowanie bezdotykowe:** Automatyczne zarządzanie focusem (nie trzeba klikać w ekran).
- **Haptic Feedback:** Wibracje przy poprawnym/błędnym skanie.
- **Budowanie Palet:** Agregacja paczek na jednostki paletowe w czasie rzeczywistym.
- **Załadunek (Wydanie):** Weryfikacja towaru z planowaną listą transportową.

### 🖥️ Tryb Managera (Monitor)
- **Pulpit Operacyjny:** Statystyki magazynu i postęp załadunków LIVE.
- **Pełna Historia:** Archiwum zamkniętych transportów z eksportem do XLSX.
- **Logi Audytowe:** Każda akcja (kto, co, kiedy) jest rejestrowana i niezmienialna.
- **Zarządzanie Etykietami:** Edytor HTML/CSS dla etykiet logistycznych.

## 🛠️ Architektura i Bezpieczeństwo
- **Tech Stack:** React (Vite), Node.js (Express), Prisma (PostgreSQL).
- **Stabilność:** Procesy nadzorowane przez PM2 z auto-restartem.
- **Backupy:** Automatyczna kopia bazy danych co 24h z rotacją 7-dniową.
- **Bezpieczeństwo:** Autoryzacja JWT (24h), system ról (ADMIN, LEADER, OPERATOR).

## 📦 Instalacja i Uruchomienie

### Wymagania
- Node.js v20+
- PostgreSQL v16+

### Szybki Start
1. Zainstaluj zależności: `npm install` (w folderach client i server).
2. Skonfiguruj `.env` w folderze server.
3. Wykonaj migracje: `npx prisma migrate deploy`.
4. Uruchom produkcyjnie: `./scripts/deploy.sh`.

## 👨‍🔧 Administracja i Diagnostyka
System posiada wbudowany **Panel Diagnostyczny** (dostępny dla ADMIN), który umożliwia zdalne uruchamianie testów automatycznych API/E2E i podgląd logów w czasie rzeczywistym przez SSE.

---
*LoadTrack - Efektywność mierzona skanem.*
