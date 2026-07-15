export const APPLICATION_TYPE = {
  INDIVIDUAL: 'individual',
  GROUP: 'group'
};

export const GROUP_CONDITIONS = {
  UNIFIED: 'unified',
  DIFFERENTIAL: 'differential'
};

export const PROVISION_TYPE = {
  NONE: 'none',
  REQUIRED: 'required'
};

export const ACCOMMODATION_TYPE = {
  SELF: 'self',
  BOOKING: 'booking'
};

export const TRANSPORT_METHOD = {
  DRIVER: 'driver',
  PASSENGER: 'passenger',
  BUS: 'bus',
  SELF: 'self'
};

export const days = ['Пятница', 'Суббота', 'Воскресенье'];

export const transportMethodsTo = [
  { label: 'Как водитель', value: TRANSPORT_METHOD.DRIVER },
  { label: 'Ищу место в авто', value: TRANSPORT_METHOD.PASSENGER },
  { label: 'На организованной маршрутке', value: TRANSPORT_METHOD.BUS },
  { label: 'Самостоятельно', value: TRANSPORT_METHOD.SELF }
];

// transportMethodsFrom is removed, use transportMethodsTo for both directions.



export const groupedPeriods = [
  {
    day: 'В пятницу',
    items: [
      { id: 'fri-morn', label: 'Утро', helperText: 'до обеда', icon: 'wb_sunny' },
      { id: 'fri-eve', label: 'Вечер', helperText: 'после обеда', icon: 'nightlight_round' }
    ]
  },
  {
    day: 'В субботу',
    items: [
      { id: 'sat-morn', label: 'Утро', helperText: 'до обеда', icon: 'wb_sunny' },
      { id: 'sat-eve', label: 'Вечер', helperText: 'после обеда', icon: 'nightlight_round' }
    ]
  },
  {
    day: 'В воскресенье',
    items: [
      { id: 'sun-morn', label: 'Утро', helperText: 'до обеда', icon: 'wb_sunny' }
    ]
  }
];

export const groupSizeOptions = [
  { label: 'Всего 2 участника', value: 2 },
  { label: 'Всего 3 участника', value: 3 },
  { label: 'Всего 4 участника', value: 4 },
  { label: 'Всего 5 участников', value: 5 }
];

export const foodOptions = [
  { label: 'Без питания', value: PROVISION_TYPE.NONE },
  { label: 'Буду кушать', value: PROVISION_TYPE.REQUIRED }
];

export const alcoholOptions = [
  { label: 'Без алкоголя', value: PROVISION_TYPE.NONE },
  { label: 'Буду выпивать', value: PROVISION_TYPE.REQUIRED }
];

export const nightsList = [
  {
    items: [
      { id: 'fri-sat', label: 'С пятницы на субботу', icon: 'bedtime' },
      { id: 'sat-sun', label: 'С субботы на воскресенье', icon: 'bedtime' }
    ]
  }
];

export const accommodationOptions = [
  { label: 'Размещаюсь самостоятельно', value: ACCOMMODATION_TYPE.SELF },
  { label: 'Требуется забронировать номер на базе', value: ACCOMMODATION_TYPE.BOOKING }
];

export const freeSeatsOptions = [
  { label: 'Нет мест', value: 0 },
  { label: '1 место', value: 1 },
  { label: '2 места', value: 2 },
  { label: '3 места', value: 3 },
  { label: '4 места', value: 4 },
  { label: '5 и более', value: 5 }
];

export const ERROR_MESSAGES = {
  RADIO: (label) => ({
    prefix: 'Пожалуйста, выберите один из вариантов для поля ',
    label: typeof label === 'string' ? label.toUpperCase() : label,
    suffix: '. Без этих данных мы не сможем двигаться дальше'
  }),

  PERIODS: (label) => ({
    prefix: 'Пожалуйста, отметьте необходимые периоды, чтобы мы могли всё правильно организовать',
    label: '',
    suffix: ''
  }),
  NIGHTS: (label) => ({
    prefix: 'Пожалуйста, выберите хотя бы одну ночь для поля ',
    label: typeof label === 'string' ? label.toUpperCase() : label,
    suffix: ', в которую вы планируете остаться'
  }),
  TEXT: "Это поле обязательно для заполнения"
};

// URL веб-приложения Google Apps Script (замените на свой после деплоя скрипта)
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';
