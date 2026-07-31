import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import {
  APPLICATION_TYPE,
  GROUP_CONDITIONS,
  PROVISION_TYPE,
  ACCOMMODATION_TYPE,
  TRANSPORT_METHOD,
} from "./constants.js";
import { dict } from "./locales/ru.js";

export const ERROR_MESSAGES = {
  REQUIRED: dict.errors.textRequired,
  INVALID_PHONE: dict.errors.invalidPhone,
  SELECT_PERIODS: dict.errors.selectPeriods,
  SELECT_NIGHTS: dict.errors.selectNights,
};

const provisionsSchema = z
  .object({
    food: z
      .string()
      .nullable()
      .refine((val) => val !== null, ERROR_MESSAGES.REQUIRED),
    foodPeriods: z.array(z.string()),
    alcohol: z
      .string()
      .nullable()
      .refine((val) => val !== null, ERROR_MESSAGES.REQUIRED),
    alcoholPeriods: z.array(z.string()),
    comment: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.food === PROVISION_TYPE.REQUIRED &&
      data.foodPeriods.length === 0
    ) {
      ctx.addIssue({
        path: ["foodPeriods"],
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.SELECT_PERIODS,
      });
    }
    if (
      data.alcohol === PROVISION_TYPE.REQUIRED &&
      data.alcoholPeriods.length === 0
    ) {
      ctx.addIssue({
        path: ["alcoholPeriods"],
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.SELECT_PERIODS,
      });
    }
  });

const applicantSchema = z.object({
  nickname: z.string().trim().min(1, ERROR_MESSAGES.REQUIRED),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED)
    .refine((val) => isValidPhoneNumber(val), {
      message: ERROR_MESSAGES.INVALID_PHONE,
    }),
  provisions: provisionsSchema,
});

const guestSchema = z.object({
  firstName: z.string().trim().min(1, ERROR_MESSAGES.REQUIRED),
  nickname: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  provisions: provisionsSchema,
});

// Step 2: Format
export const formatSchema = z
  .object({
    applicationType: z.string().nullable(),
    totalGroupSize: z.number().nullable(),
    groupConditions: z.string().nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.applicationType) {
      ctx.addIssue({
        path: ["applicationType"],
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.REQUIRED,
      });
    }
    if (data.applicationType === APPLICATION_TYPE.GROUP) {
      if (!data.totalGroupSize) {
        ctx.addIssue({
          path: ["totalGroupSize"],
          code: z.ZodIssueCode.custom,
          message: ERROR_MESSAGES.REQUIRED,
        });
      }
      if (!data.groupConditions) {
        ctx.addIssue({
          path: ["groupConditions"],
          code: z.ZodIssueCode.custom,
          message: ERROR_MESSAGES.REQUIRED,
        });
      }
    }
  });

// Step 3: Personal Data — separate schemas WITHOUT provisions (those are validated on step 5)
const applicantPersonalSchema = z.object({
  nickname: z.string().trim().min(1, ERROR_MESSAGES.REQUIRED),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED)
    .refine((val) => isValidPhoneNumber(val), {
      message: ERROR_MESSAGES.INVALID_PHONE,
    }),
});

const guestPersonalSchema = z.object({
  firstName: z.string().trim().min(1, ERROR_MESSAGES.REQUIRED),
  nickname: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export const personalDataSchema = z.object({
  applicationType: z.string().nullable(),
  applicant: applicantPersonalSchema,
  guests: z.array(guestPersonalSchema),
});

// Step 4: Transport
export const transportSchema = z
  .object({
    transportTo: z.object({
      method: z.string().nullable(),
      freeSeats: z.number().nullable(),
      day: z.string().nullable(),
      time: z.string().nullable(),
      departureCity: z.string().nullable(),
    }),
    transportFrom: z.object({
      method: z.string().nullable(),
      day: z.string().nullable(),
      time: z.string().nullable(),
    }),
    transportComment: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate transportTo
    if (!data.transportTo.method) {
      ctx.addIssue({
        path: ["transportTo", "method"],
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.REQUIRED,
      });
    } else if (
      data.transportTo.method === TRANSPORT_METHOD.DRIVER &&
      data.transportTo.freeSeats === null
    ) {
      ctx.addIssue({
        path: ["transportTo", "freeSeats"],
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.REQUIRED,
      });
    }

    if (!data.transportTo.day) {
      ctx.addIssue({
        path: ["transportTo", "day"],
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.REQUIRED,
      });
    }
    if (!data.transportTo.time) {
      ctx.addIssue({
        path: ["transportTo", "time"],
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.REQUIRED,
      });
    }
    if (
      !data.transportTo.departureCity ||
      data.transportTo.departureCity.trim() === ""
    ) {
      ctx.addIssue({
        path: ["transportTo", "departureCity"],
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.REQUIRED,
      });
    }

    // Validate transportFrom
    if (!data.transportFrom.method) {
      ctx.addIssue({
        path: ["transportFrom", "method"],
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.REQUIRED,
      });
    }

    if (!data.transportFrom.day) {
      ctx.addIssue({
        path: ["transportFrom", "day"],
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.REQUIRED,
      });
    }
    if (!data.transportFrom.time) {
      ctx.addIssue({
        path: ["transportFrom", "time"],
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.REQUIRED,
      });
    }
  });

// Loose guest provision type without validation rules — used in the base schema shape
const looseProvisionShape = z.object({
  food: z.string().nullable(),
  foodPeriods: z.array(z.string()),
  alcohol: z.string().nullable(),
  alcoholPeriods: z.array(z.string()),
  comment: z.string().optional(),
});

// Step 5: Provisions
// For INDIVIDUAL or GROUP+UNIFIED, guest provisions are copied from applicant (sanitizeFormData).
// Only GROUP+DIFFERENTIAL needs each guest's provisions validated individually.
export const provisionsStepSchema = z
  .object({
    applicationType: z.string().nullable(),
    groupConditions: z.string().nullable(),
    applicant: z.object({ provisions: provisionsSchema }),
    guests: z.array(z.object({ provisions: looseProvisionShape })),
  })
  .superRefine((data, ctx) => {
    if (
      data.applicationType === "group" &&
      data.groupConditions === "differential"
    ) {
      const guestsResult = z
        .array(z.object({ provisions: provisionsSchema }))
        .safeParse(data.guests);
      if (!guestsResult.success) {
        guestsResult.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ["guests", ...issue.path] });
        });
      }
    }
  });

