# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: basic.spec.ts >> LoadTrack E2E Sanity >> should login and see dashboard
- Location: tests/e2e/basic.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1:has-text("Pulpit Operacyjny")')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('h1:has-text("Pulpit Operacyjny")')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - heading "LoadTrack Login" [level=2] [ref=e5]
  - generic [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]: Użytkownik
      - textbox [ref=e9]
    - generic [ref=e10]:
      - generic [ref=e11]: Hasło
      - textbox [ref=e12]
    - button "ZALOGUJ SIĘ" [ref=e13] [cursor=pointer]
  - paragraph [ref=e14]: System WMS v1.0
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
> 18 |     await expect(page.locator('h1:has-text("Pulpit Operacyjny")')).toBeVisible({ timeout: 10000 });
     |                                                                    ^ Error: expect(locator).toBeVisible() failed
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
  36 |     await expect(page.locator('h1:has-text("Skaner Paczek")')).toBeVisible();
  37 | 
  38 |     await page.click('text=Pulpit');
  39 |     await expect(page.url()).toBe('http://localhost:3602/');
  40 |   });
  41 | });
  42 | 
```