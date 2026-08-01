import { test, expect } from "@playwright/test";

const mockParticipants = {
  participants: [
    {
      id: "1",
      nickname: "User1",
      firstName: "Иван",
      role: "participant",
      gender: "M",
      transportTo: {
        method: "Водитель",
        city: "Минск",
        time: "10:00",
        day: "Пт",
        seats: 3,
      },
      transportFrom: {
        method: "Пассажир",
        city: "Гомель",
        time: "12:00",
        day: "Вс",
      },
    },
    {
      id: "2",
      nickname: "User2",
      firstName: "Анна",
      role: "organizer",
      gender: "F",
      transportTo: {
        method: "Пассажир",
        city: "Брест",
        time: "15:00",
        day: "Сб",
      },
      transportFrom: {
        method: "Водитель",
        city: "Минск",
        time: "18:00",
        day: "Пн",
        seats: 2,
      },
    },
    {
      id: "3",
      nickname: "User3",
      firstName: "Олег",
      role: "participant",
      gender: "M",
      transportTo: {
        method: "Маршрутка",
        city: "Минск",
        time: "12:00",
        day: "Пт",
      },
      transportFrom: {
        method: "Маршрутка",
        city: "Минск",
        time: "18:00",
        day: "Вс",
      },
    },
  ],
};

test.describe("Applications Table", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the Google Apps Script endpoint
    await page.route("**/macros/s/**", async (route) => {
      await route.fulfill({
        json: mockParticipants,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        },
      });
    });

    // Go to the applications page
    await page.goto("/applications.html");
  });

  test("should render the table with mock data", async ({ page }) => {
    // The table should be visible
    const table = page.locator(".participants-table");
    await expect(table).toBeVisible();

    // Should render exactly 3 rows
    const rows = page.locator(".participants-table tr:has(td)");
    await expect(rows).toHaveCount(3);

    // Check specific data is rendered
    await expect(page.getByText("User1").first()).toBeVisible();
    await expect(page.getByText("Анна").first()).toBeVisible();
    await expect(page.getByText("Олег").first()).toBeVisible();
  });

  test("should filter by clicking a cell and show filter chip in footer", async ({
    page,
  }) => {
    // Click 'Минск' (should match User1 and User3's 'toCity' or 'fromCity')
    // The cell has class 'interactive-city-cell'
    const minskCells = page
      .locator(".interactive-city-cell")
      .filter({ hasText: "Минск" });
    await minskCells.first().click();

    // Verify the footer becomes visible
    const footer = page.locator(".layout-footer");
    await expect(footer).toBeVisible();

    // Verify the chip appears in the footer
    const chip = page.locator(".val-chip");
    await expect(chip).toHaveCount(1);
    await expect(chip).toContainText("Минск");

    // The count badge should show 2 (User1 and User3)
    const countBadge = page.locator(".intersection-count");
    await expect(countBadge).toContainText("2");

    // Verify "Show only filtered" button exists
    const eyeButton = page.locator(".summary-badge button");
    await expect(eyeButton).toBeVisible();
  });

  test("should hide non-matching rows when filter mode is toggled", async ({
    page,
  }) => {
    // Click "Минск" to filter
    const minskCells = page
      .locator(".interactive-city-cell")
      .filter({ hasText: "Минск" });
    await minskCells.first().click();

    const rows = page.locator(".participants-table tr:has(td)");
    await expect(rows).toHaveCount(3);

    // Toggle filter mode
    await page.locator(".summary-badge button").click();

    // Now rows that don't match (User2) should have .hidden-row class
    const visibleRows = page.locator(
      ".participants-table tr:has(td):not(.hidden-row)",
    );
    await expect(visibleRows).toHaveCount(2);

    // Verify User2 is not visible in viewport
    // Note: User2 is hidden via display: none, so toBeVisible() should be false
    await expect(page.getByText("User2").first()).not.toBeVisible();
  });

  test("should remove filter when chip close button is clicked", async ({
    page,
  }) => {
    // Apply filter
    const minskCells = page
      .locator(".interactive-city-cell")
      .filter({ hasText: "Минск" });
    await minskCells.first().click();
    await expect(page.locator(".val-chip")).toHaveCount(1);

    // Remove filter
    await page.locator(".val-chip .chip-close-btn").click();

    // Verify chip is gone
    await expect(page.locator(".val-chip")).toHaveCount(0);
  });

  test("should select and deselect rows", async ({ page }) => {
    const rows = page.locator(".participants-table tr:has(td)");

    // Click first row's nickname
    await rows.nth(0).locator(".col-name").click();
    await expect(rows.nth(0)).toHaveClass(/selected/);

    // Click again to deselect
    await rows.nth(0).locator(".col-name").click();
    await expect(rows.nth(0)).not.toHaveClass(/selected/);
  });

  test("should open help popover and verify scroll container", async ({
    page,
  }) => {
    // Click help button
    await page.locator('button[aria-label="Справка"]').click();

    // Verify popover is visible
    const popover = page.locator(".applications-help");
    await expect(popover).toBeVisible();

    // Verify hints container exists
    const hints = page.locator(".hints-container");
    await expect(hints).toBeVisible();
  });
});
