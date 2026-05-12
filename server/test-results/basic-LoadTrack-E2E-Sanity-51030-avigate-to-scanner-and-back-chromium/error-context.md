# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: basic.spec.ts >> LoadTrack E2E Sanity >> should navigate to scanner and back
- Location: tests/e2e/basic.spec.ts:25:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1:has-text("Skaner Paczek")')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1:has-text("Skaner Paczek")')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "LT LOADTRACK" [ref=e5] [cursor=pointer]:
      - /url: /
      - generic [ref=e6]: LT
      - text: LOADTRACK
    - navigation [ref=e7]:
      - link "Pulpit" [ref=e8] [cursor=pointer]:
        - /url: /
      - link "SKANER" [active] [ref=e9] [cursor=pointer]:
        - /url: /scanner
      - link "Palety" [ref=e10] [cursor=pointer]:
        - /url: /pallets
      - link "Ruchy" [ref=e11] [cursor=pointer]:
        - /url: /move
      - link "Załadunek" [ref=e12] [cursor=pointer]:
        - /url: /loading
      - link "Szukaj" [ref=e13] [cursor=pointer]:
        - /url: /search
      - link "Testy" [ref=e14] [cursor=pointer]:
        - /url: /diagnostics
      - link "Admin" [ref=e15] [cursor=pointer]:
        - /url: /admin
      - button [ref=e16] [cursor=pointer]:
        - img [ref=e17]
  - main [ref=e19]:
    - generic [ref=e20]:
      - generic [ref=e21]:
        - heading "🔍 SKANER" [level=2] [ref=e22]:
          - generic [ref=e23]:
            - generic [ref=e24]: 🔍
            - text: SKANER
        - generic [ref=e25]:
          - textbox "CZEKAM NA SKAN..." [ref=e27]
          - button "ZATWIERDŹ (ENTER)" [disabled] [ref=e28]
      - generic [ref=e29]:
        - heading "Ostatnie skany 0" [level=3] [ref=e30]:
          - generic [ref=e31]: Ostatnie skany
          - generic [ref=e32]: "0"
        - list [ref=e34]:
          - paragraph [ref=e35]: Brak paczek w tej sesji.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('LoadTrack E2E Sanity', () => {
  4  |   test('should login and see dashboard', async ({ page }) => {
  5  |     // Navigate to login
  6  |     await page.goto('/');
  7  | 
  8  |     // Check if redirect to login (if not logged in) or dashboard
  9  |     const loginTitle = page.locator('h1:has-text("LOADTRACK")');
  10 |     if (await loginTitle.isVisible()) {
  11 |       // Perform login
  12 |       await page.fill('input[type="text"]', 'admin');
  13 |       await page.fill('input[type="password"]', 'logwin');
  14 |       await page.click('button[type="submit"]');
  15 |     }
  16 | 
  17 |     // Expect to see Dashboard elements
  18 |     await expect(page.locator('h1:has-text("Pulpit Operacyjny")')).toBeVisible({ timeout: 10000 });
  19 |     
  20 |     // Check for stats cards
  21 |     await expect(page.locator('text=Stan Magazynu')).toBeVisible();
  22 |     await expect(page.locator('text=Otwarte Załadunki')).toBeVisible();
  23 |   });
  24 | 
  25 |   test('should navigate to scanner and back', async ({ page }) => {
  26 |     await page.goto('/');
  27 |     // Login if needed
  28 |     if (await page.locator('button[type="submit"]').isVisible()) {
  29 |         await page.fill('input[type="text"]', 'admin');
  30 |         await page.fill('input[type="password"]', 'logwin');
  31 |         await page.click('button[type="submit"]');
  32 |     }
  33 | 
  34 |     await page.click('text=SKANER');
  35 |     await expect(page.url()).toContain('/scanner');
> 36 |     await expect(page.locator('h1:has-text("Skaner Paczek")')).toBeVisible();
     |                                                                ^ Error: expect(locator).toBeVisible() failed
  37 | 
  38 |     await page.click('text=Pulpit');
  39 |     await expect(page.url()).toBe('http://localhost:3602/');
  40 |   });
  41 | });
  42 | 
```