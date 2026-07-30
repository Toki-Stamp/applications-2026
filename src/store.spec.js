import { describe, it, expect, beforeEach, vi } from "vitest";
import { createFormStore } from "./store.svelte.js";
import { APPLICATION_TYPE, FORM_STORAGE_KEY } from "./constants.js";

describe("store.svelte.js", () => {
  beforeEach(() => {
    // Clear localStorage mock if we had one
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
      vi.restoreAllMocks();
    }
  });

  describe("createFormStore", () => {
    it("should load valid draft from localStorage", () => {
      const validDraft = { _version: 2, applicant: { nickname: "draft_test" } };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(validDraft));
      const store = createFormStore();
      expect(store.data.applicant.nickname).toBe("draft_test");
    });

    it("should discard outdated draft from localStorage", () => {
      const oldDraft = { _version: 1, applicant: { nickname: "old_draft" } };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(oldDraft));
      const store = createFormStore();
      expect(store.data.applicant.nickname).toBe("");
      expect(localStorage.getItem(FORM_STORAGE_KEY)).toBeNull();
    });

    it("should handle JSON parse error in localStorage", () => {
      localStorage.setItem(FORM_STORAGE_KEY, "{ broken json ");
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = createFormStore();
      expect(store.data.applicant.nickname).toBe("");
      expect(localStorage.getItem(FORM_STORAGE_KEY)).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should initialize with default values and generate fallback UUID", () => {
      // Mock crypto.randomUUID to force fallback
      const originalRandomUUID = globalThis.crypto?.randomUUID;
      if (globalThis.crypto) {
        globalThis.crypto.randomUUID = undefined;
      }
      
      const store = createFormStore();
      expect(store.data.applicationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(store.data.applicant.nickname).toBe("");
      expect(store.data.guests.length).toBe(0);
      expect(store.meta.touchedFields.size).toBe(0);
      
      // Restore
      if (globalThis.crypto) {
        globalThis.crypto.randomUUID = originalRandomUUID;
      }
    });

    it("should update guests count properly", () => {
      const store = createFormStore();
      store.data.applicationType = APPLICATION_TYPE.GROUP;
      
      store.updateGuestsCount(2);
      expect(store.data.additionalGuestsCount).toBe(2);
      expect(store.data.guests.length).toBe(2);
      
      // Check default values in new guest
      expect(store.data.guests[0].provisions.food).toBe(null);

      store.updateGuestsCount(1);
      expect(store.data.guests.length).toBe(1);
    });

    it("should reset guests count to 0 if individual", () => {
      const store = createFormStore();
      store.data.applicationType = APPLICATION_TYPE.INDIVIDUAL;
      store.updateGuestsCount(3);
      
      expect(store.data.additionalGuestsCount).toBe(0);
      expect(store.data.guests.length).toBe(0); // since it ignores targetGuests if individual
    });

    it("should reset the store properly", () => {
      const store = createFormStore();
      const initialId = store.data.applicationId;
      
      store.data.applicant.nickname = "test";
      store.markTouched("applicant.nickname");
      
      store.reset();
      
      expect(store.data.applicant.nickname).toBe("");
      expect(store.data.applicationId).not.toBe(initialId); // new UUID
      expect(store.meta.touchedFields.size).toBe(0);
    });

    it("should handle marking touched fields", () => {
      const store = createFormStore();
      store.markTouched("test.field");
      expect(store.meta.touchedFields.has("test.field")).toBe(true);

      store.touchAllInStep(["field1", "field2"]);
      expect(store.meta.touchedFields.has("field1")).toBe(true);
      expect(store.meta.touchedFields.has("field2")).toBe(true);
    });

    it("should save to localStorage and clear when empty", () => {
      const store = createFormStore();
      store.data.applicant.nickname = "hello";
      store.save();
      const saved = JSON.parse(localStorage.getItem(FORM_STORAGE_KEY));
      expect(saved.applicant.nickname).toBe("hello");

      // Reset sets it back to default, save should clear it
      store.reset();
      store.save();
      expect(localStorage.getItem(FORM_STORAGE_KEY)).toBeNull();
    });

    it("should allow replacing entire data via setter", () => {
      const store = createFormStore();
      store.data = { _version: 2, custom: true, applicant: { nickname: "set" } };
      expect(store.data.custom).toBe(true);
    });
  });
});
