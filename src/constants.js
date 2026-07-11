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
  { label: 'Как водитель', value: TRANSPORT_METHOD.DRIVER },
  { label: 'Ищу место в авто', value: TRANSPORT_METHOD.PASSENGER },
  { label: 'На организованной маршрутке', value: TRANSPORT_METHOD.BUS },
  { label: 'Самостоятельно', value: TRANSPORT_METHOD.SELF }
];

export const periods = [
  { id: 'fri-morn', label: 'Пятница: Утро', helperText: 'до обеда' },
  { id: 'fri-eve', label: 'Пятница: Вечер', helperText: 'после обеда' },
  { id: 'sat-morn', label: 'Суббота: Утро', helperText: 'до обеда' },
  { id: 'sat-eve', label: 'Суббота: Вечер', helperText: 'после обеда' },
  { id: 'sun-morn', label: 'Воскресенье: Утро', helperText: 'до обеда' },
];

export const groupedPeriods = [
  {
    day: 'Пятница',
    periods: [
      { id: 'fri-morn', label: 'Утро', helperText: 'до обеда' },
      { id: 'fri-eve', label: 'Вечер', helperText: 'после обеда' }
    ]
  },
  {
    day: 'Суббота',
    periods: [
      { id: 'sat-morn', label: 'Утро', helperText: 'до обеда' },
      { id: 'sat-eve', label: 'Вечер', helperText: 'после обеда' }
    ]
  },
  {
    day: 'Воскресенье',
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
  { label: 'Требуется питание', value: PROVISION_TYPE.REQUIRED }
];

export const alcoholOptions = [
  { label: 'Без алкоголя', value: PROVISION_TYPE.NONE },
  { label: 'Буду пить', value: PROVISION_TYPE.REQUIRED }
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
