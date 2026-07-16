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
        "Group ID",
        "Роль",
        "Тип заявки",
        "Условия питания",
        "Никнейм",
        "Имя",
        "Фамилия",
        "Телефон",
        "Транспорт ТУДА",
        "Город выезда",
        "Свободные места",
        "День выезда",
        "Время выезда",
        "Транспорт ОБРАТНО",
        "День возвращения",
        "Время возвращения",
        "Коммент (Транспорт)",
        "Еда",
        "Приемы пищи",
        "Алкоголь",
        "Приемы алкоголя",
        "Проживание",
        "Ночевки",
        "Коммент (Проживание)",
        "Свободный микрофон",
      ]);
      sheet.setFrozenRows(1); // Закрепляем шапку
      // Можно также задать стиль шапки (жирный шрифт, фон), если нужно
      sheet
        .getRange(1, 1, 1, 26)
        .setFontWeight("bold")
        .setBackground("#f3f4f6");
    }

    var timestamp = new Date();
    // Генерируем уникальный ID группы на основе времени и последних цифр телефона заявителя
    var phoneDigits = (data.applicant.phone || "0000")
      .replace(/\D/g, "")
      .slice(-4);
    var groupId =
      "GRP-" + timestamp.getTime().toString().slice(-6) + "-" + phoneDigits;

    // Вспомогательная функция для создания строки для одного человека
    function createRow(person, role) {
      return [
        timestamp, // 1. Timestamp (Время подачи заявки)
        groupId, // 2. Group ID (Связывает гостей с заявителем)
        role, // 3. Роль (Заявитель / Гость)
        data.applicationType || "", // 4. Тип заявки (individual/group)
        data.groupConditions || "", // 5. Условия питания группы (unified/differential)

        // Личные данные
        person.nickname || "", // 6. Никнейм
        person.firstName || "", // 7. Имя
        person.lastName || "", // 8. Фамилия
        person.phone || "", // 9. Телефон

        // Транспорт туда (дублируется для всей группы)
        data.transportTo.method || "", // 10. Транспорт ТУДА
        data.transportTo.departureCity || "", // 11. Город выезда
        data.transportTo.freeSeats || "", // 12. Свободные места
        data.transportTo.day || "", // 13. День выезда
        data.transportTo.time || "", // 14. Время выезда

        // Транспорт обратно (дублируется для всей группы)
        data.transportFrom.method || "", // 15. Транспорт ОБРАТНО
        data.transportFrom.day || "", // 16. День возвращения
        data.transportFrom.time || "", // 17. Время возвращения
        data.transportComment || "", // 18. Комментарий к транспорту

        // Питание (индивидуальное для каждого человека)
        person.provisions.food || "", // 19. Еда (provided/none)
        (person.provisions.foodPeriods || []).join(", "), // 20. Приемы пищи
        person.provisions.alcohol || "", // 21. Алкоголь (provided/none)
        (person.provisions.alcoholPeriods || []).join(", "), // 22. Приемы алкоголя

        // Проживание (индивидуальное для каждого человека в v2)
        person.accommodation.type || "", // 23. Проживание (tent/booking/self)
        (person.accommodation.nights || []).join(", "), // 24. Ночевки
        person.accommodation.comment || "", // 25. Комментарий к проживанию

        // Свободный микрофон (дублируется для всей группы)
        data.freeMic || "", // 26. Свободный микрофон
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
