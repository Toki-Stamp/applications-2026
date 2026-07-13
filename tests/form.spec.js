import { test, expect } from '@playwright/test';

async function fillText(page, labelText, value) {
  const group = page.locator('.form-group').filter({ hasText: labelText }).first();
  const host = group.locator('md-outlined-text-field, textarea').first();
  await host.waitFor({ state: 'attached' });
  const tagName = await host.evaluate(el => el.tagName.toLowerCase());
  if (tagName === 'textarea') {
    await host.fill(value);
  } else {
    await host.locator('input').fill(value);
  }
  await host.evaluate((el) => el.dispatchEvent(new Event('change')));
}

async function selectRadio(page, labelText, valueText) {
  const group = page.locator('.form-group').filter({ hasText: labelText }).first();
  const option = group.locator('.radio-label').filter({ hasText: valueText }).first();
  await option.click();
}

async function selectDropdown(page, labelText, valueText) {
  const group = page.locator('.form-group').filter({ hasText: labelText }).first();
  const select = group.locator('md-outlined-select');
  await select.click();
  const option = select.locator('md-select-option').filter({ hasText: valueText }).first();
  await option.click();
}

async function checkPeriod(page, provisionLabel, dayLabel, periodLabel) {
  const provisionItem = page.locator('.provision-item').filter({ hasText: provisionLabel }).first();
  const labelContainer = provisionItem.locator('.label-container').filter({ hasText: dayLabel }).first();
  const cardsGrid = labelContainer.locator('xpath=following-sibling::div[contains(@class, "cards-grid")]');
  const card = cardsGrid.locator('.period-card').filter({ hasText: periodLabel }).first();
  await card.click();
}

async function checkGuestPeriod(page, guestName, provisionLabel, dayLabel, periodLabel) {
  const guestGroup = page.locator('.sub-block-card').filter({ hasText: guestName }).first();
  const provisionItem = guestGroup.locator('.provision-item').filter({ hasText: provisionLabel }).first();
  const labelContainer = provisionItem.locator('.label-container').filter({ hasText: dayLabel }).first();
  const cardsGrid = labelContainer.locator('xpath=following-sibling::div[contains(@class, "cards-grid")]');
  const card = cardsGrid.locator('.period-card').filter({ hasText: periodLabel }).first();
  await card.click();
}

async function checkNight(page, nightLabel) {
  const card = page.locator('.night-card').filter({ hasText: nightLabel }).first();
  await card.click();
}

async function selectGuestRadio(page, guestName, labelText, valueText) {
  const guestGroup = page.locator('.sub-block-card').filter({ hasText: guestName }).first();
  const group = guestGroup.locator('.form-group').filter({ hasText: labelText }).first();
  const option = group.locator('.radio-label').filter({ hasText: valueText }).first();
  await option.click();
}

async function clickNext(page) {
  await page.locator('button[data-tooltip="Далее"]').click();
}

async function clickSubmit(page) {
  await page.locator('button[data-tooltip="Отправить заявку"]').click();
}

