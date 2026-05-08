import { test, expect } from '@playwright/test';

test.describe('LoadTrack E2E Sanity', () => {
  test('should login and see dashboard', async ({ page }) => {
    // Navigate to login
    await page.goto('/');

    // Check if redirect to login (if not logged in) or dashboard
    const loginTitle = page.locator('h1:has-text("LOADTRACK")');
    if (await loginTitle.isVisible()) {
      // Perform login
      await page.fill('input[type="text"]', 'admin');
      await page.fill('input[type="password"]', 'logwin');
      await page.click('button[type="submit"]');
    }

    // Expect to see Dashboard elements
    await expect(page.locator('h1:has-text("Pulpit Operacyjny")')).toBeVisible({ timeout: 10000 });
    
    // Check for stats cards
    await expect(page.locator('text=Stan Magazynu')).toBeVisible();
    await expect(page.locator('text=Otwarte Załadunki')).toBeVisible();
  });

  test('should navigate to scanner and back', async ({ page }) => {
    await page.goto('/');
    // Login if needed
    if (await page.locator('button[type="submit"]').isVisible()) {
        await page.fill('input[type="text"]', 'admin');
        await page.fill('input[type="password"]', 'logwin');
        await page.click('button[type="submit"]');
    }

    await page.click('text=SKANER');
    await expect(page.url()).toContain('/scanner');
    await expect(page.locator('h1:has-text("Skaner Paczek")')).toBeVisible();

    await page.click('text=Pulpit');
    await expect(page.url()).toBe('http://localhost:3602/');
  });
});
