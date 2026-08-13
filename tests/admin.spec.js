import { test, expect } from "@playwright/test";
import { dict } from "../src/shared/locales/ru.js";

test.describe("Admin Purchases Panel E2E Tests", () => {
  const namePlaceholder = dict.admin.expenseForm.namePlaceholder;

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/admin.html");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("Test 1: Render Ledger & Navigate to Form and Back", async ({ page }) => {
    await page.goto("/admin.html");

    // Header & Initial Ledger View
    await expect(page.locator(".app-header")).toContainText(dict.admin.headerTitle);
    await expect(page.locator(".table-wrapper")).toBeVisible();

    // Click Footer '+' Button to open creation form
    const addButton = page.locator(".right-buttons button");
    await addButton.click();

    // Verify creation form is visible
    await expect(page.locator(".pro-content h2.block-title")).toContainText("Новый расход");

    // Click Footer 'Back' Button to return to ledger
    const backButton = page.locator(".right-buttons button").first();
    await backButton.click();

    // Verify back to Ledger
    await expect(page.locator(".table-wrapper")).toBeVisible();
  });

  test("Test 2: Add New Expense (Happy Path)", async ({ page }) => {
    await page.goto("/admin.html");

    // Open form
    await page.locator(".right-buttons button").click();

    // Select category 'Продукты питания'
    await page.locator('.category-card:has-text("Продукты питания")').click();

    // Fill details
    await page.locator(`input[placeholder="${namePlaceholder}"]`).fill("Молоко и сыр");
    await page.locator('input[placeholder="0.00"]').fill("25.50");
    await page.locator('input[placeholder="Иван"]').fill("Елена");
    await page.locator('textarea[placeholder*="Напишите здесь"]').fill("Закупка в магазине");

    // Submit form (second button in right-buttons)
    const submitButton = page.locator(".right-buttons button").nth(1);
    await expect(submitButton).not.toBeDisabled();
    await submitButton.click();

    // Automatically transitions back to Ledger view
    await expect(page.locator(".table-wrapper")).toBeVisible();

    // Check newly added row in expenses table
    const table = page.locator(".participants-table");
    await expect(table).toContainText("Молоко и сыр");
    await expect(table).toContainText("Елена");
    await expect(table).toContainText("25,50 BYN");
    await expect(table).toContainText("Закупка в магазине");
  });

  test("Test 3: Lock Button Validation on Incomplete Form", async ({ page }) => {
    await page.goto("/admin.html");

    // Open form
    await page.locator(".right-buttons button").click();

    // Partially fill (name only)
    await page.locator(`input[placeholder="${namePlaceholder}"]`).fill("Уголь");

    // Click submit button -> triggers force touch validation
    const submitButton = page.locator(".right-buttons button").nth(1);
    await submitButton.click();

    // Errors should appear and button becomes locked/disabled
    await expect(page.locator(".error-wrapper")).toBeVisible();
    await expect(submitButton).toBeDisabled();

    // Fill category, amount, payer -> unlocks button
    await page.locator('.category-card:has-text("Орг. расходы")').click();
    await page.locator('input[placeholder="0.00"]').fill("30");
    await page.locator('input[placeholder="Иван"]').fill("Павел");

    await expect(submitButton).not.toBeDisabled();
  });

  test("Test 4: Session Interruption & Draft Restoration", async ({ page }) => {
    await page.goto("/admin.html");

    // Open form & type draft
    await page.locator(".right-buttons button").click();
    await page.locator(`input[placeholder="${namePlaceholder}"]`).fill("Мясо барбекю");
    await page.locator('input[placeholder="0.00"]').fill("120");

    // Simulate page reload / session interruption
    await page.reload();

    // Draft Restoration Modal should appear
    const modal = page.locator(".ui-overlay.variant-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("С возвращением!");
    await expect(modal).toContainText(dict.admin.draftModal.body1);

    // Click "Продолжить"
    await modal.locator('button:has-text("Продолжить")').click();

    // Creation form opens with restored data
    await expect(page.locator(".pro-content h2.block-title")).toContainText("Новый расход");
    await expect(page.locator(`input[placeholder="${namePlaceholder}"]`)).toHaveValue("Мясо барбекю");
    await expect(page.locator('input[placeholder="0.00"]')).toHaveValue("120");
  });

  test("Test 5: Leave Confirmation Modal (Просто выйти)", async ({ page }) => {
    await page.goto("/admin.html");

    // Open form & type draft
    await page.locator(".right-buttons button").click();
    await page.locator(`input[placeholder="${namePlaceholder}"]`).fill("Напитки");

    // Click Back button
    const backButton = page.locator(".right-buttons button").first();
    await backButton.click();

    // Leave Confirmation Modal appears
    const modal = page.locator(".ui-overlay.variant-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(dict.admin.leaveModal.title);
    await expect(modal).toContainText(dict.admin.leaveModal.body);

    // Click "Выйти"
    await modal.locator('button:has-text("Выйти")').click();

    // Returned to Ledger view, draft cleared
    await expect(page.locator(".table-wrapper")).toBeVisible();

    // Open form again -> should be pristine empty
    await page.locator(".right-buttons button").click();
    await expect(page.locator(`input[placeholder="${namePlaceholder}"]`)).toHaveValue("");
  });
});
