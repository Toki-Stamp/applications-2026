function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("🛠 Управление заявками")
    .addItem("Очистить все данные (Wipe)", "wipeData")
    .addToUi();
}

function wipeData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    "Внимание!",
    "Вы уверены, что хотите полностью удалить все данные с этого листа? Это действие нельзя отменить.",
    ui.ButtonSet.YES_NO,
  );

  if (response == ui.Button.YES) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.clear();
    // Снимаем закрепление строк
    sheet.setFrozenRows(0);
    ui.alert(
      "Готово",
      "Все данные удалены. При следующей отправке заявки заголовки сгенерируются заново.",
      ui.ButtonSet.OK,
    );
  }
}

function doPost(e) {
  // Инициализируем блокировку для предотвращения race conditions
  var lock = LockService.getScriptLock();
  try {
    // Ждем до 30 секунд, пока другой процесс освободит блокировку
    lock.waitLock(30000);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({
        error:
          "Сервер сейчас перегружен. Пожалуйста, попробуйте отправить заявку еще раз.",
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    // Настройка: ID вашей таблицы (если скрипт привязан к таблице, можно оставить SpreadsheetApp.getActiveSpreadsheet())
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Парсим входящие данные из формы (JSON)
    var data = JSON.parse(e.postData.contents);

    // Автоматическое создание заголовков, если таблица пустая
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Время подачи",
        "Application ID",
        "Group ID",
        "Status",
        "Роль",
        "Тип заявки",
        "Условия группы",
        "Никнейм",
        "Имя",
        "Фамилия",
        "Телефон",
        "Транспорт ТУДА",
        "",
        "",
        "",
        "",
        "Транспорт ОБРАТНО",
        "",
        "",
        "Коммент (Транспорт)",
        "Еда",
        "Приемы пищи",
        "",
        "",
        "Алкоголь",
        "Приемы алкоголя",
        "",
        "",
        "Коммент (Питание)",
        "Проживание",
        "Ночевки",
        "",
        "Коммент (Проживание)",
        "Свободный микрофон",
      ]);
      sheet.appendRow([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
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
        "Пт-Сб",
        "Сб-Вс",
        "",
        "",
      ]);
      sheet.setFrozenRows(2); // Закрепляем шапку
      sheet
        .getRange(1, 1, 2, 34)
        .setFontWeight("bold")
        .setBackground("#f3f4f6");
    }

    var timestamp = new Date();

    var applicationId = data.applicationId || "NO-ID";
    var groupId =
      data.applicationType === "group"
        ? applicationId.split("-")[0].toUpperCase()
        : "";
    var currentStatus = "New";

    // Поиск старых строк и обновление статуса
    if (sheet.getLastRow() > 2) {
      var idRange = sheet.getRange(3, 2, sheet.getLastRow() - 2, 1);
      var idValues = idRange.getValues();
      var statusRange = sheet.getRange(3, 4, sheet.getLastRow() - 2, 1);
      var statusValues = statusRange.getValues();
      var changed = false;

      for (var j = 0; j < idValues.length; j++) {
        if (
          idValues[j][0] === applicationId &&
          statusValues[j][0] !== "Obsolete"
        ) {
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

    var DICT_PROVISION = { required: "Да", none: "Нет" };
    function translateProvision(val) {
      return DICT_PROVISION[val] || val || "";
    }

    var DICT_ACCOMMODATION = { booking: "Бронь базы", self: "Самостоятельно" };
    function translateAccommodation(val) {
      return DICT_ACCOMMODATION[val] || val || "";
    }

    var DICT_TRANSPORT = {
      driver: "Водитель",
      passenger: "Пассажир",
      bus: "Маршрутка",
      self: "Свой ход",
      with_applicant: "Гость"
    };
    function translateTransport(val) {
      return DICT_TRANSPORT[val] || val || "";
    }

    // Вспомогательная функция для создания строки для одного человека
    function createRow(person, role, transportTo, transportFrom) {
      var appTypeRu =
        data.applicationType === "individual"
          ? "Индивидуальная"
          : data.applicationType === "group"
            ? "Групповая"
            : "";
      var groupCondRu =
        data.groupConditions === "unified"
          ? "Единые"
          : data.groupConditions === "differential"
            ? "Дифференцированные"
            : data.applicationType === "individual"
              ? "-"
              : "";

      return [
        timestamp, // 1. Timestamp (Время подачи заявки)
        applicationId, // 2. Application ID
        groupId, // 3. Group ID
        currentStatus, // 4. Status
        role, // 5. Роль (Заявитель / Гость)
        appTypeRu, // 6. Тип заявки (individual/group)
        groupCondRu, // 7. Условия питания группы (unified/differential)

        // Личные данные
        person.nickname || "", // 8. Никнейм
        person.firstName || "", // 9. Имя
        person.lastName || "", // 10. Фамилия
        person.phone || "", // 11. Телефон

        // Транспорт туда (теперь берем из переданного аргумента)
        translateTransport(transportTo.method), // 11. Транспорт ТУДА
        transportTo.departureCity || "", // 12. Город выезда
        transportTo.freeSeats || "", // 13. Свободные места
        transportTo.day || "", // 14. День выезда
        transportTo.time || "", // 15. Время выезда

        // Транспорт обратно (теперь берем из переданного аргумента)
        translateTransport(transportFrom.method), // 16. Транспорт ОБРАТНО
        transportFrom.day || "", // 17. День возвращения
        transportFrom.time || "", // 18. Время возвращения
        data.transportComment || "", // 19. Комментарий к транспорту

        // Питание (индивидуальное для каждого человека)
        translateProvision(person.provisions.food), // 20. Еда (provided/none)
        calculatePeriodScore(person.provisions.foodPeriods, "fri"), // 21. Пт
        calculatePeriodScore(person.provisions.foodPeriods, "sat"), // 22. Сб
        calculatePeriodScore(person.provisions.foodPeriods, "sun"), // 23. Вс
        translateProvision(person.provisions.alcohol), // 24. Алкоголь (provided/none)
        calculatePeriodScore(person.provisions.alcoholPeriods, "fri"), // 25. Пт
        calculatePeriodScore(person.provisions.alcoholPeriods, "sat"), // 26. Сб
        calculatePeriodScore(person.provisions.alcoholPeriods, "sun"), // 27. Вс
        person.provisions.comment || "", // 28. Комментарий к питанию

        // Проживание (индивидуальное для каждого человека в v2)
        translateAccommodation(person.accommodation.type), // 29. Проживание (booking/self)
        (person.accommodation.nights || []).includes("fri-sat") ? 1 : "", // 30. Пт-Сб
        (person.accommodation.nights || []).includes("sat-sun") ? 1 : "", // 31. Сб-Вс
        person.accommodation.comment || "", // 32. Комментарий к проживанию

        // Свободный микрофон (дублируется для всей группы)
        data.freeMic || "", // 33. Свободный микрофон
      ];
    }

    // 1. Сохраняем Заявителя
    sheet.appendRow(createRow(data.applicant, "Заявитель", data.transportTo, data.transportFrom));

    // 2. Если есть гости, сохраняем каждого гостя отдельной строкой
    if (
      data.applicationType === "group" &&
      data.guests &&
      data.guests.length > 0
    ) {
      for (var i = 0; i < data.guests.length; i++) {
        var gTransportTo = data.guests[i].transportTo || data.transportTo;
        var gTransportFrom = data.guests[i].transportFrom || data.transportFrom;
        sheet.appendRow(createRow(data.guests[i], "Гость " + (i + 1), gTransportTo, gTransportFrom));
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
  } finally {
    // Гарантированно снимаем блокировку после завершения работы (или при ошибке)
    lock.releaseLock();
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
    .setHeaders(headers); // Note: setHeaders работает только если GAS развернут определенным образом, но для OPTIONS обычно прощают
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  try {
    var lastRow = sheet.getLastRow();
    if (lastRow <= 2) {
      return ContentService.createTextOutput(
        JSON.stringify({ participants: [] }),
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Получаем все данные со 3-й строки
    var dataRange = sheet.getRange(3, 1, lastRow - 2, 34);
    var values = dataRange.getDisplayValues();

    var participants = [];

    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var status = row[3]; // Status (index 3)

      if (status === "Obsolete") {
        continue;
      }

      participants.push({
        groupId: row[2] || "",
        role: row[4] || "",
        nickname: row[7] || "",
        firstName: row[8] || "",
        lastName: row[9] || "",
        phone: row[10] || "",

        transportTo: {
          method: row[11] || "",
          city: row[12] || "",
          seats: row[13] || "",
          day: row[14] || "",
          time: row[15] || "",
        },

        transportFrom: {
          method: row[16] || "",
          day: row[17] || "",
          time: row[18] || "",
        },

        food: {
          type: row[19] || "",
          fri: row[20] || "",
          sat: row[21] || "",
          sun: row[22] || "",
        },

        alcohol: {
          type: row[23] || "",
          fri: row[24] || "",
          sat: row[25] || "",
          sun: row[26] || "",
        },

        accommodation: {
          type: row[28] || "",
          friSat: row[29] || "",
          satSun: row[30] || "",
        },
      });
    }

    return ContentService.createTextOutput(
      JSON.stringify({ participants: participants }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.toString() }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
