import { writable } from 'svelte/store';
import { APPLICATION_TYPE, GROUP_CONDITIONS, PROVISION_TYPE, ACCOMMODATION_TYPE, TRANSPORT_METHOD } from './constants.js';

export const defaultProvisions = () => ({
  food: null,
  foodPeriods: [],
  alcohol: null,
  alcoholPeriods: []
});

const initialState = {
  applicationType: null,
  totalGroupSize: null,
  groupConditions: null,
  applicant: { nickname: '', firstName: '', lastName: '', phone: '', provisions: defaultProvisions() },
  guests: [],
  transportTo: { method: null, freeSeats: null, day: null, time: '' },
  transportFrom: { method: null, day: null, time: '' },
  transportComment: '',
  accommodation: null,
  nights: [],
  accommodationComment: '',
  freeMic: ''
};

function createFormStore() {
  const { subscribe, set, update } = writable(JSON.parse(JSON.stringify(initialState)));

  return {
    subscribe,
    set,
    update,
    updateGuestsCount: (targetGuests, applicantNickname) => update(state => {
      const newState = { ...state };
      
      if (newState.applicationType === APPLICATION_TYPE.INDIVIDUAL) {
        newState.additionalGuestsCount = 0;
        targetGuests = 0;
      }
      
      newState.additionalGuestsCount = targetGuests;
      
      if (targetGuests > newState.guests.length) {
        const newGuests = [...newState.guests];
        for (let i = newState.guests.length; i < targetGuests; i++) {
          newGuests.push({
            firstName: '',
            lastName: '', nickname: '', phone: '', provisions: defaultProvisions()
          });
        }
        newState.guests = newGuests;
      } else if (targetGuests < newState.guests.length) {
        newState.guests = newState.guests.slice(0, targetGuests);
      }
      
      return newState;
    }),
    reset: () => set(JSON.parse(JSON.stringify(initialState)))
  };
}

export const formStore = createFormStore();

export function sanitizeFormData(data) {
  // Create a deep copy to avoid mutating the reactive store directly
  const payload = JSON.parse(JSON.stringify(data));

  // 1. Format & Guests
  if (payload.applicationType === APPLICATION_TYPE.INDIVIDUAL) {
    payload.additionalGuestsCount = 0;
    payload.guests = [];
    payload.groupConditions = null;
  }

  // 2. Transport To
  if (payload.transportTo.method !== TRANSPORT_METHOD.DRIVER) {
    delete payload.transportTo.freeSeats;
  }

  // 3. Transport From
  // (No freeSeats for transportFrom according to updated PRD)

  // 4. Accommodation
  if (payload.accommodation === ACCOMMODATION_TYPE.SELF) {
    payload.nights = [];
    payload.accommodationComment = '';
  }

  // 5. Provisions
  const sanitizeProvisions = (prov) => {
    if (prov.food === PROVISION_TYPE.NONE) {
      prov.foodPeriods = [];
    }
    if (prov.alcohol === PROVISION_TYPE.NONE) {
      prov.alcoholPeriods = [];
    }
  };

  if (payload.applicationType === APPLICATION_TYPE.INDIVIDUAL || payload.groupConditions === GROUP_CONDITIONS.UNIFIED) {
    // Only applicant provisions matter, guests shouldn't have unique provisions
    sanitizeProvisions(payload.applicant.provisions);
    payload.guests.forEach(guest => {
      guest.provisions = JSON.parse(JSON.stringify(payload.applicant.provisions));
    });
  } else {
    // Differential conditions
    sanitizeProvisions(payload.applicant.provisions);
    payload.guests.forEach(guest => sanitizeProvisions(guest.provisions));
  }

  return payload;
}
