# LoadTrack - Dokumentacja Architektury i Plan Wdrożenia

## 1. Cel Projektu
Stworzenie aplikacji WMS (Warehouse Management System) do skanowania paczek (z unikalnymi etykietami np. DPD), budowania jednostek paletowych, zarządzania ich lokalizacją na magazynie oraz ewidencjonowania załadunków na samochody ciężarowe. System musi zapewniać bezbłędne śledzenie towaru (brak powielających się numerów) oraz utrzymywać historię przepływu (paczek i palet, które po załadunku "znikają ze stanu", ale są widoczne w raportach).

## 2. Architektura Systemu
*   **Architektura:** Klient-Serwer (Monorepo dla ułatwienia wdrożenia lokalnego w /opt/LoadTrack).
*   **Backend:** Node.js z frameworkiem Express (napisany w TypeScript dla bezpieczeństwa typów).
*   **Baza danych:** PostgreSQL. Do komunikacji z bazą użyjemy Prisma ORM.
*   **Frontend (Admin + Skaner):** React.js (utworzony przez Vite, w TypeScript). Jeden projekt front-endowy z responsywnym UI:
    *   Widoki Skanera będą optymalizowane pod urządzenia mobilne (duże pola tekstowe, focus na polu skanowania, duże przyciski).
    *   Widoki Admina będą posiadać tabele z zaawansowanymi filtrami.
*   **Stylizacja:** Tailwind CSS (szybkie stylowanie interfejsów).

## 3. Model Danych (Kluczowe Encje w Prisma)
1.  **Package (Karton/Paczka):**
    *   `id` (UUID)
    *   `trackingNumber` (String, UNIQUE)
    *   `palletId` (FK, Nullable)
    *   `locationId` (FK, Nullable)
    *   `status` (Enum: IN_STOCK, LOADED, ERROR)
2.  **Pallet (Paleta):**
    *   `id` (UUID)
    *   `palletNumber` (String, UNIQUE)
    *   `locationId` (FK, Nullable)
    *   `loadingId` (FK, Nullable)
    *   `status` (Enum: IN_STOCK, LOADED)
3.  **Location (Lokalizacja Magazynowa):**
    *   `id` (UUID)
    *   `name` (String, UNIQUE)
4.  **Loading (Załadunek):**
    *   `id` (UUID)
    *   `driverName` (String)
    *   `vehicleRegistration` (String)
    *   `status` (Enum: OPEN, CLOSED)
    *   `createdAt`, `closedAt` (Daty)

## 4. Plan Konfiguracji Środowiska
Aby skonfigurować środowisko w `/opt/LoadTrack`, wykonam następujące kroki:

1.  **Inicjalizacja katalogu projektu (Monorepo root):**
    *   Utworzenie `package.json` w `/opt/LoadTrack` (Workspace manager - npm/pnpm).
2.  **Konfiguracja Backendu (`/opt/LoadTrack/server`):**
    *   Inicjalizacja projektu Node.js + TS.
    *   Instalacja zależności: `express`, `cors`, `dotenv`, `typescript`, `ts-node`, Prisma, `@prisma/client`.
    *   Utworzenie plików `server.ts` oraz `tsconfig.json`.
    *   Utworzenie schematu bazy danych w `prisma/schema.prisma` wg założeń z pkt 3.
3.  **Konfiguracja Frontendu (`/opt/LoadTrack/client`):**
    *   Inicjalizacja aplikacji React za pomocą Vite (`npm create vite@latest client -- --template react-ts`).
    *   Instalacja zależności: `react-router-dom`, `axios`, `tailwindcss`, `postcss`, `autoprefixer`.
    *   Inicjalizacja Tailwind CSS w React.
4.  **Uruchomienie:**
    *   Dodanie skryptów do `package.json` głównego katalogu, pozwalających na jednoczesne odpalenie backendu (dev) i frontendu (dev).

## 5. Weryfikacja
*   Kompilacja TypeScript działa bez błędów.
*   Klient uruchamia się z domyślną stroną, a serwer nasłuchuje na wskazanym porcie.
*   Prisma formatuje i sprawdza poprawność schematu (`npx prisma format / validate`).