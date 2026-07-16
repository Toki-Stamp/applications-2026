import { test, expect } from "@playwright/test";

// --- Helper Functions ---

async function fillText(page, labelText, value) {
  const group = page
    .locator(".form-group")
    .filter({ hasText: labelText })
    .first();
  const host = group.locator("md-outlined-text-field, textarea").first();
  await host.waitFor({ state: "attached" });
  const tagName = await host.evaluate((el) => el.tagName.toLowerCase());
  if (tagName === "textarea") {
    await host.fill(value);
  } else {
    await host.locator("input").fill(value);
  }
  await host.evaluate((el) => el.dispatchEvent(new Event("change")));
}

async function selectRadio(page, labelText, valueText) {
  const group = page
    .locator(".form-group")
    .filter({ hasText: labelText })
    .first();
  const option = group
    .locator(".radio-label")
    .filter({ hasText: valueText })
    .first();
  await option.click();
}

async function selectDropdown(page, labelText, valueText) {
  const group = page
    .locator(".form-group")
    .filter({ hasText: labelText })
    .first();
  const select = group.locator("md-outlined-select");
  await select.click();
  const option = select
    .locator("md-select-option")
    .filter({ hasText: valueText })
    .first();
  await page.waitForTimeout(500); // Wait for popup animation on mobile
  await option.click();
  await page.waitForTimeout(300);
}

async function selectGuestRadio(page, guestName, labelText, valueText) {
  const guestGroup = page
    .locator(".sub-block-card")
    .filter({ hasText: guestName })
    .first();
  const group = guestGroup
    .locator(".form-group")
    .filter({ hasText: labelText })
    .first();
  const option = group
    .locator(".radio-label")
    .filter({ hasText: valueText })
    .first();
  await option.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 150));
  await page.waitForTimeout(300);
  await option.click();
}

async function fillGuestText(page, guestName, labelText, value) {
  const guestGroup = page
    .locator(".sub-block-card")
    .filter({ hasText: guestName })
    .first();
  const group = guestGroup
    .locator(".form-group")
    .filter({ hasText: labelText })
    .first();
  const host = group.locator("md-outlined-text-field, textarea").first();
  await host.waitFor({ state: "attached" });
  const tagName = await host.evaluate((el) => el.tagName.toLowerCase());
  if (tagName === "textarea") {
    await host.fill(value);
  } else {
    await host.locator("input").fill(value);
  }
  await host.evaluate((el) => el.dispatchEvent(new Event("change")));
}

async function clickNext(page) {
  await page.locator('.tooltip-wrapper[data-tooltip="Далее"] button').click();
}

async function checkPeriod(page, provisionLabel, dayLabel, periodLabel) {
  const provisionItem = page
    .locator(".provision-item")
    .filter({ hasText: provisionLabel })
    .first();
  const labelContainer = provisionItem
    .locator(".label-container")
    .filter({ hasText: dayLabel })
    .first();
  const cardsGrid = labelContainer.locator(
    'xpath=following-sibling::div[contains(@class, "cards-grid")]',
  );
  const card = cardsGrid
    .locator(".period-card")
    .filter({ hasText: periodLabel })
    .first();
  await card.click();
}

async function checkNight(page, nightLabel) {
  const card = page
    .locator(".period-card")
    .filter({ hasText: nightLabel })
    .first();
  await card.click();
}

async function checkGuestNight(page, guestName, nightLabel) {
  const guestGroup = page
    .locator(".sub-block-card")
    .filter({ hasText: guestName })
    .first();
  const card = guestGroup
    .locator(".period-card")
    .filter({ hasText: nightLabel })
    .first();
  await card.click();
}

// --- Verification Helpers ---

async function verifyText(page, labelText, expectedValue) {
  const group = page
    .locator(".form-group")
    .filter({ hasText: labelText })
    .first();
  const host = group.locator("md-outlined-text-field, textarea").first();
  const val = await host.evaluate((el) => el.value);
  expect(val).toBe(expectedValue);
}

async function verifyGuestText(page, guestName, labelText, expectedValue) {
  const guestGroup = page
    .locator(".sub-block-card")
    .filter({ hasText: guestName })
    .first();
  const group = guestGroup
    .locator(".form-group")
    .filter({ hasText: labelText })
    .first();
  const host = group.locator("md-outlined-text-field, textarea").first();
  const val = await host.evaluate((el) => el.value);
  expect(val).toBe(expectedValue);
}

async function verifyRadioChecked(page, labelText, valueText) {
  const group = page
    .locator(".form-group")
    .filter({ hasText: labelText })
    .first();
  const option = group
    .locator(".radio-label")
    .filter({ hasText: valueText })
    .first();
  const radio = option.locator("md-radio");
  const isChecked = await radio.evaluate((el) => el.checked);
  expect(isChecked).toBe(true);
}

