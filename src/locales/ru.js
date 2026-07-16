export const dict = {
  options: {
    transportMethodsTo: {
      driver: "Как водитель",
      passenger: "Ищу место в авто",
      bus: "На организованной маршрутке",
      self: "Самостоятельно",
    },
    days: ["Пятница", "Суббота", "Воскресенье"],
    groupedPeriods: {
      friday: "В пятницу",
      saturday: "В субботу",
      sunday: "В воскресенье",
      morn: "Утро",
      mornHelper: "до обеда",
      eve: "Вечер",
      eveHelper: "после обеда",
    },
    groupSize: {
      2: "Всего 2 участника",
      3: "Всего 3 участника",
      4: "Всего 4 участника",
      5: "Всего 5 участников",
    },
    food: {
      none: "Без питания",
      required: "Буду кушать",
    },
    alcohol: {
      none: "Без алкоголя",
      required: "Буду выпивать",
    },
    nights: {
      friSat: "С пятницы на субботу",
      satSun: "С субботы на воскресенье",
    },
    accommodation: {
      self: "Размещаюсь самостоятельно",
      booking: "Требуется забронировать номер на базе",
    },
    freeSeats: {
      0: "Нет мест",
      1: "1 место",
      2: "2 места",
      3: "3 места",
      4: "4 места",
      5: "5 и более",
    },
  },
  errors: {
    radio: (label) => [
      { text: "Пожалуйста, выберите один из вариантов для поля " },
      {
        text: typeof label === "string" ? label.toUpperCase() : label,
        highlight: true,
      },
      { text: ". Без этих данных мы не сможем двигаться дальше" },
    ],
    periods:
      "Пожалуйста, отметьте необходимые периоды, чтобы мы могли всё правильно организовать",
    nights: (label) => [
      { text: "Пожалуйста, выберите хотя бы одну ночь для поля " },
      {
        text: typeof label === "string" ? label.toUpperCase() : label,
        highlight: true,
      },
      { text: ", в которую вы планируете остаться" },
    ],
    textRequired: "Это поле обязательно для заполнения",
    invalidPhone: "Неверный номер телефона",
    selectPeriods: "Пожалуйста, выберите периоды",
    selectNights: "Пожалуйста, выберите хотя бы одну ночь",
  },
  common: {
    cancel: "Отмена",
    clear: "Очистить",
    clearForm: "Очистить форму",
    start: "Начать заполнение",
    back: "Назад",
    continue: "Продолжить",
    submit: "Отправить заявку",
    submitting: "Подождите, идет отправка",
    fillDataToContinue: "Заполните данные, чтобы продолжить",
    notEnoughData: "Недостаточно данных для отправки",
    next: "Далее",
  },
  modals: {
    clear: {
      title: "Очистить форму?",
      body: "Вы уверены, что хотите безвозвратно удалить все введенные данные?",
    },
    submitError: {
      title: "Сбой при отправке!",
      reasonPrefix: "Причина: ",
      hint: "Попробуйте позже или проверьте правильность развертывания скрипта",
      gotIt: "Понятно",
    },
    draft: {
      title: "С возвращением!",
      body1: "У Вас осталась неотправленная заявка.",
      body2: "Хотите продолжить её заполнение или начать всё заново?",
      restart: "Начать заново",
      continue: "Продолжить",
    },
  },
  layout: {
    header: {
      titleText: "аявка 2026",
    },
  },
  steps: {
    intro: {
      title: "Вводная информация",
      hint1: [
        { text: "Дорогие друзья, нас ждёт " },
        { text: "юбилейная", highlight: true, upper: true },
        { text: " сходка! Нам исполняется " },
        { text: "15", highlight: true },
        { text: " лет!" },
      ],
      datesTitle: "Дата проведения",
      datesSubtitle: [{ text: "С 7 по 9 августа 2026:", bold: true }],
      datesList: [
        [
          { text: "Пятница:", bold: true, highlight: true, upper: true },
          { text: " шоу начинается!" },
        ],
        [
          { text: "Суббота:", bold: true, highlight: true, upper: true },
          { text: " без забот =)" },
        ],
        [
          { text: "Воскресенье:", bold: true, highlight: true, upper: true },
          { text: " ну вот, опять домой..." },
        ],
      ],
      contactsTitle: "Контакты организаторов",
      contactsSubtitle: "Для решения организационных вопросов:",
      contacts: [
        { nick: "Booze", name: "Юрий Фомичёв" },
        { nick: "krez_by", name: "Алексей Лужинский" },
      ],
      hint2Prefix:
        "Кстати, вы можете настроить внешний вид приложения под себя! Нажмите на ",
      hint2Suffix: " в левом верхнем углу, чтобы выбрать любимую цветовую тему",
    },
    applicationType: {
      title: "Формат участия",
      typeLabel: "Тип заявки",
      individualLabel: "Индивидуальная",
      individualHelper: "подаётся только за самого себя (на одного человека)",
      groupLabel: "Групповая",
      groupHelper:
        "подаётся в случае если Вы планируете посетить мероприятие группой (от двух до пяти человек)",
      totalSizeLabel: "Общее количество участников Вашей группы",
      totalSizeHelper:
        "указывается общее число людей, включая Вас как руководителя группы",
      totalSizePlaceholder: "Выберите размер группы...",
      conditionsLabel: "Условия для участников Вашей группы",
      unifiedLabel: "Единые условия",
      unifiedHelper:
        "условия проживания и обеспечение полностью совпадают с Вашими",
      differentialLabel: "Дифференцированные условия",
      differentialHelper:
        "индивидуальные предпочтения для каждого из участников Вашей группы",
    },
    personalData: {
      title: "Персональные данные",
      applicantTitleGroup: "Заявитель",
      nicknameLabel: "Никнейм",
      nicknamePlaceholder: "cyber_ninja",
      firstNameLabel: "Имя",
      firstNamePlaceholder: "Иван",
      lastNameLabel: "Фамилия",
      lastNamePlaceholder: "Иванов",
      phoneLabel: "Номер телефона",
      groupTitle: "Состав группы",
      guestTitle: (index) => `Гость #${index}`,
    },
    transportation: {
      title: "Транспорт",
      groupHint1: [
        { text: "Для " },
        { text: "групповых заявок", highlight: true, upper: true },
        {
          text: " условия транспортировки распространяются на всех участников группы единым образом",
        },
      ],
      groupHint2: [
        {
          text: "Если кому-то из участников требуется другой вид транспорта или иное время выезда, пожалуйста, оформите на них отдельные ",
        },
        { text: "индивидуальные заявки", highlight: true, upper: true },
      ],
      toTitle: `Дорога туда`,
      toMethodLabel: "Способ прибытия",
      toMethodPlaceholder: "Выберите способ...",
      freeSeatsLabel: "Свободных мест для попутчиков",
      freeSeatsPlaceholder: "Укажите кол-во...",
      toDayLabel: "День отправления на базу",
      toDayPlaceholder: "Выберите день...",
      toTimeLabel: "Ориентировочное время отправления",
      toCityLabel: "Город отправления",
      toCityPlaceholder: "Введите город...",
      fromTitle: `Дорога обратно`,
      fromMethodLabel: "Способ отъезда",
      fromMethodPlaceholder: "Выберите способ...",
      fromDayLabel: "День отъезда с базы",
      fromDayPlaceholder: "Выберите день...",
      fromTimeLabel: "Ориентировочное время отъезда",
      commentTitle: `Дополнительно по транспорту`,
      commentLabel: "Комментарий к дороге",
      commentPlaceholder: "Напишите здесь всё, что считаете важным...",
      driverHint: `"есть багажник для общих вещей", "готов забрать груз до 1 тонны" или "еду на мотоцикле без мест"`,
      passengerHint: `"укачивает на заднем сиденье", "беру с собой большую гитару" или "готов помочь с погрузкой"`,
    },
    provisions: {
      title: "Обеспечение",
      foodTitle: `Продукты питания`,
      foodLabel: "Потребность в питании",
      alcoholTitle: `Алкогольные напитки`,
      alcoholLabel: "Потребность в алкоголе",
      diffHint: "Укажите потребности для каждого участника группы отдельно",
      forApplicant: (name) => `Для ${name}`,
      forGuest: (name) => `Для ${name}`,
    },
    accommodation: {
      title: "Проживание",
      typeLabel: "Потребность в проживании",
      nightsLabel: "Укажите ночевки",
      commentLabel: "Дополнительные комментарии к проживанию и обеспечению",
      commentPlaceholder: "Напишите здесь всё, что считаете важным...",
      commentHint: `"нужен 2-местный номер с тихой кроватью", "не пью из-за язвы" или "проживание не нужно, беру палатку и надувную лодку".`,
      diffHint: "Укажите потребности для каждого участника группы отдельно",
      forApplicant: (name) => `Для ${name}`,
      forGuest: (name) => `Для ${name}`,
    },
    freeMic: {
      title: "Свободный микрофон",
      commentLabel: "Комментарий или пожелания",
      commentPlaceholder: "Напишите здесь всё, что считаете важным...",
      commentHint:
        "В этом пункте Вы можете уточнить любые детали или добавить информацию, которая не вошла в предыдущие шаги заявки",
    },
    outro: {
      title: "Ваша заявка принята!",
      body: [
        { text: "Да прибудет с Вами сила зубра!" },
        { text: "А теперь степенно ожидайте дня сходки..." },
      ],
      newForm: "Заполнить новую заявку",
    },
  },
};
