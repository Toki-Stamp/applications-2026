import { describe, it, expect, vi } from "vitest";
import {
  generateId,
  getApplicantDisplayName,
  getGuestDisplayName,
  gridExpand,
} from "./utils.js";

describe("utils.js", () => {
  describe("generateId", () => {
    it("should generate sequential IDs with default prefix", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).toMatch(/^el-\d+$/);
      expect(id2).toMatch(/^el-\d+$/);
      expect(id1).not.toBe(id2);
    });

    it("should use provided prefix", () => {
      const id = generateId("test");
      expect(id).toMatch(/^test-\d+$/);
    });
  });

  describe("gridExpand", () => {
    it("should return transition configuration", () => {
      const mockNode = /** @type {any} */ ({
        style: {},
      });

      // Mock getComputedStyle
      vi.stubGlobal("getComputedStyle", () => ({
        marginTop: "10px",
        marginBottom: "0px",
        paddingTop: "5px",
        paddingBottom: "5px",
      }));

      const transition = gridExpand(mockNode, { duration: 200 });
      expect(transition.duration).toBe(200);
      expect(typeof transition.css).toBe("function");

      const cssString = transition.css(0.5);
      expect(cssString).toContain("grid-template-rows: 0.5fr");
      expect(cssString).toContain("margin-top: 5px");
      expect(cssString).toContain("padding-top: 2.5px");
      expect(cssString).toContain("opacity: 0.5");

      vi.unstubAllGlobals();
    });

    it("should handle missing computed styles with defaults", () => {
      const mockNode = /** @type {any} */ ({ style: {} });
      vi.stubGlobal("getComputedStyle", () => ({}));
      const transition = gridExpand(mockNode);
      const cssString = transition.css(0.5);
      expect(cssString).toContain("margin-top: 0px");
      expect(cssString).toContain("margin-bottom: 0px");
      expect(cssString).toContain("padding-top: 0px");
      expect(cssString).toContain("padding-bottom: 0px");
      vi.unstubAllGlobals();
    });
  });

  describe("getApplicantDisplayName", () => {
    it("should return nickname if no full name provided", () => {
      expect(getApplicantDisplayName({ nickname: "toki" })).toBe("toki");
    });

    it("should return default 'Заявителя' if nothing provided", () => {
      expect(getApplicantDisplayName({})).toBe("Заявителя");
    });

    it("should include full name in parentheses", () => {
      expect(
        getApplicantDisplayName({
          nickname: "toki",
          firstName: "Ivan",
          lastName: "Ivanov",
        }),
      ).toBe("toki (Ivan Ivanov)");
    });

    it("should handle missing last name", () => {
      expect(
        getApplicantDisplayName({ nickname: "toki", firstName: "Ivan" }),
      ).toBe("toki (Ivan)");
    });
  });

  describe("getGuestDisplayName", () => {
    it("should return default Гостя #N if nothing provided", () => {
      expect(getGuestDisplayName({}, 0)).toBe("Гостя #1");
      expect(getGuestDisplayName({}, 5)).toBe("Гостя #6");
    });

    it("should use full name as main if provided", () => {
      expect(
        getGuestDisplayName({ firstName: "Ivan", lastName: "Ivanov" }, 0),
      ).toBe("Ivan Ivanov");
    });

    it("should append nickname in parentheses if both are provided", () => {
      expect(
        getGuestDisplayName(
          { firstName: "Ivan", lastName: "Ivanov", nickname: "toki" },
          0,
        ),
      ).toBe("Ivan Ivanov (toki)");
    });

    it("should use default Guest #N and nickname if no name provided", () => {
      expect(getGuestDisplayName({ nickname: "toki" }, 1)).toBe(
        "Гостя #2 (toki)",
      );
    });
  });
});
