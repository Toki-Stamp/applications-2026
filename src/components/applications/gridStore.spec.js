import { describe, it, expect } from "vitest";
import { GridState, getDayStatus, getMethodStatus } from "./gridStore.svelte.js";

describe("gridStore.svelte.js", () => {
  describe("GridState", () => {
    it("should initialize with default states", () => {
      const grid = new GridState();
      expect(grid.activeFilters).toEqual({});
      expect(grid.hoveredFilter).toBe(null);
      expect(grid.selectedRowIndices.size).toBe(0);
      expect(grid.isNumPinned).toBe(true);
    });

    it("should toggle filters in handleHeaderClick", () => {
      const grid = new GridState();
      
      grid.handleHeaderClick("toDay_Пятница");
      expect(grid.activeFilters["toDay"]).toBeDefined();
      expect(grid.activeFilters["toDay"].value).toBe("Пятница");
      
      grid.handleHeaderClick("toDay_Пятница");
      expect(grid.activeFilters["toDay"]).toBeUndefined();
    });

    it("should replace filter in same group", () => {
      const grid = new GridState();
      grid.handleHeaderClick("toDay_Пятница");
      grid.handleHeaderClick("toDay_Суббота");
      
      expect(grid.activeFilters["toDay"].value).toBe("Суббота");
    });

    it("should highlight rows based on filters", () => {
      const grid = new GridState();
      const rowData = {
        transportTo: { day: "Пятница", method: "Водитель" },
        transportFrom: { day: "Вс", method: "Трансфер" }
      };

      expect(grid.isRowHighlighted(rowData, "toDay_Пятница")).toBe(true);
      expect(grid.isRowHighlighted(rowData, "toDay_Суббота")).toBe(false);
      expect(grid.isRowHighlighted(rowData, "to_Водитель")).toBe(true);
      expect(grid.isRowHighlighted(rowData, "from_Маршрутка")).toBe(true); // Маршрутка matches Трансфер
    });
    
    it("should correctly handle row selection with shift/ctrl keys", () => {
      const grid = new GridState();
      
      grid.handleRowClick(/** @type {any} */ ({ shiftKey: false, ctrlKey: false }), 2);
      expect(grid.selectedRowIndices.has(2)).toBe(true);
      expect(grid.selectedRowIndices.size).toBe(1);

      grid.handleRowClick(/** @type {any} */ ({ shiftKey: false, ctrlKey: true }), 5);
      expect(grid.selectedRowIndices.has(2)).toBe(true);
      expect(grid.selectedRowIndices.has(5)).toBe(true);
      expect(grid.selectedRowIndices.size).toBe(2);

      grid.handleRowClick(/** @type {any} */ ({ shiftKey: true, ctrlKey: false }), 7);
      // Shift should select from lastSelectedIndex (5) to 7
      expect(grid.selectedRowIndices.has(6)).toBe(true);
      expect(grid.selectedRowIndices.has(7)).toBe(true);
      
      // Ctrl click on existing to unselect
      grid.handleRowClick(/** @type {any} */ ({ shiftKey: false, ctrlKey: true }), 5);
      expect(grid.selectedRowIndices.has(5)).toBe(false);

      // Normal click on existing row clears selection
      grid.handleRowClick(/** @type {any} */ ({ shiftKey: false, ctrlKey: false }), 7); // now only 7 is selected
      grid.handleRowClick(/** @type {any} */ ({ shiftKey: false, ctrlKey: false }), 7); // clicks 7 again
      expect(grid.selectedRowIndices.size).toBe(0);
    });

    it("should return lastPinnedCol correctly", () => {
      const grid = new GridState();
      expect(grid.lastPinnedCol).toBe("num");
      grid.isNicknamePinned = true;
      expect(grid.lastPinnedCol).toBe("nickname");
      grid.isNamePinned = true;
      expect(grid.lastPinnedCol).toBe("name");
    });

    it("should handle isRowHighlightedAll", () => {
      const grid = new GridState();
      const p = { transportTo: { method: "Водитель" } };
      
      expect(grid.isRowHighlightedAll(p)).toBe(false); // no filters
      
      grid.handleHeaderClick("to_Водитель");
      expect(grid.isRowHighlightedAll(p)).toBe(true);
      
      grid.handleHeaderClick("toCity_Москва");
      expect(grid.isRowHighlightedAll(p)).toBe(false); // misses city
      
      const p2 = { transportTo: { method: "Водитель", seats: 2 } };
      expect(grid.isRowHighlighted(p2, "toSeats_true")).toBe(true);
      const p3 = { transportTo: { method: "Водитель", seats: 0 } };
      expect(grid.isRowHighlighted(p3, "toSeats_true")).toBe(false);
    });

    it("should handle isRowActiveOrHovered", () => {
      const grid = new GridState();
      const p = { transportTo: { method: "Водитель" } };
      
      // nothing active, nothing hovered
      expect(grid.isRowActiveOrHovered(p, false)).toBe(false);
      
      // hovered but not matching
      grid.hoveredFilter = "to_Пассажир";
      expect(grid.isRowActiveOrHovered(p, false)).toBe(false);
      
      // hovered and matching
      grid.hoveredFilter = "to_Водитель";
      expect(grid.isRowActiveOrHovered(p, false)).toBe(true);
      
      grid.hoveredFilter = null;
      // Filter mode active but no matching filters
      expect(grid.isRowActiveOrHovered(p, true)).toBe(false);
      
      // activeFilters > 0 but hovered = null, filterMode = true
      grid.handleHeaderClick("to_Водитель");
      expect(grid.isRowActiveOrHovered(p, true)).toBe(false);
      grid.handleHeaderClick("to_Водитель"); // toggle off
      expect(grid.isRowActiveOrHovered(p, true)).toBe(false); // now it reaches line 203
      
      grid.handleHeaderClick("to_Водитель");
      expect(grid.isRowActiveOrHovered(p, false)).toBe(true);
    });

    it("should check isFilterActive and isFilterHoveredOrActive", () => {
      const grid = new GridState();
      grid.handleHeaderClick("to_Водитель");
      grid.hoveredFilter = "to_Пассажир";
      
      expect(grid.isFilterActive("to_Водитель")).toBe(true);
      expect(grid.isFilterActive("to_Пассажир")).toBe(false);
      
      expect(grid.isFilterHoveredOrActive("to_Водитель")).toBe(true);
      expect(grid.isFilterHoveredOrActive("to_Пассажир")).toBe(true);
    });

    it("should getFilterDetails for different keys", () => {
      const grid = new GridState();
      
      expect(grid.getFilterDetails(null)).toBeNull();
      
      const city = grid.getFilterDetails("toCity_moscow");
      expect(city.valText).toBe("Moscow");
      expect(city.sortOrder).toBe(2);

      const fn = grid.getFilterDetails("firstName_ivan");
      expect(fn.valText).toBe("Ivan");
      expect(fn.sortOrder).toBe(99);

      const day = grid.getFilterDetails("toDay_Пятница");
      expect(day.valText).toBe("ПТ");
      expect(day.sortOrder).toBe(3);

      const time = grid.getFilterDetails("toTime_18:00");
      expect(time.sortOrder).toBe(4);

      const method = grid.getFilterDetails("to_Водитель");
      expect(method.valIcon).toBe("directions_car");
      expect(method.hideValText).toBe(true);
    });
  });

  describe("Helpers", () => {
    it("getDayStatus returns correct object", () => {
      expect(getDayStatus("Пт", "Пт").active).toBe(true);
      expect(getDayStatus("Пт", "Пт").icon).toBe("check_circle");
      
      expect(getDayStatus("Сб", "Пт").active).toBe(false);
      expect(getDayStatus("Сб", "Пт").icon).toBe("radio_button_unchecked");
    });

    it("getMethodStatus returns correct object", () => {
      expect(getMethodStatus("Водитель", "Водитель").active).toBe(true);
      expect(getMethodStatus("Трансфер", "Маршрутка").active).toBe(true);
      expect(getMethodStatus("Пассажир", "Водитель").active).toBe(false);
    });
  });
});
