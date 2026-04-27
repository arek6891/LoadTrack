# LoadTrack Project Context

Ten projekt to system WMS do skanowania paczek i zarządzania paletami.

## Status Projektu
- **Szkielet Monorepo:** Gotowy (server + client).
- **Backend:** Express + TypeScript + Prisma (PostgreSQL).
- **Frontend:** React + Vite + Tailwind CSS.
- **Git:** Zainicjalizowany, pierwszy commit wykonany.

## Kluczowe Zasady (Mandaty)
1. **Unikalność:** Każdy `trackingNumber` paczki musi być unikalny. Próba zeskanowania istniejącego numeru musi wyrzucić błąd.
2. **Relacje:** Paczki trafiają do Palet -> Palety do Lokalizacji -> Palety na Załadunek.
3. **Workflow:** 
   - Przyjęcie paczki (skanowanie).
   - Budowa palety (agregacja paczek).
   - Ruchy magazynowe (zmiana lokalizacji).
   - Załadunek (wyjazd ze stocku, przejście do historii).

## Kolejne Kroki
- Implementacja API do skanowania paczek (`POST /api/packages`).
- Walidacja unikalności numerów po stronie backendu.
- Stworzenie widoku skanera na froncie.
