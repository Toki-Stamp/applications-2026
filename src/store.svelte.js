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
});

export const defaultAccommodation = () => ({
  type: null,
  nights: [],
  comment: "",
});

const initialState = {
  _version: 2,
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

const STORAGE_KEY = "zubr_form_draft_2026_v2";

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

  let data = $state(initial);
  let meta = $state({ touchedFields: new Set() });

  function saveToLocalStorage() {
    if (typeof window !== "undefined") {
      if (JSON.stringify(data) === JSON.stringify(initialState)) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    }
  }

  // Auto-save any change to data into localStorage
  $effect.root(() => {
    $effect(() => {
      // Accessing data triggers reactivity tracking; JSON.stringify walks all fields
      saveToLocalStorage();
    });
  });

  return {
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

export function sanitizeFormData(data) {
  const payload = JSON.parse(JSON.stringify(data));

  if (payload.applicationType === APPLICATION_TYPE.INDIVIDUAL) {
    payload.additionalGuestsCount = 0;
    payload.guests = [];
    payload.groupConditions = null;
  }

  if (payload.transportTo.method !== TRANSPORT_METHOD.DRIVER) {
    delete payload.transportTo.freeSeats;
  }

  const sanitizeAccommodation = (acc) => {
    if (acc.type === ACCOMMODATION_TYPE.SELF) {
      acc.nights = [];
      acc.comment = "";
    }
  };

  const sanitizeProvisions = (prov) => {
    if (prov.food === PROVISION_TYPE.NONE) {
      prov.foodPeriods = [];
    }
    if (prov.alcohol === PROVISION_TYPE.NONE) {
      prov.alcoholPeriods = [];
    }
  };

  if (
    payload.applicationType === APPLICATION_TYPE.INDIVIDUAL ||
    payload.groupConditions === GROUP_CONDITIONS.UNIFIED
  ) {
    sanitizeProvisions(payload.applicant.provisions);
    sanitizeAccommodation(payload.applicant.accommodation);
    payload.guests.forEach((guest) => {
      guest.provisions = JSON.parse(
        JSON.stringify(payload.applicant.provisions),
      );
      guest.accommodation = JSON.parse(
        JSON.stringify(payload.applicant.accommodation),
      );
    });
  } else {
    sanitizeProvisions(payload.applicant.provisions);
    sanitizeAccommodation(payload.applicant.accommodation);
    payload.guests.forEach((guest) => {
      sanitizeProvisions(guest.provisions);
      sanitizeAccommodation(guest.accommodation);
    });
  }

  return payload;
}
