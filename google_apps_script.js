function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🛠 Управление заявками')
    .addItem('Очистить все данные (Wipe)', 'wipeData')
    .addToUi();
}

function wipeData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('Внимание!', 'Вы уверены, что хотите полностью удалить все данные с этого листа? Это действие нельзя отменить.', ui.ButtonSet.YES_NO);

  if (response == ui.Button.YES) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.clear();
    // Снимаем закрепление строк
    sheet.setFrozenRows(0);
    ui.alert('Готово', 'Все данные удалены. При следующей отправке заявки заголовки сгенерируются заново.', ui.ButtonSet.OK);
  }
}

function doPost(e) {
  // Настройка: ID вашей таблицы (если скрипт привязан к таблице, можно оставить SpreadsheetApp.getActiveSpreadsheet())
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  try {
    // Парсим входящие данные из формы (JSON)
    var data = JSON.parse(e.postData.contents);

    // Автоматическое создание заголовков, если таблица пустая
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Время подачи",
        "Application ID",
        "Status",
        "Роль",
        "Тип заявки",
        "Условия питания",
        "Никнейм",
        "Имя",
        "Фамилия",
        "Телефон",
        "Транспорт ТУДА",
        "", "", "", "",
        "Транспорт ОБРАТНО",
        "", "",
        "Коммент (Транспорт)",
        "Еда",
        "Приемы пищи",
        "", "",
        "Алкоголь",
        "Приемы алкоголя",
        "", "",
        "Коммент (Питание)",
        "Проживание",
        "Ночевки",
        "Коммент (Проживание)",
        "Свободный микрофон",
      ]);
      sheet.appendRow([
        "", "", "", "", "", "", "", "", "", "",
        "Метод",
        "Город выезда",
        "Свободные места",
        "День выезда",
        "Время выезда",
        "Метод",
        "День возвращения",
        "Время возвращения",
        "",
        "Условия",
        "Пт",
        "Сб",
        "Вс",
        "Условия",
        "Пт",
        "Сб",
        "Вс",
        "",
        "Тип",
        "Дни",
        "", ""
      ]);
      sheet.setFrozenRows(2); // Закрепляем шапку
      sheet
        .getRange(1, 1, 2, 32)
        .setFontWeight("bold")
        .setBackground("#f3f4f6");
    }

    var timestamp = new Date();

    var applicationId = data.applicationId || "NO-ID";
    var currentStatus = "New";

    // Поиск старых строк и обновление статуса
    if (sheet.getLastRow() > 2) {
      var idRange = sheet.getRange(3, 2, sheet.getLastRow() - 2, 1);
      var idValues = idRange.getValues();
      var statusRange = sheet.getRange(3, 3, sheet.getLastRow() - 2, 1);
      var statusValues = statusRange.getValues();
      var changed = false;

      for (var j = 0; j < idValues.length; j++) {
        if (idValues[j][0] === applicationId && statusValues[j][0] !== "Obsolete") {
          statusValues[j][0] = "Obsolete";
          changed = true;
          currentStatus = "Updated";
        }
      }

      if (changed) {
        statusRange.setValues(statusValues);
      }
    }

    function calculatePeriodScore(periods, dayPrefix) {
      if (!periods || !periods.length) return 0;
      var hasMorn = periods.indexOf(dayPrefix + "-morn") !== -1;
      var hasEve = periods.indexOf(dayPrefix + "-eve") !== -1;
      if (hasMorn && hasEve) return 2;
      if (hasMorn || hasEve) return 1;
      return 0;
    }

    // Вспомогательная функция для создания строки для одного человека
    function createRow(person, role) {
      var appTypeRu = data.applicationType === "individual" ? "Индивидуальная" : (data.applicationType === "group" ? "Групповая" : "");
      var groupCondRu = data.groupConditions === "unified" ? "Единые" : (data.groupConditions === "differential" ? "Дифференцированные" : (data.applicationType === "individual" ? "-" : ""));

      return [
        timestamp, // 1. Timestamp (Время подачи заявки)
        applicationId, // 2. Application ID
        currentStatus, // 3. Status
        role, // 4. Роль (Заявитель / Гость)
        appTypeRu, // 5. Тип заявки (individual/group)
        groupCondRu, // 6. Условия питания группы (unified/differential)

        // Личные данные
        person.nickname || "", // 7. Никнейм
        person.firstName || "", // 8. Имя
        person.lastName || "", // 9. Фамилия
        person.phone || "", // 10. Телефон

        // Транспорт туда (дублируется для всей группы)
        data.transportTo.method || "", // 11. Транспорт ТУДА
        data.transportTo.departureCity || "", // 12. Город выезда
        data.transportTo.freeSeats || "", // 13. Свободные места
        data.transportTo.day || "", // 14. День выезда
        data.transportTo.time || "", // 15. Время выезда

        // Транспорт обратно (дублируется для всей группы)
        data.transportFrom.method || "", // 16. Транспорт ОБРАТНО
        data.transportFrom.day || "", // 17. День возвращения
        data.transportFrom.time || "", // 18. Время возвращения
        data.transportComment || "", // 19. Комментарий к транспорту

        // Питание (индивидуальное для каждого человека)
        person.provisions.food || "", // 20. Еда (provided/none)
        calculatePeriodScore(person.provisions.foodPeriods, "fri"), // 21. Пт
        calculatePeriodScore(person.provisions.foodPeriods, "sat"), // 22. Сб
        calculatePeriodScore(person.provisions.foodPeriods, "sun"), // 23. Вс
        person.provisions.alcohol || "", // 24. Алкоголь (provided/none)
        calculatePeriodScore(person.provisions.alcoholPeriods, "fri"), // 25. Пт
        calculatePeriodScore(person.provisions.alcoholPeriods, "sat"), // 26. Сб
        calculatePeriodScore(person.provisions.alcoholPeriods, "sun"), // 27. Вс
        person.provisions.comment || "", // 28. Комментарий к питанию

        // Проживание (индивидуальное для каждого человека в v2)
        person.accommodation.type || "", // 29. Проживание (tent/booking/self)
        (person.accommodation.nights || []).join(", "), // 30. Ночевки
        person.accommodation.comment || "", // 31. Комментарий к проживанию

        // Свободный микрофон (дублируется для всей группы)
        data.freeMic || "", // 32. Свободный микрофон
      ];
    }

    // 1. Сохраняем Заявителя
    sheet.appendRow(createRow(data.applicant, "Заявитель"));

    // 2. Если есть гости, сохраняем каждого гостя отдельной строкой
    if (
      data.applicationType === "group" &&
      data.guests &&
      data.guests.length > 0
    ) {
      for (var i = 0; i < data.guests.length; i++) {
        sheet.appendRow(createRow(data.guests[i], "Гость " + (i + 1)));
      }
    }

    // Возвращаем успешный ответ для нашей веб-формы (CORS заголовки обязательны)
    return ContentService.createTextOutput(
      JSON.stringify({ result: "success" }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // В случае ошибки возвращаем JSON с описанием
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.toString() }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Этот метод нужен, чтобы Google Apps Script отвечал на предварительные CORS запросы (OPTIONS) от браузера
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}
