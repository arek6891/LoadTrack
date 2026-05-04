# LoadTrack Project Context

System WMS do skanowania paczek i zarządzania paletami.
## Status Projektu
- **Szkielet Monorepo:** Gotowy.
- **Backend:** Express + Prisma (PostgreSQL). Port: **3601**.
- **Frontend:** React + Vite + Tailwind. Port: **3602**.
- **Bezpieczeństwo:** System ról (ADMIN, LEADER, OPERATOR) + JWT Auth.
- **Panel Admina:** Zarządzanie użytkownikami (CRUD) i rolami.
- **Dashboard:** Statystyki magazynu w czasie rzeczywistym.
- **Raporty:** Eksport stanu magazynu do plików Excel (.xlsx) z filtrami.

## Zrealizowane Funkcjonalności
- **Skaner Paczek:** Przyjmowanie paczek z walidacją unikalności.
- **Budowanie Palet:** Agregacja paczek na jednostki paletowe.
- **Ruchy Magazynowe:** Przypisywanie palet do lokalizacji (regałów).
- **Załadunek:** Proces wydania towaru z magazynu na transport.
- **Wyszukiwarka:** Globalne wyszukiwanie statusu paczek/palet.
- **Auth:** Logowanie i zarządzanie kontami (tylko ADMIN).
- **Historia:** Widok archiwalny zamkniętych załadunków z filtrami (data, kierowca) i eksportem XLSX.
- **Eksport XLSX:** Natywny eksport raportów do formatu Excel (Stan Magazynu, Historia).
- **UI/UX (Toasts):** System powiadomień w czasie rzeczywistym dla wszystkich kluczowych operacji.
- **Wydajność:** Indeksacja bazy danych i optymalizacja zapytań Prisma (Selective Fetching).
- **Konfigurowalne Szablony Etykiet:** System CRUD dla szablonów HTML/CSS z obsługą placeholderów.
- **Drukowanie:** Integracja z drukarkami (podgląd i druk) dla paczek i palet z poziomu UI.
- **Walidacja Załadunku:** Weryfikacja kompletności transportu względem planowanej listy palet (expectedPallets).
- **Logi Operacji:** Pełny system Audit Log rejestrujący historię zmian statusów, ruchów i akcji użytkowników (kto, co, kiedy).
- **Optymalizacja Mobile:** Interfejs w pełni dostosowany do skanerów ręcznych (duże przyciski, czytelne fonty, ergonomiczny layout).
- **Importy masowe:** Możliwość importu list paczek/palet z plików zewnętrznych (Excel/CSV) bezpośrednio do bazy danych.

## Kluczowe Zasady (Mandaty)
1. **Unikalność:** `trackingNumber` i `palletNumber` muszą być unikalne.
2. **Relacje:** Paczka -> Paleta -> Lokalizacja -> Załadunek.
3. **Izolacja:** Wszystkie tabele aplikacji znajdują się w schemacie `loadtrack`.

## Kolejne Kroki (TODO)
- Brak (Wszystkie kluczowe funkcjonalności zaimplementowane).
--- End of Context from: /opt/LoadTrack/GEMINI.md ---
