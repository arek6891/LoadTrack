# LoadTrack Project Context

System WMS do skanowania paczek i zarządzania paletami.

## Status Projektu
- **Szkielet Monorepo:** Gotowy.
- **Backend:** Express + Prisma (PostgreSQL). Port: **3601**.
- **Frontend:** React + Vite + Tailwind. Port: **3602**.
- **Baza Danych:** Dedykowany schemat `loadtrack` w PostgreSQL.
- **Bezpieczeństwo:** System ról (ADMIN, LEADER, OPERATOR) + JWT Auth.

## Zrealizowane Funkcjonalności
- **Skaner Paczek:** Przyjmowanie paczek z walidacją unikalności.
- **Budowanie Palet:** Agregacja paczek na jednostki paletowe.
- **Ruchy Magazynowe:** Przypisywanie palet do lokalizacji (regałów).
- **Załadunek:** Proces wydania towaru z magazynu na transport.
- **Wyszukiwarka:** Globalne wyszukiwanie statusu paczek/palet.
- **Auth:** Logowanie i autoryzacja operacji (np. usuwanie tylko dla Admin/Leader).

## Kluczowe Zasady (Mandaty)
1. **Unikalność:** `trackingNumber` i `palletNumber` muszą być unikalne.
2. **Relacje:** Paczka -> Paleta -> Lokalizacja -> Załadunek.
3. **Izolacja:** Wszystkie tabele aplikacji znajdują się w schemacie `loadtrack`.

## Kolejne Kroki
- Panel Admina (zarządzanie użytkownikami).
- Dashboard z raportami i statystykami.
- Historia załadunków (widok archiwalny).
