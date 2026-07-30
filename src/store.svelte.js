import {
  APPLICATION_TYPE,
  GROUP_CONDITIONS,
  PROVISION_TYPE,
  ACCOMMODATION_TYPE,
  TRANSPORT_METHOD,
} from "./constants.js";

export const defaultProvisions = () => ({
  food: null,
  foodPeriods: [],
  alcohol: null,
  alcoholPeriods: [],
  comment: "",
});

export const defaultAccommodation = () => ({
  type: null,
  nights: [],
  comment: "",
});

const initialState = {
  _version: 2,
  applicationId: null,
  applicationType: null,
  totalGroupSize: null,
  groupConditions: null,
  applicant: {
    nickname: "",
    firstName: "",
    lastName: "",
    phone: "",
    provisions: defaultProvisions(),
    accommodation: defaultAccommodation(),
  },
  guests: [],
  transportTo: {
    method: null,
    freeSeats: null,
    day: null,
    time: "",
    departureCity: "",
  },
  transportFrom: { method: null, day: null, time: "" },
  transportComment: "",
  freeMic: "",
};

import { FORM_STORAGE_KEY as STORAGE_KEY } from "./constants.js";

function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createFormStore() {
  let initial = JSON.parse(JSON.stringify(initialState));

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed._version === initialState._version) {
          initial = parsed;
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.error("Draft parsing error", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  if (!initial.applicationId) {
    initial.applicationId = generateUUID();
  }

  let data = $state(initial);
  let meta = $state({ touchedFields: new Set() });

  function saveToLocalStorage() {
    if (typeof window !== "undefined") {
      // Create copies without applicationId to compare meaningfully
      const currentData = { ...data, applicationId: null };
      const initData = { ...initialState, applicationId: null };

      if (JSON.stringify(currentData) === JSON.stringify(initData)) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    }
  }

  return {
    save: saveToLocalStorage,
    get data() {
      return data;
    },
    set data(v) {
      data = v;
    },
    get meta() {
      return meta;
    },

    updateGuestsCount(targetGuests) {
      if (data.applicationType === APPLICATION_TYPE.INDIVIDUAL) {
        data.additionalGuestsCount = 0;
        targetGuests = 0;
      }

      data.additionalGuestsCount = targetGuests;

      if (targetGuests > data.guests.length) {
        for (let i = data.guests.length; i < targetGuests; i++) {
          data.guests.push({
            firstName: "",
            lastName: "",
            nickname: "",
            phone: "",
            provisions: defaultProvisions(),
            accommodation: defaultAccommodation(),
          });
        }
      } else if (targetGuests < data.guests.length) {
        data.guests = data.guests.slice(0, targetGuests);
      }
    },

    reset() {
      data = JSON.parse(JSON.stringify(initialState));
      data.applicationId = generateUUID();
      meta.touchedFields = new Set();
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    markTouched(path) {
      const newSet = new Set(meta.touchedFields);
      newSet.add(path);
      meta.touchedFields = newSet;
    },

    touchAllInStep(stepPaths) {
      const newSet = new Set(meta.touchedFields);
      stepPaths.forEach((p) => newSet.add(p));
      meta.touchedFields = newSet;
    },
  };
}

export const formStore = createFormStore();
