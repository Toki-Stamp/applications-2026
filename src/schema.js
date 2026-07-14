import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { APPLICATION_TYPE, GROUP_CONDITIONS, PROVISION_TYPE, ACCOMMODATION_TYPE, TRANSPORT_METHOD } from './constants.js';

export const ERROR_MESSAGES = {
  REQUIRED: 'Это поле обязательно для заполнения',
  INVALID_PHONE: 'Неверный номер телефона',
  SELECT_PERIODS: 'Пожалуйста, выберите периоды',
  SELECT_NIGHTS: 'Пожалуйста, выберите хотя бы одну ночь'
};

const provisionsSchema = z.object({
  food: z.string().nullable(),
  foodPeriods: z.array(z.string()),
  alcohol: z.string().nullable(),
  alcoholPeriods: z.array(z.string())
}).superRefine((data, ctx) => {
  if (!data.food) {
    ctx.addIssue({ path: ['food'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
  }
  if (!data.alcohol) {
    ctx.addIssue({ path: ['alcohol'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
  }
  if (data.food === PROVISION_TYPE.REQUIRED && data.foodPeriods.length === 0) {
    ctx.addIssue({ path: ['foodPeriods'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.SELECT_PERIODS });
  }
  if (data.alcohol === PROVISION_TYPE.REQUIRED && data.alcoholPeriods.length === 0) {
    ctx.addIssue({ path: ['alcoholPeriods'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.SELECT_PERIODS });
  }
});

const applicantSchema = z.object({
  nickname: z.string().trim().min(1, ERROR_MESSAGES.REQUIRED),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().min(1, ERROR_MESSAGES.REQUIRED).refine((val) => isValidPhoneNumber(val), { message: ERROR_MESSAGES.INVALID_PHONE }),
  provisions: provisionsSchema
});

const guestSchema = z.object({
  firstName: z.string().trim().min(1, ERROR_MESSAGES.REQUIRED),
  nickname: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  provisions: provisionsSchema
});

// Step 2: Format
export const formatSchema = z.object({
  applicationType: z.string().nullable(),
  totalGroupSize: z.number().nullable(),
  groupConditions: z.string().nullable()
}).superRefine((data, ctx) => {
  if (!data.applicationType) {
    ctx.addIssue({ path: ['applicationType'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
  }
  if (data.applicationType === APPLICATION_TYPE.GROUP) {
    if (!data.totalGroupSize) {
      ctx.addIssue({ path: ['totalGroupSize'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
    }
    if (!data.groupConditions) {
      ctx.addIssue({ path: ['groupConditions'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
    }
  }
});

// Step 3: Personal Data — separate schemas WITHOUT provisions (those are validated on step 5)
const applicantPersonalSchema = z.object({
  nickname: z.string().trim().min(1, ERROR_MESSAGES.REQUIRED),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().min(1, ERROR_MESSAGES.REQUIRED).refine((val) => isValidPhoneNumber(val), { message: ERROR_MESSAGES.INVALID_PHONE }),
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
  guests: z.array(guestPersonalSchema)
});

// Step 4: Transport
export const transportSchema = z.object({
  transportTo: z.object({
    method: z.string().nullable(),
    freeSeats: z.number().nullable(),
    day: z.string().nullable(),
    time: z.string().nullable()
  }),
  transportFrom: z.object({
    method: z.string().nullable(),
    day: z.string().nullable(),
    time: z.string().nullable()
  }),
  transportComment: z.string().optional()
}).superRefine((data, ctx) => {
  // Validate transportTo
  if (!data.transportTo.method) {
    ctx.addIssue({ path: ['transportTo', 'method'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
  } else if (data.transportTo.method === TRANSPORT_METHOD.DRIVER && data.transportTo.freeSeats === null) {
    ctx.addIssue({ path: ['transportTo', 'freeSeats'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
  }
  
  if (!data.transportTo.day) {
    ctx.addIssue({ path: ['transportTo', 'day'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
  }
  if (!data.transportTo.time) {
    ctx.addIssue({ path: ['transportTo', 'time'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
  }

  // Validate transportFrom
  if (!data.transportFrom.method) {
    ctx.addIssue({ path: ['transportFrom', 'method'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
  }
  
  if (!data.transportFrom.day) {
    ctx.addIssue({ path: ['transportFrom', 'day'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
  }
  if (!data.transportFrom.time) {
    ctx.addIssue({ path: ['transportFrom', 'time'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
  }
});

// Loose guest provision type without validation rules — used in the base schema shape
const looseProvisionShape = z.object({
  food: z.string().nullable(),
  foodPeriods: z.array(z.string()),
  alcohol: z.string().nullable(),
  alcoholPeriods: z.array(z.string())
});

// Step 5: Provisions
// For INDIVIDUAL or GROUP+UNIFIED, guest provisions are copied from applicant (sanitizeFormData).
// Only GROUP+DIFFERENTIAL needs each guest's provisions validated individually.
export const provisionsStepSchema = z.object({
  applicationType: z.string().nullable(),
  groupConditions: z.string().nullable(),
  applicant: z.object({ provisions: provisionsSchema }),
  guests: z.array(z.object({ provisions: looseProvisionShape }))
}).superRefine((data, ctx) => {
  if (data.applicationType === 'group' && data.groupConditions === 'differential') {
    data.guests.forEach((guest, i) => {
      if (!guest.provisions.food) {
        ctx.addIssue({ path: ['guests', i, 'provisions', 'food'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
      }
      if (!guest.provisions.alcohol) {
        ctx.addIssue({ path: ['guests', i, 'provisions', 'alcohol'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
      }
      if (guest.provisions.food === PROVISION_TYPE.REQUIRED && guest.provisions.foodPeriods.length === 0) {
        ctx.addIssue({ path: ['guests', i, 'provisions', 'foodPeriods'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.SELECT_PERIODS });
      }
      if (guest.provisions.alcohol === PROVISION_TYPE.REQUIRED && guest.provisions.alcoholPeriods.length === 0) {
        ctx.addIssue({ path: ['guests', i, 'provisions', 'alcoholPeriods'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.SELECT_PERIODS });
      }
    });
  }
});

// Step 6: Accommodation
export const accommodationSchema = z.object({
  accommodation: z.string().nullable(),
  nights: z.array(z.string()),
  accommodationComment: z.string().optional()
}).superRefine((data, ctx) => {
  if (!data.accommodation) {
    ctx.addIssue({ path: ['accommodation'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.REQUIRED });
  }
  if (data.accommodation === ACCOMMODATION_TYPE.BOOKING && data.nights.length === 0) {
    ctx.addIssue({ path: ['nights'], code: z.ZodIssueCode.custom, message: ERROR_MESSAGES.SELECT_NIGHTS });
  }
});

// Step 7: Free Mic
export const freeMicSchema = z.object({
  freeMic: z.string().optional()
});

// Helper: flatten Zod errors to { 'path.to.field': 'message' }
export function formatZodErrors(zodError) {
  const errors = {};
  if (!zodError) return errors;
  zodError.issues.forEach(issue => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });
  return errors;
}

export function validateStepData(step, data) {
  let result;
  switch (step) {
    case 2: result = formatSchema.safeParse(data); break;
    case 3: result = personalDataSchema.safeParse(data); break;
    case 4: result = transportSchema.safeParse(data); break;
    case 5: result = provisionsStepSchema.safeParse(data); break;
    case 6: result = accommodationSchema.safeParse(data); break;
    case 7: result = freeMicSchema.safeParse(data); break;
    default: return { success: true, errors: {} };
  }

  if (result.success) {
    return { success: true, errors: {} };
  } else {
    return { success: false, errors: formatZodErrors(result.error) };
  }
}