async function verifyGuestRadioChecked(page, guestName, labelText, valueText) {
  const guestGroup = page
    .locator(".sub-block-card")
    .filter({ hasText: guestName })
    .first();
  const group = guestGroup
    .locator(".form-group")
    .filter({ hasText: labelText })
    .first();
  const option = group
    .locator(".radio-label")
    .filter({ hasText: valueText })
    .first();
  const radio = option.locator("md-radio");
  const isChecked = await radio.evaluate((el) => el.checked);
  expect(isChecked).toBe(true);
}

async function verifyDropdownSelected(page, labelText) {
  const group = page
    .locator(".form-group")
    .filter({ hasText: labelText })
    .first();
  const select = group.locator("md-outlined-select");
  const val = await select.evaluate((el) => el.value);
  expect(val).toBeTruthy();
}

async function verifyPeriodChecked(
  page,
  provisionLabel,
  dayLabel,
  periodLabel,
) {
  const provisionItem = page
    .locator(".provision-item")
    .filter({ hasText: provisionLabel })
    .first();
  const labelContainer = provisionItem
    .locator(".label-container")
    .filter({ hasText: dayLabel })
    .first();
  const cardsGrid = labelContainer.locator(
    'xpath=following-sibling::div[contains(@class, "cards-grid")]',
  );
  const card = cardsGrid
    .locator(".period-card")
    .filter({ hasText: periodLabel })
    .first();
  await expect(card).toHaveClass(/selected/);
}

async function verifyNightChecked(page, nightLabel) {
  const card = page
    .locator(".period-card")
    .filter({ hasText: nightLabel })
    .first();
  await expect(card).toHaveClass(/selected/);
}

async function verifyGuestNightChecked(page, guestName, nightLabel) {
  const guestGroup = page
    .locator(".sub-block-card")
    .filter({ hasText: guestName })
    .first();
  const card = guestGroup
    .locator(".period-card")
    .filter({ hasText: nightLabel })
    .first();
  await expect(card).toHaveClass(/selected/);
}

