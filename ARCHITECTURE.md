# LoadTrack - Dokumentacja Architektury

## 1. Cel Projektu
System WMS do ewidencji paczek i palet, zarządzania lokalizacjami oraz monitorowania procesu załadunku.

## 2. Architektura Systemu
*   **Backend:** Node.js + Express + Prisma ORM. Port: **3601**.
*   **Frontend:** React + Vite + Tailwind CSS. Port: **3602**.
*   **Proxy:** Vite skonfigurowane do przekierowywania `/api` na backend.
*   **Autoryzacja:** JWT (JSON Web Token) z podziałem na role:
    *   `ADMIN`, `LEADER`: Pełny dostęp, w tym usuwanie i edycja.
    *   `OPERATOR`: Podstawowe operacje skanowania i ruchów.

## 3. Struktura Bazy Danych (Schemat: `loadtrack`)
*   **User:** Zarządzanie dostępem (username, hashed password, role).
*   **Package:** trackingNumber (UNIQUE), status, relacja do Pallet/Location.
*   **Pallet:** palletNumber (UNIQUE), status, relacja do Location/Loading.
*   **Location:** Nazwy regałów/miejsc (UNIQUE).
*   **Loading:** Dane transportu (kierowca, rejestracja, status OPEN/CLOSED).

## 4. Konfiguracja Portów
*   **Backend API:** `http://localhost:3601`
*   **Frontend UI:** `http://localhost:3602`

## 5. Kluczowe Endpointy
*   `/api/auth/login`: Autentykacja.
*   `/api/packages`: Skanowanie nowych paczek.
*   `/api/pallets`: Tworzenie i agregacja palet.
*   `/api/move/pallet`: Przypisywanie palet do lokalizacji.
*   `/api/loadings`: Obsługa transportów.
*   `/api/search`: Globalna wyszukiwarka towaru.

## 6. Bezpieczeństwo
*   Hasła są hashowane za pomocą `bcryptjs`.
*   Schemat bazy `loadtrack` zapewnia izolację od innych aplikacji na tym samym serwerze DB.
