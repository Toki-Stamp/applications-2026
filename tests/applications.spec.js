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

    // Should render exactly 3 rows in tbody
    const rows = page.locator(".participants-table tbody tr:has(td)");
    await expect(rows).toHaveCount(3);

    // Check specific data is rendered
    await expect(page.getByText("User1").first()).toBeVisible();
    await expect(page.getByText("Анна").first()).toBeVisible();
    await expect(page.getByText("Олег").first()).toBeVisible();
  });

  test("should filter by transport method using interactive header icons", async ({ page }) => {
    // Footer should NOT be visible initially
    const footer = page.locator(".layout-footer");
    await expect(footer).toHaveCount(0);

    // Click on Driver header icon (Row 3, 1st transport method icon for ТУДА)
    const driverHeaderTh = page.locator(".participants-table thead tr:nth-child(3) th.icon-th").first();
    await driverHeaderTh.click();

    // Header cell should be active
    await expect(driverHeaderTh).toHaveClass(/is-active/);

    // Footer should slide in and be visible
    await expect(footer).toBeVisible();

    // Count badge should show 1 / 3
    const countBadge = page.locator(".intersection-count");
    await expect(countBadge).toContainText("1");

    // Toggle filter mode to isolate
    await page.locator(".summary-badge button").click();

    const visibleRows = page.locator(
      ".participants-table tbody tr:has(td):not(.hidden-row)",
    );
    await expect(visibleRows).toHaveCount(1);
    await expect(page.getByText("User1").first()).toBeVisible();
    await expect(page.getByText("User2").first()).not.toBeVisible();

    // Click driver header again to deactivate
    await driverHeaderTh.click();
    await expect(driverHeaderTh).not.toHaveClass(/is-active/);

    // Footer should disappear
    await expect(footer).toHaveCount(0);
  });

  test("should filter by city using table header city dropdown", async ({ page }) => {
    // Open City Popover from table header
    const cityTh = page.locator(".participants-table thead th.city-th");
    await cityTh.click();

    // Click 'Минск' in city popover
    const minskOption = page.locator(".city-item", { hasText: "Минск" });
    await minskOption.click();

    // Close city popover
    await page.locator(".popover-backdrop").click({ position: { x: 5, y: 5 } });

    // Header should have is-active class
    await expect(cityTh).toHaveClass(/is-active/);

    // The count badge should show 2 (User1 and User3 from Минск)
    const countBadge = page.locator(".intersection-count");
    await expect(countBadge).toContainText("2");

    // Toggle filter mode
    await page.locator(".summary-badge button").click();

    const visibleRows = page.locator(
      ".participants-table tbody tr:has(td):not(.hidden-row)",
    );
    await expect(visibleRows).toHaveCount(2);
    await expect(page.getByText("User2").first()).not.toBeVisible();

    // Reset all filters
    await page.locator("button[aria-label='Сбросить всё']").click();
    await expect(cityTh).not.toHaveClass(/is-active/);
  });

  test("should filter by departure time using table header time dropdown", async ({
    page,
  }) => {
    // Open Time Popover from table header
    const timeTh = page.locator(".participants-table thead th.time-th").first();
    await timeTh.click();

    // Click '10:00' in time popover (ТУДА)
    const timeOption = page.locator(".time-chip", { hasText: "10:00" });
    await timeOption.click();

    // Close time popover
    await page.locator(".popover-backdrop").click({ position: { x: 5, y: 5 } });

    // Header cell should be active
    await expect(timeTh).toHaveClass(/is-active/);

    // Count should be 1 (User1)
    const countBadge = page.locator(".intersection-count");
    await expect(countBadge).toContainText("1");

    // Clear filter
    await page.locator("button[aria-label='Сбросить всё']").click();
    await expect(timeTh).not.toHaveClass(/is-active/);
  });

  test("should display active filter chips in summary panel and allow removing individual chips", async ({
    page,
  }) => {
    // Open City Popover from header and select 'Минск'
    const cityTh = page.locator(".participants-table thead th.city-th");
    await cityTh.click();
    const minskOption = page.locator(".city-item", { hasText: "Минск" });
    await minskOption.click();
    await page.locator(".popover-backdrop").click({ position: { x: 5, y: 5 } });

    // The footer summary chips panel should appear with 'Минск'
    const chip = page.locator(".filter-groups .val-chip");
    await expect(chip).toBeVisible();
    await expect(chip).toContainText("Минск");

    // Group header should show 'ТУДА'
    const groupHeader = page.locator(".filter-groups .group-header");
    await expect(groupHeader).toContainText("ТУДА");

    // Click chip's close button (✕)
    const chipCloseBtn = chip.locator(".chip-close-btn");
    await chipCloseBtn.click();

    // Chip should disappear and city header should not be active
    await expect(page.locator(".filter-groups .val-chip")).toHaveCount(0);
    await expect(cityTh).not.toHaveClass(/is-active/);
  });

  test("should select and deselect rows", async ({ page }) => {
    const rows = page.locator(".participants-table tbody tr:has(td)");

    // Click first row
    await rows.nth(0).dispatchEvent("click");
    await expect(rows.nth(0)).toHaveClass(/selected/);

    // Click again to deselect
    await rows.nth(0).dispatchEvent("click");
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

  test("should display correct dynamic numbers in summary row", async ({ page }) => {
    // Check initial summary buttons in tfoot
    const summaryBtns = page.locator(".participants-table tfoot .summary-btn");
    await expect(summaryBtns).toHaveCount(14);

    // Initial counts for mockParticipants:
    // ТУДА: Водитель (1), Пассажир (1), Маршрутка (1), Свой ход (0)
    await expect(summaryBtns.nth(0)).toHaveText("1"); // toDrivers
    await expect(summaryBtns.nth(1)).toHaveText("1"); // toPassengers
    await expect(summaryBtns.nth(2)).toHaveText("1"); // toBuses
    await expect(summaryBtns.nth(3)).toHaveText("0"); // toSelf

    // Type in Nickname summary search box "User1"
    const nickInput = page.locator('.summary-search-box input[placeholder="Поиск..."]').first();
    await nickInput.fill("User1");

    // Recalculated: only User1 (Водитель, Пт, Минск)
    await expect(summaryBtns.nth(0)).toHaveText("1"); // toDrivers
    await expect(summaryBtns.nth(1)).toHaveText("0"); // toPassengers
    await expect(summaryBtns.nth(2)).toHaveText("0"); // toBuses

    // Clear search
    await page.locator(".summary-clear-btn").first().click();
    await expect(summaryBtns.nth(0)).toHaveText("1");
    await expect(summaryBtns.nth(1)).toHaveText("1");
    await expect(summaryBtns.nth(2)).toHaveText("1");
  });

  test("should gracefully render long applicant names with +N badge and guest names with group icon without overflow", async ({ page }) => {
    // Custom mock data with a group of 3 (1 leader with long name + 2 guests with long names)
    const longNameGroupData = {
      participants: [
        {
          id: "g1",
          nickname: "SuperLongNicknameLeader2026",
          firstName: "Константинопольский-Длинноименный",
          role: "leader",
          groupId: "grp_100",
          gender: "M",
          transportTo: { method: "Водитель", city: "Минск", day: "Пт", seats: 3 },
          transportFrom: { method: "Водитель", city: "Минск", day: "Вс", seats: 3 },
        },
        {
          id: "g2",
          nickname: "",
          firstName: "Александра-Виктория-Святославовна",
          role: "member",
          groupId: "grp_100",
          gender: "F",
          transportTo: { method: "Пассажир", city: "Минск", day: "Пт" },
          transportFrom: { method: "Пассажир", city: "Минск", day: "Вс" },
        },
        {
          id: "g3",
          nickname: "",
          firstName: "Пантелеймонов-Ярославович",
          role: "member",
          groupId: "grp_100",
          gender: "M",
          transportTo: { method: "Пассажир", city: "Минск", day: "Пт" },
          transportFrom: { method: "Пассажир", city: "Минск", day: "Вс" },
        },
      ],
    };

    await page.route("**/macros/s/**", async (route) => {
      await route.fulfill({
        json: longNameGroupData,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    });

    await page.goto("/applications.html");

    // 1. Leader row (row 1)
    const row1 = page.locator(".participants-table tbody tr").nth(0);
    const row1NameCell = row1.locator("td.col-real-name");
    await expect(row1NameCell).toBeVisible();

    // Group badge (+2) must be visible and properly rendered
    const leaderBadge = row1NameCell.locator(".group-count-badge");
    await expect(leaderBadge).toBeVisible();
    await expect(leaderBadge).toHaveText("+2");

    // 2. Guest member rows (rows 2 and 3)
    const row2 = page.locator(".participants-table tbody tr").nth(1);
    const row2NameCell = row2.locator("td.col-real-name");
    await expect(row2NameCell).toBeVisible();

    // Guest group icon must be visible
    const guestIcon = row2NameCell.locator(".group-icon.member");
    await expect(guestIcon).toBeVisible();

    // 3. Verify cell layout integrity: column widths are consistent and constrained
    const row1Box = await row1NameCell.boundingBox();
    const row2Box = await row2NameCell.boundingBox();
    expect(row1Box?.width).toBeGreaterThanOrEqual(100);
    expect(row1Box?.width).toBeCloseTo(row2Box?.width || 0, 1);

    // 4. Verify text truncation with ellipsis
    const leaderEllipsis = row1NameCell.locator(".ellipsis-text");
    const guestEllipsis = row2NameCell.locator(".ellipsis-text");

    const leaderScrollWidth = await leaderEllipsis.evaluate((el) => el.scrollWidth);
    const leaderClientWidth = await leaderEllipsis.evaluate((el) => el.clientWidth);
    expect(leaderScrollWidth).toBeGreaterThan(leaderClientWidth); // text is truncated with ellipsis

    const guestScrollWidth = await guestEllipsis.evaluate((el) => el.scrollWidth);
    const guestClientWidth = await guestEllipsis.evaluate((el) => el.clientWidth);
    expect(guestScrollWidth).toBeGreaterThan(guestClientWidth); // text is truncated with ellipsis

    // 5. Verify badge and icon are strictly inside cell bounds and not overlapping
    const badgeBox = await leaderBadge.boundingBox();
    expect(badgeBox?.x).toBeGreaterThan((row1Box?.x || 0) + 20);
    expect((badgeBox?.x || 0) + (badgeBox?.width || 0)).toBeLessThanOrEqual((row1Box?.x || 0) + (row1Box?.width || 0) + 1);

    const iconBox = await guestIcon.boundingBox();
    expect(iconBox?.x).toBeGreaterThan((row2Box?.x || 0) + 20);
    expect((iconBox?.x || 0) + (iconBox?.width || 0)).toBeLessThanOrEqual((row2Box?.x || 0) + (row2Box?.width || 0) + 1);
  });
});
