function doPost(e) {
  // Настройка: ID вашей таблицы (если скрипт привязан к таблице, можно оставить SpreadsheetApp.getActiveSpreadsheet())
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  try {
    // Парсим входящие данные из формы (JSON)
    var data = JSON.parse(e.postData.contents);
    
    // Подготавливаем строку для записи
    var rowData = [
      new Date(), // Timestamp
      data.applicationType || '',
      data.groupConditions || '',
      data.applicant.nickname || '',
      data.applicant.firstName || '',
      data.applicant.lastName || '',
      data.applicant.phone || '',
      // Транспорт туда
      data.transportTo.method || '',
      data.transportTo.freeSeats || '',
      data.transportTo.day || '',
      data.transportTo.time || '',
      // Транспорт обратно
      data.transportFrom.method || '',
      data.transportFrom.freeSeats || '',
      data.transportFrom.day || '',
      data.transportFrom.time || '',
      data.transportComment || '',
      // Обеспечение Заявителя
      data.applicant.provisions.food || '',
      (data.applicant.provisions.foodPeriods || []).join(', '),
      data.applicant.provisions.alcohol || '',
      (data.applicant.provisions.alcoholPeriods || []).join(', '),
      // Проживание
      data.accommodation || '',
      (data.nights || []).join(', '),
      data.accommodationComment || '',
      // Доп инфо
      data.freeMic || '',
      // Гости (сохраняем как JSON строку для удобства или можно разбивать на колонки)
      JSON.stringify(data.guests || [])
    ];
    
    // Добавляем строку в таблицу
    sheet.appendRow(rowData);
    
    // Возвращаем успешный ответ для нашей веб-формы (CORS заголовки обязательны)
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    // В случае ошибки
    return ContentService.createTextOutput(JSON.stringify({ "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Этот метод нужен, чтобы Google Apps Script отвечал на предварительные CORS запросы (OPTIONS) от браузера
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}
