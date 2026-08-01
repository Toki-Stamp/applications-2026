import { dict } from "$shared/locales/ru.js";

export const APPLICATION_TYPE = {
  INDIVIDUAL: "individual",
  GROUP: "group",
};

export const GROUP_CONDITIONS = {
  UNIFIED: "unified",
  DIFFERENTIAL: "differential",
};

export const PROVISION_TYPE = {
  NONE: "none",
  REQUIRED: "required",
};

export const ACCOMMODATION_TYPE = {
  SELF: "self",
  BOOKING: "booking",
};

export const TRANSPORT_METHOD = {
  DRIVER: "driver",
  PASSENGER: "passenger",
  BUS: "bus",
  SELF: "self",
  WITH_APPLICANT: "with_applicant", // Системный статус для гостей, едущих с заявителем
};

export const days = dict.options.days;

export const transportMethodsTo = [
  {
    label: dict.options.transportMethodsTo.driver,
    value: TRANSPORT_METHOD.DRIVER,
  },
  {
    label: dict.options.transportMethodsTo.passenger,
    value: TRANSPORT_METHOD.PASSENGER,
  },
  { label: dict.options.transportMethodsTo.bus, value: TRANSPORT_METHOD.BUS },
  { label: dict.options.transportMethodsTo.self, value: TRANSPORT_METHOD.SELF },
];

// transportMethodsFrom is removed, use transportMethodsTo for both directions.

export const groupedPeriods = [
  {
    day: dict.options.groupedPeriods.friday,
    items: [
      {
        id: "fri-morn",
        label: dict.options.groupedPeriods.morn,
        helperText: dict.options.groupedPeriods.mornHelper,
        icon: "wb_sunny",
      },
      {
        id: "fri-eve",
        label: dict.options.groupedPeriods.eve,
        helperText: dict.options.groupedPeriods.eveHelper,
        icon: "nightlight_round",
      },
    ],
  },
  {
    day: dict.options.groupedPeriods.saturday,
    items: [
      {
        id: "sat-morn",
        label: dict.options.groupedPeriods.morn,
        helperText: dict.options.groupedPeriods.mornHelper,
        icon: "wb_sunny",
      },
      {
        id: "sat-eve",
        label: dict.options.groupedPeriods.eve,
        helperText: dict.options.groupedPeriods.eveHelper,
        icon: "nightlight_round",
      },
    ],
  },
  {
    day: dict.options.groupedPeriods.sunday,
    items: [
      {
        id: "sun-morn",
        label: dict.options.groupedPeriods.morn,
        helperText: dict.options.groupedPeriods.mornHelper,
        icon: "wb_sunny",
      },
    ],
  },
];

export const groupSizeOptions = [
  { label: dict.options.groupSize[2], value: 2 },
  { label: dict.options.groupSize[3], value: 3 },
  { label: dict.options.groupSize[4], value: 4 },
  { label: dict.options.groupSize[5], value: 5 },
];

export const foodOptions = [
  { label: dict.options.food.none, value: PROVISION_TYPE.NONE },
  { label: dict.options.food.required, value: PROVISION_TYPE.REQUIRED },
];

export const alcoholOptions = [
  { label: dict.options.alcohol.none, value: PROVISION_TYPE.NONE },
  { label: dict.options.alcohol.required, value: PROVISION_TYPE.REQUIRED },
];

export const nightsList = [
  {
    items: [
      { id: "fri-sat", label: dict.options.nights.friSat, icon: "bedtime" },
      { id: "sat-sun", label: dict.options.nights.satSun, icon: "bedtime" },
    ],
  },
];

export const accommodationOptions = [
  { label: dict.options.accommodation.self, value: ACCOMMODATION_TYPE.SELF },
  {
    label: dict.options.accommodation.booking,
    value: ACCOMMODATION_TYPE.BOOKING,
  },
];

export const freeSeatsOptions = [
  { label: dict.options.freeSeats[0], value: 0 },
  { label: dict.options.freeSeats[1], value: 1 },
  { label: dict.options.freeSeats[2], value: 2 },
  { label: dict.options.freeSeats[3], value: 3 },
  { label: dict.options.freeSeats[4], value: 4 },
  { label: dict.options.freeSeats[5], value: 5 },
];

// URL веб-приложения Google Apps Script
export const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyw44Ac6xChEsCZ14wVdcXZ9vybKVqtLIzKTYenp95fWxMAQK_TvENp4oPlXiro7TlYWw/exec";
export const FORM_STORAGE_KEY = "zubr_form_draft_2026_v2";
export const STEP_STORAGE_KEY = "zubr_step_draft_v2";

const getContactName = (nick) =>
  dict.steps.intro.contacts.find((c) => c.nick === nick)?.name || nick;

export const CONTACTS = [
  {
    phone: "+375 (29) 858-7070",
    phoneLink: "tel:+375298587070",
    name: getContactName("Booze"),
    nick: "Booze",
  },
  {
    phone: "+375 (33) 660-4048",
    phoneLink: "tel:+375336604048",
    name: getContactName("krez_by"),
    nick: "krez_by",
  },
];