// Step 6: Accommodation
const looseAccommodationShape = z.object({
  type: z.string().nullable(),
  nights: z.array(z.string()),
  comment: z.string().optional(),
});

const baseAccommodationSchema = z
  .object({
    type: z
      .string()
      .nullable()
      .refine((val) => val !== null, ERROR_MESSAGES.REQUIRED),
    nights: z.array(z.string()),
    comment: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === ACCOMMODATION_TYPE.BOOKING && data.nights.length === 0) {
      ctx.addIssue({
        path: ["nights"],
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.SELECT_NIGHTS,
      });
    }
  });

export const accommodationStepSchema = z
  .object({
    applicationType: z.string().nullable(),
    groupConditions: z.string().nullable(),
    applicant: z.object({ accommodation: baseAccommodationSchema }),
    guests: z.array(z.object({ accommodation: looseAccommodationShape })),
  })
  .superRefine((data, ctx) => {
    if (
      data.applicationType === "group" &&
      data.groupConditions === "differential"
    ) {
      const guestsResult = z
        .array(z.object({ accommodation: baseAccommodationSchema }))
        .safeParse(data.guests);
      if (!guestsResult.success) {
        guestsResult.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ["guests", ...issue.path] });
        });
      }
    }
  });

// Step 7: Free Mic
export const freeMicSchema = z.object({
  freeMic: z.string().optional(),
});

// Helper: flatten Zod errors to { 'path.to.field': 'message' }
export function formatZodErrors(zodError) {
  const errors = {};
  if (!zodError) return errors;
  zodError.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });
  return errors;
}

export function validateStepData(step, data) {
  let result;
  switch (step) {
    case 2:
      result = formatSchema.safeParse(data);
      break;
    case 3:
      result = personalDataSchema.safeParse(data);
      break;
    case 4:
      result = transportSchema.safeParse(data);
      break;
    case 5:
      result = provisionsStepSchema.safeParse(data);
      break;
    case 6:
      result = accommodationStepSchema.safeParse(data);
      break;
    case 7:
      result = freeMicSchema.safeParse(data);
      break;
    default:
      return { success: true, errors: {} };
  }

  if (result.success) {
    return { success: true, errors: {} };
  } else {
    return { success: false, errors: formatZodErrors(result.error) };
  }
}

export function sanitizeFormData(data) {
  const payload = JSON.parse(JSON.stringify(data));

  const sanitizeText = (str) => {
    if (typeof str === "string") {
      return str.trim().replace(/\s+/g, " ");
    }
    return str;
  };

  if (payload.applicant) {
    if (payload.applicant.nickname)
      payload.applicant.nickname = sanitizeText(payload.applicant.nickname);
    if (payload.applicant.firstName)
      payload.applicant.firstName = sanitizeText(payload.applicant.firstName);
  }

  if (payload.guests && Array.isArray(payload.guests)) {
    payload.guests.forEach((guest) => {
      if (guest.nickname) guest.nickname = sanitizeText(guest.nickname);
      if (guest.firstName) guest.firstName = sanitizeText(guest.firstName);
    });
  }

  if (payload.transportTo?.city) {
    payload.transportTo.city = sanitizeText(payload.transportTo.city);
  }

  if (payload.applicationType === APPLICATION_TYPE.INDIVIDUAL) {
    payload.additionalGuestsCount = 0;
    payload.guests = [];
    payload.groupConditions = null;
  }

  // Причесываем данные транспорта для заявителя
  if (payload.transportTo.method !== TRANSPORT_METHOD.DRIVER) {
    delete payload.transportTo.freeSeats;
  }
  if (payload.transportFrom.method !== TRANSPORT_METHOD.DRIVER) {
    delete payload.transportFrom.freeSeats;
  }

  // Вспомогательная функция для копирования транспорта гостям
  const getGuestTransport = (applicantTransport) => {
    const guestTransport = JSON.parse(JSON.stringify(applicantTransport));
    // Если заявитель - водитель, гость не становится водителем, а получает статус "Едет с заявителем"
    if (guestTransport.method === TRANSPORT_METHOD.DRIVER) {
      guestTransport.method = TRANSPORT_METHOD.WITH_APPLICANT;
      delete guestTransport.freeSeats;
    }
    return guestTransport;
  };

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
    if (!prov.comment) prov.comment = "";
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
      // Копируем транспорт
      guest.transportTo = getGuestTransport(payload.transportTo);
      guest.transportFrom = getGuestTransport(payload.transportFrom);
    });
  } else {
    sanitizeProvisions(payload.applicant.provisions);
    sanitizeAccommodation(payload.applicant.accommodation);
    payload.guests.forEach((guest) => {
      sanitizeProvisions(guest.provisions);
      sanitizeAccommodation(guest.accommodation);
      // Копируем транспорт даже при раздельных условиях (пока транспорт один на всех)
      guest.transportTo = getGuestTransport(payload.transportTo);
      guest.transportFrom = getGuestTransport(payload.transportFrom);
    });
  }

  return payload;
}
