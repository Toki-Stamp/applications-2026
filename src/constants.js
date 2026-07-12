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
  SELF: 'self',
  SAME_AS_TO: 'same_as_to'
};

export const days = ['Пятница', 'Суббота', 'Воскресенье'];

export const transportMethods = [
  { label: 'Как водитель', value: TRANSPORT_METHOD.DRIVER },
  { label: 'Ищу место в авто', value: TRANSPORT_METHOD.PASSENGER },
  { label: 'На организованной маршрутке', value: TRANSPORT_METHOD.BUS },
  { label: 'Самостоятельно', value: TRANSPORT_METHOD.SELF }
];

export const transportMethodsFrom = [
  { label: 'Тот же, что и туда', value: TRANSPORT_METHOD.SAME_AS_TO },
  { label: 'Ищу место в авто', value: TRANSPORT_METHOD.PASSENGER },
  { label: 'На организованной маршрутке', value: TRANSPORT_METHOD.BUS },
  { label: 'Самостоятельно', value: TRANSPORT_METHOD.SELF }
];

export const groupedPeriods = [
  {
    day: 'В пятницу',
    periods: [
      { id: 'fri-morn', label: 'Утро', helperText: 'до обеда' },
      { id: 'fri-eve', label: 'Вечер', helperText: 'после обеда' }
    ]
  },
  {
    day: 'В субботу',
    periods: [
      { id: 'sat-morn', label: 'Утро', helperText: 'до обеда' },
      { id: 'sat-eve', label: 'Вечер', helperText: 'после обеда' }
    ]
  },
  {
    day: 'В воскресенье',
    periods: [
      { id: 'sun-morn', label: 'Утро', helperText: 'до обеда' }
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
  { id: 'fri-sat', label: 'С пятницы на субботу' },
  { id: 'sat-sun', label: 'С субботы на воскресенье' }
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