test.describe('Form E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Intercept Google Apps Script requests and return a mock success response
    await page.route('**/*script.google.com*/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: 'success' })
      });
    });
  });

  test('Case 1: Minimal Individual Application (Happy Path)', async ({ page }) => {
    let submittedData = null;
    page.on('console', msg => {
      if (msg.text().includes('Submitting payload to Google Apps Script:')) {
        msg.args().forEach(async arg => {
          const val = await arg.jsonValue();
          if (typeof val === 'object' && val.applicationType) submittedData = val;
        });
      }
    });

    await page.goto('/');
    await page.locator('button:has-text("Начать заполнение")').click();

    await selectRadio(page, 'Тип заявки', 'Индивидуальная');
    await clickNext(page);

    await fillText(page, 'Никнейм', 'tester_01');
    await fillText(page, 'Номер телефона', '+375 29 111 22 33');
    await clickNext(page);

    await selectDropdown(page, 'Способ прибытия', 'Самостоятельно');
    await selectDropdown(page, 'День отправления на базу', 'Пятница');
    await fillText(page, 'Ориентировочное время отправления', '10:00');
    await selectDropdown(page, 'Способ отъезда', 'Самостоятельно');
    await selectDropdown(page, 'День отъезда с базы', 'Воскресенье');
    await fillText(page, 'Ориентировочное время отъезда', '12:00');
    await clickNext(page);

    await selectRadio(page, 'Потребность в питании', 'Без питания');
    await selectRadio(page, 'Потребность в алкоголе', 'Без алкоголя');
    await clickNext(page);

    await selectRadio(page, 'Потребность в проживании', 'Размещаюсь самостоятельно');
    await clickNext(page);

    await clickSubmit(page);
    await expect(page.locator('text=Ваша заявка принята')).toBeVisible();

    expect(submittedData).not.toBeNull();
    expect(submittedData.applicationType).toBe('individual');
    expect(submittedData.applicant.nickname).toBe('tester_01');
    expect(submittedData.transportTo.method).toBe('self');
    expect(submittedData.accommodation).toBe('self');
  });

  test('Case 2: Individual Maximum (Driver, Food, Booking)', async ({ page }) => {
    let submittedData = null;
    page.on('console', msg => {
      if (msg.text().includes('Submitting payload to Google Apps Script:')) {
        msg.args().forEach(async arg => {
          const val = await arg.jsonValue();
          if (typeof val === 'object' && val.applicationType) submittedData = val;
        });
      }
    });

    await page.goto('/');
    await page.locator('button:has-text("Начать заполнение")').click();
    await selectRadio(page, 'Тип заявки', 'Индивидуальная');
    await clickNext(page);

    await fillText(page, 'Никнейм', 'driver_01');
    await fillText(page, 'Имя', 'Ivan');
    await fillText(page, 'Фамилия', 'Ivanov');
    await fillText(page, 'Номер телефона', '+375 29 111 22 33');
    await clickNext(page);

    await selectDropdown(page, 'Способ прибытия', 'Как водитель');
    await selectDropdown(page, 'Свободных мест для попутчиков', '3 места');
    await selectDropdown(page, 'День отправления на базу', 'Пятница');
    await fillText(page, 'Ориентировочное время отправления', '18:00');
    
    await selectDropdown(page, 'Способ отъезда', 'Тот же, что и туда');
    await selectDropdown(page, 'День отъезда с базы', 'Воскресенье');
    await fillText(page, 'Ориентировочное время отъезда', '15:00');
    await clickNext(page);

    await selectRadio(page, 'Потребность в питании', 'Буду кушать');
    await checkPeriod(page, 'Потребность в питании', 'В пятницу', 'Вечер');
    await checkPeriod(page, 'Потребность в питании', 'В субботу', 'Утро');
    
    await selectRadio(page, 'Потребность в алкоголе', 'Буду выпивать');
    await checkPeriod(page, 'Потребность в алкоголе', 'В субботу', 'Вечер');
    await clickNext(page);

    await selectRadio(page, 'Потребность в проживании', 'Требуется забронировать номер на базе');
    await checkNight(page, 'С пятницы на субботу');
    await clickNext(page);

    await clickSubmit(page);
    await expect(page.locator('text=Ваша заявка принята')).toBeVisible();
    
    expect(submittedData.transportTo.method).toBe('driver');
    expect(String(submittedData.transportTo.freeSeats)).toBe('3');
    expect(submittedData.applicant.provisions.foodPeriods).toContain('fri-eve');
    expect(submittedData.applicant.provisions.alcoholPeriods).toContain('sat-eve');
    expect(submittedData.accommodation).toBe('booking');
    expect(submittedData.nights).toContain('fri-sat');
  });

  test('Case 3: Group Unified', async ({ page }) => {
    let submittedData = null;
    page.on('console', msg => {
      if (msg.text().includes('Submitting payload to Google Apps Script:')) {
        msg.args().forEach(async arg => {
          const val = await arg.jsonValue();
          if (typeof val === 'object' && val.applicationType) submittedData = val;
        });
      }
    });

    await page.goto('/');
    await page.locator('button:has-text("Начать заполнение")').click();
    
    await selectRadio(page, 'Тип заявки', 'Групповая');
    await page.waitForTimeout(500);
    await selectDropdown(page, 'Общее количество участников Вашей группы', 'Всего 2 участника');
    await selectRadio(page, 'Условия для участников Вашей группы', 'Единые условия');
    await clickNext(page);

    await fillText(page, 'Никнейм', 'leader');
    await fillText(page, 'Номер телефона', '+375 29 111 22 33');
    
    const guestGroup = page.locator('.sub-block-card').filter({ hasText: 'Гость #1' }).first();
    const guestNameInput = guestGroup.locator('.form-group').filter({ hasText: 'Имя' }).locator('md-outlined-text-field').locator('input');
    await guestNameInput.fill('Иван');
    const guestNicknameInput = guestGroup.locator('.form-group').filter({ hasText: 'Никнейм' }).locator('md-outlined-text-field').locator('input');
    await guestNicknameInput.fill('guest_1');
    const guestPhoneInput = guestGroup.locator('.form-group').filter({ hasText: 'Номер телефона' }).locator('md-outlined-text-field').locator('input');
    await guestPhoneInput.fill('+375 29 222 33 44');
    await clickNext(page);

    await selectDropdown(page, 'Способ прибытия', 'Самостоятельно');
    await selectDropdown(page, 'День отправления на базу', 'Пятница');
    await fillText(page, 'Ориентировочное время отправления', '10:00');
    await selectDropdown(page, 'Способ отъезда', 'Самостоятельно');
    await selectDropdown(page, 'День отъезда с базы', 'Воскресенье');
    await fillText(page, 'Ориентировочное время отъезда', '12:00');
    await clickNext(page);

    await selectRadio(page, 'Потребность в питании', 'Без питания');
    await selectRadio(page, 'Потребность в алкоголе', 'Без алкоголя');
    await clickNext(page);

    await selectRadio(page, 'Потребность в проживании', 'Размещаюсь самостоятельно');
    await clickNext(page);

    await clickSubmit(page);
    await expect(page.locator('text=Ваша заявка принята')).toBeVisible();
    
    expect(submittedData.applicationType).toBe('group');
    expect(submittedData.guests.length).toBe(1);
    expect(submittedData.guests[0].provisions.foodPeriods).toEqual([]);
  });

  test('Case 4: Group Differential', async ({ page }) => {
    let submittedData = null;
    page.on('console', msg => {
      if (msg.text().includes('Submitting payload to Google Apps Script:')) {
        msg.args().forEach(async arg => {
          const val = await arg.jsonValue();
          if (typeof val === 'object' && val.applicationType) submittedData = val;
        });
      }
    });

    await page.goto('/');
    await page.locator('button:has-text("Начать заполнение")').click();
    
    await selectRadio(page, 'Тип заявки', 'Групповая');
    await page.waitForTimeout(500);
    await selectDropdown(page, 'Общее количество участников Вашей группы', 'Всего 2 участника');
    await selectRadio(page, 'Условия для участников Вашей группы', 'Дифференцированные условия');
    await clickNext(page);

    await fillText(page, 'Никнейм', 'leader_diff');
    await fillText(page, 'Номер телефона', '+375 29 111 22 33');
    
    const guestGroup = page.locator('.sub-block-card').filter({ hasText: 'Гость #1' }).first();
    const guestNameInput = guestGroup.locator('.form-group').filter({ hasText: 'Имя' }).locator('md-outlined-text-field').locator('input');
    await guestNameInput.fill('Иван');
    const guestNicknameInput = guestGroup.locator('.form-group').filter({ hasText: 'Никнейм' }).locator('md-outlined-text-field').locator('input');
    await guestNicknameInput.fill('guest_diff');
    const guestPhoneInput = guestGroup.locator('.form-group').filter({ hasText: 'Номер телефона' }).locator('md-outlined-text-field').locator('input');
    await guestPhoneInput.fill('+375 29 222 33 44');
    await clickNext(page);

    await selectDropdown(page, 'Способ прибытия', 'Самостоятельно');
    await selectDropdown(page, 'День отправления на базу', 'Пятница');
    await fillText(page, 'Ориентировочное время отправления', '10:00');
    await selectDropdown(page, 'Способ отъезда', 'Самостоятельно');
    await selectDropdown(page, 'День отъезда с базы', 'Воскресенье');
    await fillText(page, 'Ориентировочное время отъезда', '12:00');
    await clickNext(page);

    // Provision for Applicant
    await selectGuestRadio(page, 'Для leader_diff', 'Потребность в питании', 'Буду кушать');
    await checkGuestPeriod(page, 'Для leader_diff', 'Потребность в питании', 'В пятницу', 'Вечер');
    await selectGuestRadio(page, 'Для leader_diff', 'Потребность в алкоголе', 'Без алкоголя');
    
    // Provision for Guest
    await selectGuestRadio(page, 'Для Иван', 'Потребность в питании', 'Без питания');
    await selectGuestRadio(page, 'Для Иван', 'Потребность в алкоголе', 'Буду выпивать');
    await checkGuestPeriod(page, 'Для Иван', 'Потребность в алкоголе', 'В субботу', 'Вечер');
    await clickNext(page);

    await selectRadio(page, 'Потребность в проживании', 'Размещаюсь самостоятельно');
    await clickNext(page);

    await clickSubmit(page);
    await expect(page.locator('text=Ваша заявка принята')).toBeVisible();
    
    expect(submittedData.applicationType).toBe('group');
    expect(submittedData.applicant.provisions.foodPeriods).toContain('fri-eve');
    expect(submittedData.applicant.provisions.alcoholPeriods).toEqual([]);
    expect(submittedData.guests[0].provisions.foodPeriods).toEqual([]);
    expect(submittedData.guests[0].provisions.alcoholPeriods).toContain('sat-eve');
  });

  test('Case 5: Validation Check (Negative Path)', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("Начать заполнение")').click();

    await clickNext(page);
    await expect(page.locator('text=Пожалуйста, выберите один из вариантов')).toBeVisible();
    await expect(page.locator('h2.block-title', { hasText: 'Формат участия' })).toBeVisible();
  });

  test('Case 6: Clear Form', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("Начать заполнение")').click();

    await selectRadio(page, 'Тип заявки', 'Индивидуальная');
    await clickNext(page);

    await fillText(page, 'Никнейм', 'tester_to_clear');
    await fillText(page, 'Номер телефона', '+375 29 111 22 33');
    await clickNext(page);

    await page.locator('button[data-tooltip="Очистить форму"]').click();
    await page.locator('.modal-card button:has-text("Очистить")').click();

    await page.waitForTimeout(300);
    await expect(page.locator('h2.block-title', { hasText: 'Вводная информация' })).toBeVisible();

    await page.locator('button:has-text("Начать заполнение")').click();
    await clickNext(page);
    await expect(page.locator('text=Пожалуйста, выберите один из вариантов')).toBeVisible();
  });

});