// --- Tests ---
test.describe("Draft Restoration E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173");
    await expect(page).toHaveTitle(/ZАЯВКА 2026/i);
  });

  test("Exhaustive Draft Check for all steps", async ({ page }) => {
    test.setTimeout(60000);
    await page.locator('button:has-text("Начать заполнение")').click();

    // --- STEP 1 ---
    await selectRadio(page, "Тип заявки", "Групповая");
    await page.waitForTimeout(300);
    await selectDropdown(
      page,
      "Общее количество участников Вашей группы",
      "Всего 2 участника",
    );
    await selectRadio(
      page,
      "Условия для участников Вашей группы",
      "Дифференцированные условия",
    );

    await page.reload();
    await page.locator('button:has-text("Продолжить")').click();

    await expect(
      page.locator("h2.block-title", { hasText: "Формат" }),
    ).toBeVisible();

    await verifyRadioChecked(page, "Тип заявки", "Групповая");
    await verifyDropdownSelected(
      page,
      "Общее количество участников Вашей группы",
    );
    await verifyRadioChecked(
      page,
      "Условия для участников Вашей группы",
      "Дифференцированные условия",
    );

    await clickNext(page);

    // --- STEP 2 ---
    await fillText(page, "Никнейм", "leader_nick");
    await fillText(page, "Имя", "Leader_name");
    await fillText(page, "Фамилия", "Leader_surname");
    await fillText(page, "Номер телефона", "+375 29 111 22 33");

    await fillGuestText(page, "Гость #1", "Имя", "Guest_name");
    await fillGuestText(page, "Гость #1", "Никнейм", "guest_nick");
    await fillGuestText(
      page,
      "Гость #1",
      "Номер телефона",
      "+375 29 999 88 77",
    );

    await page.reload();
    await page.locator('button:has-text("Продолжить")').click();

    await expect(
      page.locator("h2.block-title", { hasText: "Персональные данные" }),
    ).toBeVisible();

    await verifyText(page, "Никнейм", "leader_nick");
    await verifyText(page, "Имя", "Leader_name");
    await verifyText(page, "Фамилия", "Leader_surname");

    await verifyGuestText(page, "Гость #1", "Имя", "Guest_name");
    await verifyGuestText(page, "Гость #1", "Никнейм", "guest_nick");

    await clickNext(page);

    // --- STEP 3 ---
    await selectDropdown(page, "Способ прибытия", "Как водитель");
    await selectDropdown(page, "Свободных мест для попутчиков", "3 места");
    await selectDropdown(page, "День отправления на базу", "Пятница");
    await fillText(page, "Ориентировочное время отправления", "14:30");
    await fillText(page, "Город отправления", "Минск");

    await selectDropdown(page, "Способ отъезда", "Ищу место в авто");
    await selectDropdown(page, "День отъезда с базы", "Воскресенье");
    await fillText(page, "Ориентировочное время отъезда", "16:00");

    await page.reload();
    await page.locator('button:has-text("Продолжить")').click();
    await expect(
      page.locator("h2.block-title", { hasText: "Транспорт" }),
    ).toBeVisible();

    await verifyDropdownSelected(page, "Способ прибытия");
    await verifyDropdownSelected(page, "Свободных мест для попутчиков");
    await verifyDropdownSelected(page, "День отправления на базу");
    await verifyText(page, "Ориентировочное время отправления", "14:30");
    await verifyText(page, "Город отправления", "Минск");
    await verifyDropdownSelected(page, "Способ отъезда");
    await verifyDropdownSelected(page, "День отъезда с базы");
    await verifyText(page, "Ориентировочное время отъезда", "16:00");

    await clickNext(page);

    // --- STEP 4 (Provisions) ---
    await selectGuestRadio(
      page,
      "leader_nick",
      "Потребность в питании",
      "Буду кушать",
    );
    await checkPeriod(page, "Потребность в питании", "В пятницу", "Вечер");
    await selectGuestRadio(
      page,
      "leader_nick",
      "Потребность в алкоголе",
      "Без алкоголя",
    );

    await selectGuestRadio(
      page,
      "guest_name",
      "Потребность в питании",
      "Без питания",
    );
    await selectGuestRadio(
      page,
      "guest_name",
      "Потребность в алкоголе",
      "Без алкоголя",
    );

    await page.reload();
    await page.locator('button:has-text("Продолжить")').click();
    await expect(
      page.locator("h2.block-title", { hasText: "Обеспечение" }),
    ).toBeVisible();

    await verifyGuestRadioChecked(
      page,
      "leader_nick",
      "Потребность в питании",
      "Буду кушать",
    );
    await verifyPeriodChecked(
      page,
      "Потребность в питании",
      "В пятницу",
      "Вечер",
    );
    await verifyGuestRadioChecked(
      page,
      "leader_nick",
      "Потребность в алкоголе",
      "Без алкоголя",
    );
    await verifyGuestRadioChecked(
      page,
      "guest_name",
      "Потребность в питании",
      "Без питания",
    );
    await verifyGuestRadioChecked(
      page,
      "guest_name",
      "Потребность в алкоголе",
      "Без алкоголя",
    );

    await clickNext(page);

    // --- STEP 5 (Accommodation) ---
    await selectGuestRadio(
      page,
      "Для leader_nick",
      "Потребность в проживании",
      "Требуется забронировать номер на базе",
    );
    await checkGuestNight(page, "Для leader_nick", "С пятницы на субботу");
    await fillGuestText(
      page,
      "Для leader_nick",
      "Дополнительные комментарии к проживанию и обеспечению",
      "Нужен тихий номер",
    );

    await selectGuestRadio(
      page,
      "Для guest_name",
      "Потребность в проживании",
      "Размещаюсь самостоятельно",
    );
    await fillGuestText(
      page,
      "Для guest_name",
      "Дополнительные комментарии к проживанию и обеспечению",
      "Беру палатку",
    );

    await page.reload();
    await page.locator('button:has-text("Продолжить")').click();
    await expect(
      page.locator("h2.block-title", { hasText: "Проживание" }),
    ).toBeVisible();

    await verifyGuestRadioChecked(
      page,
      "Для leader_nick",
      "Потребность в проживании",
      "Требуется забронировать номер на базе",
    );
    await verifyGuestNightChecked(
      page,
      "Для leader_nick",
      "С пятницы на субботу",
    );
    await verifyGuestText(
      page,
      "Для leader_nick",
      "Дополнительные комментарии к проживанию и обеспечению",
      "Нужен тихий номер",
    );

    await verifyGuestRadioChecked(
      page,
      "Для guest_name",
      "Потребность в проживании",
      "Размещаюсь самостоятельно",
    );
    await verifyGuestText(
      page,
      "Для guest_name",
      "Дополнительные комментарии к проживанию и обеспечению",
      "Беру палатку",
    );

    await clickNext(page);

    // --- STEP 6 (FreeMic/Agreement) ---
    await fillText(page, "Комментарий или пожелания", "My draft comment");

    await page.reload();
    await page.locator('button:has-text("Продолжить")').click();
    await expect(
      page.locator("h2.block-title", { hasText: "Свободный микрофон" }),
    ).toBeVisible();

    await verifyText(page, "Комментарий или пожелания", "My draft comment");
  });
});
