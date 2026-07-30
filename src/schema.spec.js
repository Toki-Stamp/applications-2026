import { describe, it, expect } from "vitest";
import {
  formatSchema,
  personalDataSchema,
  transportSchema,
  provisionsStepSchema,
  accommodationStepSchema,
  validateStepData,
  sanitizeFormData,
  formatZodErrors,
  ERROR_MESSAGES,
} from "./schema.js";

describe("schema.js", () => {
  describe("formatSchema (Step 2)", () => {
    it("should fail if applicationType is null", () => {
      const data = {
        applicationType: null,
        totalGroupSize: null,
        groupConditions: null,
      };
      const res = formatSchema.safeParse(data);
      expect(res.success).toBe(false);
      expect(res.error.issues[0].message).toBe(ERROR_MESSAGES.REQUIRED);
    });

    it("should fail if group is selected but size or conditions are missing", () => {
      const data = {
        applicationType: "group",
        totalGroupSize: null,
        groupConditions: null,
      };
      const res = formatSchema.safeParse(data);
      expect(res.success).toBe(false);
      const paths = res.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("totalGroupSize");
      expect(paths).toContain("groupConditions");
    });

    it("should pass for valid individual application", () => {
      const data = {
        applicationType: "individual",
        totalGroupSize: null,
        groupConditions: null,
      };
      const res = formatSchema.safeParse(data);
      expect(res.success).toBe(true);
    });

    it("should pass for valid group application", () => {
      const data = {
        applicationType: "group",
        totalGroupSize: 2,
        groupConditions: "unified",
      };
      const res = formatSchema.safeParse(data);
      expect(res.success).toBe(true);
    });
  });

  describe("personalDataSchema (Step 3)", () => {
    it("should validate phone number and missing nickname", () => {
      const data = {
        applicationType: "individual",
        applicant: { nickname: "", phone: "123" },
        guests: [],
      };
      const res = personalDataSchema.safeParse(data);
      expect(res.success).toBe(false);
      const paths = res.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("applicant.nickname");
      expect(paths).toContain("applicant.phone");
    });

    it("should pass with valid russian phone", () => {
      const data = {
        applicationType: "individual",
        applicant: { nickname: "toki", phone: "+79991234567" },
        guests: [],
      };
      const res = personalDataSchema.safeParse(data);
      expect(res.success).toBe(true);
    });
  });

  describe("transportSchema (Step 4)", () => {
    it("should require freeSeats if method is driver", () => {
      const data = {
        transportTo: {
          method: "driver",
          freeSeats: null,
          day: "Пт",
          time: "10:00",
          departureCity: "MSK",
        },
        transportFrom: { method: "bus", day: "Вс", time: "18:00" },
        transportComment: "",
      };
      const res = transportSchema.safeParse(data);
      expect(res.success).toBe(false);
      expect(res.error.issues[0].path).toContain("freeSeats");
    });

    it("should pass if valid transport provided", () => {
      const data = {
        transportTo: {
          method: "driver",
          freeSeats: 2,
          day: "Пт",
          time: "10:00",
          departureCity: "MSK",
        },
        transportFrom: { method: "bus", day: "Вс", time: "18:00" },
        transportComment: "",
      };
      expect(transportSchema.safeParse(data).success).toBe(true);
    });
  });

  describe("provisionsStepSchema (Step 5)", () => {
    it("should require periods if food or alcohol is required for differential group", () => {
      const data = {
        applicationType: "group",
        groupConditions: "differential",
        applicant: {
          provisions: {
            food: "required",
            foodPeriods: [],
            alcohol: "none",
            alcoholPeriods: [],
          },
        },
        guests: [
          {
            provisions: {
              food: "required",
              foodPeriods: [],
              alcohol: "none",
              alcoholPeriods: [],
            },
          },
        ],
      };
      const res = provisionsStepSchema.safeParse(data);
      expect(res.success).toBe(false);
      const paths = res.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("applicant.provisions.foodPeriods");
    });

    it("should require food periods for guests if required", () => {
      const data = {
        applicationType: "group",
        groupConditions: "differential",
        applicant: {
          provisions: {
            food: "none",
            foodPeriods: [],
            alcohol: "none",
            alcoholPeriods: [],
          },
        },
        guests: [
          {
            provisions: {
              food: "required",
              foodPeriods: [],
              alcohol: "none",
              alcoholPeriods: [],
            },
          },
        ],
      };
      const res = provisionsStepSchema.safeParse(data);
      expect(res.success).toBe(false);
      const paths = res.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("guests.0.provisions.foodPeriods");
    });

    it("should require alcohol periods for guests if required", () => {
      const data = {
        applicationType: "group",
        groupConditions: "differential",
        applicant: {
          provisions: {
            food: "none",
            foodPeriods: [],
            alcohol: "none",
            alcoholPeriods: [],
          },
        },
        guests: [
          {
            provisions: {
              food: "none",
              foodPeriods: [],
              alcohol: "required",
              alcoholPeriods: [],
            },
          },
        ],
      };
      const res = provisionsStepSchema.safeParse(data);
      expect(res.success).toBe(false);
      const paths = res.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("guests.0.provisions.alcoholPeriods");
    });
  });

  describe("sanitizeFormData", () => {
    it("should sanitize individual application correctly", () => {
      const data = {
        applicationType: "individual",
        additionalGuestsCount: 2,
        groupConditions: "unified",
        guests: [{ nickname: "guest" }],
        applicant: {
          provisions: { food: "none", alcohol: "none" },
          accommodation: { type: "self" },
        },
        transportTo: { method: "self" },
      };
      const sanitized = sanitizeFormData(data);
      expect(sanitized.additionalGuestsCount).toBe(0);
      expect(sanitized.guests).toEqual([]);
      expect(sanitized.groupConditions).toBeNull();
    });
    it("should trim strings, remove duplicate spaces, and skip non-strings", () => {
      const data = {
        applicant: {
          nickname: "  toki   ",
          firstName: "  Ivan   Ivanov  ",
          provisions: {},
          accommodation: {},
        },
        applicationType: "group",
        groupConditions: "differential",
        transportTo: { method: "self", city: "  Msk  city  " },
        guests: [
          {
            nickname: 123,
            firstName: null,
            provisions: { food: "none", alcohol: "none" },
            accommodation: { type: "self" },
          },
        ],
      };
      const sanitized = sanitizeFormData(data);
      expect(sanitized.applicant.nickname).toBe("toki");
      expect(sanitized.applicant.firstName).toBe("Ivan Ivanov");
      expect(sanitized.transportTo.city).toBe("Msk city");
      expect(sanitized.guests[0].nickname).toBe(123);
      expect(sanitized.guests[0].firstName).toBe(null);
    });

    it("should copy applicant provisions to guests if group is unified", () => {
      const data = {
        applicationType: "group",
        groupConditions: "unified",
        transportTo: {},
        applicant: {
          provisions: {
            food: "required",
            foodPeriods: ["Пт-Ужин"],
            alcohol: "none",
            alcoholPeriods: [],
          },
          accommodation: { type: "booking", nights: ["Пт", "Сб"] },
        },
        guests: [{ provisions: {}, accommodation: {} }],
      };
      const sanitized = sanitizeFormData(data);
      expect(sanitized.guests[0].provisions.food).toBe("required");
      expect(sanitized.guests[0].accommodation.type).toBe("booking");
    });

    it("should sanitize provisions and accommodation for differential group", () => {
      const data = {
        applicationType: "group",
        groupConditions: "differential",
        transportTo: { method: "self" },
        applicant: {
          provisions: {
            food: "none",
            foodPeriods: ["some"],
            alcohol: "none",
            alcoholPeriods: ["some"],
            comment: null,
          },
          accommodation: { type: "self", nights: ["some"], comment: "c" },
        },
        guests: [
          {
            provisions: {
              food: "none",
              foodPeriods: ["x"],
              alcohol: "none",
              alcoholPeriods: ["y"],
              comment: null,
            },
            accommodation: { type: "self", nights: ["z"], comment: "c" },
          },
        ],
      };

      const sanitized = sanitizeFormData(data);
      // Applicant sanitized
      expect(sanitized.applicant.provisions.foodPeriods.length).toBe(0);
      expect(sanitized.applicant.provisions.alcoholPeriods.length).toBe(0);
      expect(sanitized.applicant.provisions.comment).toBe("");
      expect(sanitized.applicant.accommodation.nights.length).toBe(0);
      expect(sanitized.applicant.accommodation.comment).toBe("");

      // Guest sanitized
      expect(sanitized.guests[0].provisions.foodPeriods.length).toBe(0);
      expect(sanitized.guests[0].provisions.alcoholPeriods.length).toBe(0);
      expect(sanitized.guests[0].provisions.comment).toBe("");
      expect(sanitized.guests[0].accommodation.nights.length).toBe(0);
      expect(sanitized.guests[0].accommodation.comment).toBe("");
    });
  });

  describe("validateStepData and formatZodErrors", () => {
    it("should return empty errors if no zodError in formatZodErrors", () => {
      expect(formatZodErrors(null)).toEqual({});
    });

    it("should format nested zod errors", () => {
      const data = {
        transportTo: {
          method: "driver",
          freeSeats: null,
          day: "Пт",
          time: "10:00",
          departureCity: "MSK",
        },
        transportFrom: { method: "bus", day: "Вс", time: "18:00" },
        transportComment: "",
      }; // invalid freeSeats
      const result = validateStepData(4, data);
      expect(result.success).toBe(false);
      expect(result.errors["transportTo.freeSeats"]).toBeDefined();
    });

    it("should validate step 2", () => {
      expect(
        validateStepData(2, {
          applicationType: "individual",
          totalGroupSize: null,
          groupConditions: null,
        }).success,
      ).toBe(true);
    });

    it("should validate step 3", () => {
      expect(
        validateStepData(3, {
          applicationType: "individual",
          totalGroupSize: null,
          groupConditions: null,
          applicant: { nickname: "toki", phone: "+79991234567" },
          guests: [],
        }).success,
      ).toBe(true);
    });

    it("should validate step 5", () => {
      const data = {
        applicationType: "individual",
        totalGroupSize: null,
        groupConditions: null,
        applicant: {
          provisions: {
            food: "none",
            foodPeriods: [],
            alcohol: "none",
            alcoholPeriods: [],
          },
        },
        guests: [],
      };
      expect(validateStepData(5, data).success).toBe(true);
    });

    it("should validate step 6 (accommodation)", () => {
      const data = {
        applicationType: "individual",
        totalGroupSize: null,
        groupConditions: null,
        applicant: { accommodation: { type: "self", nights: [] } },
        guests: [],
      };
      expect(validateStepData(6, data).success).toBe(true);
    });

    it("should require nights for booking accommodation", () => {
      const data = {
        applicationType: "individual",
        totalGroupSize: null,
        groupConditions: null,
        applicant: { accommodation: { type: "booking", nights: [] } },
        guests: [],
      };
      const res = validateStepData(6, data);
      expect(res.success).toBe(false);
      expect(res.errors["applicant.accommodation.nights"]).toBeDefined();
    });

    it("should validate step 7 (free mic)", () => {
      expect(validateStepData(7, { freeMic: "test" }).success).toBe(true);
      expect(validateStepData(7, {}).success).toBe(true);
    });

    it("should return default for unknown step", () => {
      const res = validateStepData(999, {});
      expect(res.success).toBe(true);
      expect(res.errors).toEqual({});
    });
  });
});
