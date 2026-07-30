/**
 * Вспомогательный модуль для расчетов сметы и долей участников.
 */

/**
 * Рассчитывает количество долей участника.
 * @param {Object} itemData - Данные по питанию или алкоголю (например, person.food)
 * @returns {number} Количество долей (сумма всех периодов)
 */
export function calculateShares(itemData) {
  if (!itemData || itemData.type === "Нет" || itemData.type === "") {
    return 0;
  }
  const fri = Number(itemData.fri) || 0;
  const sat = Number(itemData.sat) || 0;
  const sun = Number(itemData.sun) || 0;
  return fri + sat + sun;
}

/**
 * Рассчитывает итоговую смету на основе расходов и заявок.
 * @param {Array} participants - Список всех участников
 * @param {Array} expenses - Массив расходов { category: 'food'|'alcohol'|'org', amount: number }
 * @param {number} hiddenOrgPercentage - Процент орг расходов, который размазывается (0-100)
 * @param {number} riskMargin - Процент поправки на риски (0-100)
 */
export function calculateEstimate(
  participants,
  expenses,
  hiddenOrgPercentage = 100,
  riskMargin = 10,
) {
  // 1. Считаем чистые расходы по категориям
  let rawFoodCost = 0;
  let rawAlcoholCost = 0;
  let rawOrgCost = 0;

  expenses.forEach((exp) => {
    const amount = Number(exp.amount) || 0;
    if (exp.category === "food") rawFoodCost += amount;
    else if (exp.category === "alcohol") rawAlcoholCost += amount;
    else if (exp.category === "org") rawOrgCost += amount;
  });

  // 2. Делим орг. расходы на скрытую (размазываемую) и открытую часть
  const hiddenOrgRatio = hiddenOrgPercentage / 100;
  const hiddenOrgCost = rawOrgCost * hiddenOrgRatio;
  const publicOrgCost = rawOrgCost - hiddenOrgCost;

  // 3. Размазываем скрытую часть пропорционально базовым стоимостям еды и алкоголя
  let totalBaseForSmearing = rawFoodCost + rawAlcoholCost;
  let smearedFoodCost = rawFoodCost;
  let smearedAlcoholCost = rawAlcoholCost;

  if (totalBaseForSmearing > 0) {
    const foodShareOfCost = rawFoodCost / totalBaseForSmearing;
    const alcoholShareOfCost = rawAlcoholCost / totalBaseForSmearing;
    smearedFoodCost += hiddenOrgCost * foodShareOfCost;
    smearedAlcoholCost += hiddenOrgCost * alcoholShareOfCost;
  } else {
    // Если базовых расходов нет, но есть скрытые орг. расходы — делим поровну между едой и алкоголем
    // (Граничный кейс, о котором мы говорили)
    smearedFoodCost += hiddenOrgCost / 2;
    smearedAlcoholCost += hiddenOrgCost / 2;
  }

  // 4. Применяем Risk Margin ко всему
  const riskMultiplier = 1 + riskMargin / 100;
  const finalFoodPool = smearedFoodCost * riskMultiplier;
  const finalAlcoholPool = smearedAlcoholCost * riskMultiplier;
  const finalPublicOrgPool = publicOrgCost * riskMultiplier;

  // 5. Считаем доли по всем участникам
  let totalFoodShares = 0;
  let totalAlcoholShares = 0;
  let validParticipantsCount = participants.length;

  participants.forEach((p) => {
    totalFoodShares += calculateShares(p.food);
    totalAlcoholShares += calculateShares(p.alcohol);
  });

  // 6. Стоимость 1 доли и 1 человека
  const costPerFoodShare =
    totalFoodShares > 0 ? finalFoodPool / totalFoodShares : 0;
  const costPerAlcoholShare =
    totalAlcoholShares > 0 ? finalAlcoholPool / totalAlcoholShares : 0;
  const publicOrgPerPerson =
    validParticipantsCount > 0
      ? finalPublicOrgPool / validParticipantsCount
      : 0;

  // 7. Считаем итоговый чек для каждого участника
  const checks = participants.map((p) => {
    const pFoodShares = calculateShares(p.food);
    const pAlcoholShares = calculateShares(p.alcohol);

    const foodCost = pFoodShares * costPerFoodShare;
    const alcoholCost = pAlcoholShares * costPerAlcoholShare;
    const totalCost = foodCost + alcoholCost + publicOrgPerPerson;

    return {
      ...p,
      foodShares: pFoodShares,
      alcoholShares: pAlcoholShares,
      foodCost: foodCost,
      alcoholCost: alcoholCost,
      publicOrgCost: publicOrgPerPerson,
      totalCost: totalCost,
    };
  });

  return {
    rawStats: { food: rawFoodCost, alcohol: rawAlcoholCost, org: rawOrgCost },
    finalPools: {
      food: finalFoodPool,
      alcohol: finalAlcoholPool,
      org: finalPublicOrgPool,
    },
    unitCosts: {
      foodShare: costPerFoodShare,
      alcoholShare: costPerAlcoholShare,
      publicOrg: publicOrgPerPerson,
    },
    totals: {
      foodShares: totalFoodShares,
      alcoholShares: totalAlcoholShares,
      participants: validParticipantsCount,
    },
    checks,
  };
}
