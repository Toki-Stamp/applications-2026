import { describe, it, expect } from "vitest";
import {
  GridState,
  getDayStatus,
  getMethodStatus,
  parseFilterKey,
} from "./gridStore.svelte.js";

describe("gridStore.svelte.js", () => {
  describe("GridState", () => {
    it("should initialize with default states", () => {
      const grid = new GridState();
      expect(grid.activeFilters).toEqual({});
      expect(grid.searchQuery).toBe("");
      expect(grid.hoveredFilter).toBe(null);
      expect(grid.selectedRowIndices.size).toBe(0);
      expect(grid.isNumPinned).toBe(true);
      expect(grid.hasActiveFilters).toBe(false);
      expect(grid.hasAnyFilterOrSearch).toBe(false);
    });

    it("should toggle filters in handleHeaderClick and support multi-values", () => {
      const grid = new GridState();

      grid.handleHeaderClick("toDay_Пятница");
      expect(grid.activeFilters["toDay"]).toBeDefined();
      expect(grid.activeFilters["toDay"].value).toBe("Пятница");
      expect(grid.activeFilters["toDay"].values).toEqual(["Пятница"]);

      // Multi-select adding another day
      grid.handleHeaderClick("toDay_Суббота");
      expect(grid.activeFilters["toDay"].values).toEqual(["Пятница", "Суббота"]);

      // Toggling off "Пятница"
      grid.handleHeaderClick("toDay_Пятница");
      expect(grid.activeFilters["toDay"].values).toEqual(["Суббота"]);

      // Toggling off "Суббота"
      grid.handleHeaderClick("toDay_Суббота");
      expect(grid.activeFilters["toDay"]).toBeUndefined();
    });

    it("should highlight rows based on filters", () => {
      const grid = new GridState();
      const rowData = {
        transportTo: { day: "Пятница", method: "Водитель", seats: 3 },
        transportFrom: { day: "Вс", method: "Трансфер" },
      };

      expect(grid.isRowHighlighted(rowData, "toDay_Пятница")).toBe(true);
      expect(grid.isRowHighlighted(rowData, "toDay_Суббота")).toBe(false);
      expect(grid.isRowHighlighted(rowData, "to_Водитель")).toBe(true);
      expect(grid.isRowHighlighted(rowData, "from_Маршрутка")).toBe(true); // Маршрутка matches Трансфер
      expect(grid.isRowHighlighted(rowData, "toSeats_true")).toBe(true);
    });

    it("should correctly search across nickname, firstName, lastName, city, comment", () => {
      const grid = new GridState();
      const p1 = {
        nickname: "Shadow",
        firstName: "Иван",
        lastName: "Иванов",
        transportTo: { city: "Москва" },
      };
      const p2 = {
        nickname: "Sun",
        firstName: "Ольга",
        transportTo: { city: "Санкт-Петербург" },
      };

      grid.setSearchQuery("sha");
      expect(grid.isRowMatchingSearch(p1)).toBe(true);
      expect(grid.isRowMatchingSearch(p2)).toBe(false);

      grid.setSearchQuery("иван");
      expect(grid.isRowMatchingSearch(p1)).toBe(true);
      expect(grid.isRowMatchingSearch(p2)).toBe(false);

      grid.setSearchQuery("петербург");
      expect(grid.isRowMatchingSearch(p1)).toBe(false);
      expect(grid.isRowMatchingSearch(p2)).toBe(true);

      grid.clearSearch();
      expect(grid.searchQuery).toBe("");
      expect(grid.isRowMatchingSearch(p1)).toBe(true);
    });

    it("should filter correctly using column-specific search queries", () => {
      const grid = new GridState();
      const p1 = {
        nickname: "Vader",
        firstName: "Энакин",
        lastName: "Скайуокер",
        transportTo: { city: "Татуин" },
      };
      const p2 = {
        nickname: "Luke",
        firstName: "Люк",
        lastName: "Скайуокер",
        transportTo: { city: "Татуин" },
      };
      const p3 = {
        nickname: "Yoda",
        firstName: "Йода",
        lastName: "Грандмастер",
        transportTo: { city: "Дагоба" },
      };

      // Search Nick
      grid.searchNick = "vad";
      expect(grid.isRowMatchingSearch(p1)).toBe(true);
      expect(grid.isRowMatchingSearch(p2)).toBe(false);
      expect(grid.isRowMatchingSearch(p3)).toBe(false);

      // Search Name (firstName / lastName)
      grid.searchNick = "";
      grid.searchName = "скай";
      expect(grid.isRowMatchingSearch(p1)).toBe(true);
      expect(grid.isRowMatchingSearch(p2)).toBe(true);
      expect(grid.isRowMatchingSearch(p3)).toBe(false);

      // Search City
      grid.searchName = "";
      grid.searchCity = "татуин";
      expect(grid.isRowMatchingSearch(p1)).toBe(true);
      expect(grid.isRowMatchingSearch(p2)).toBe(true);
      expect(grid.isRowMatchingSearch(p3)).toBe(false);

      // Combined column searches
      grid.searchNick = "luke";
      expect(grid.isRowMatchingSearch(p1)).toBe(false);
      expect(grid.isRowMatchingSearch(p2)).toBe(true);
    });

    it("should combine filters and search query in isRowHighlightedAll", () => {
      const grid = new GridState();
      const p1 = {
        nickname: "Alex",
        transportTo: { method: "Водитель", day: "Пятница", seats: 2 },
      };
      const p2 = {
        nickname: "Bob",
        transportTo: { method: "Водитель", day: "Суббота", seats: 0 },
      };

      grid.handleHeaderClick("to_Водитель");
      expect(grid.isRowHighlightedAll(p1)).toBe(true);
      expect(grid.isRowHighlightedAll(p2)).toBe(true);

      // Add day filter
      grid.handleHeaderClick("toDay_Пятница");
      expect(grid.isRowHighlightedAll(p1)).toBe(true);
      expect(grid.isRowHighlightedAll(p2)).toBe(false);

      // Add search query
      grid.setSearchQuery("al");
      expect(grid.isRowHighlightedAll(p1)).toBe(true);
      grid.setSearchQuery("xyz");
      expect(grid.isRowHighlightedAll(p1)).toBe(false);
    });

    it("should toggle seats filter and match only drivers with seats > 0", () => {
      const grid = new GridState();
      const p1 = { transportTo: { method: "Водитель", seats: 2 } };
      const p2 = { transportTo: { method: "Водитель", seats: 0 } };
      const p3 = { transportTo: { method: "Пассажир", seats: 0 } };

      grid.toggleSeatsFilter();
      expect(grid.isFilterActive("toSeats_true")).toBe(true);
      expect(grid.isRowHighlightedAll(p1)).toBe(true);
      expect(grid.isRowHighlightedAll(p2)).toBe(false);
      expect(grid.isRowHighlightedAll(p3)).toBe(false);
    });

    it("should correctly extract unique cities with counts", () => {
      const grid = new GridState();
      const participants = [
        { transportTo: { city: "москва" } },
        { transportTo: { city: "Москва" } },
        { transportTo: { city: "Санкт-Петербург" } },
        { transportTo: { city: "" } },
        { transportTo: null },
      ];

      const cities = grid.getUniqueCities(participants);
      expect(cities).toEqual([
        { city: "Москва", count: 2, totalCount: 2, key: "москва" },
        { city: "Санкт-Петербург", count: 1, totalCount: 1, key: "санкт-петербург" },
      ]);
    });

    it("should correctly calculate contextual faceted counts when other filters are active", () => {
      const grid = new GridState();
      const participants = [
        {
          nickname: "User1",
          transportTo: { method: "Водитель", city: "Минск" },
        },
        {
          nickname: "User2",
          transportTo: { method: "Пассажир", city: "Брест" },
        },
        {
          nickname: "User3",
          transportTo: { method: "Пассажир", city: "Барановичи" },
        },
      ];

      // Filter by transport "Пассажир"
      grid.handleHeaderClick("to_Пассажир");

      const cities = grid.getUniqueCities(participants);
      // Барановичи and Брест have count 1 (sorted alphabetically), Минск has count 0 (disabled)
      expect(cities[0].city).toBe("Барановичи");
      expect(cities[0].count).toBe(1);
      expect(cities[1].city).toBe("Брест");
      expect(cities[1].count).toBe(1);
      expect(cities[2].city).toBe("Минск");
      expect(cities[2].count).toBe(0);
      expect(cities[2].totalCount).toBe(1);
    });

    it("should correctly extract unique times with counts", () => {
      const grid = new GridState();
      const participants = [
        {
          transportTo: { time: "10:00" },
          transportFrom: { time: "18:00" },
        },
        {
          transportTo: { time: "12:00" },
          transportFrom: { time: "18:00" },
        },
        {
          transportTo: { time: "10:00" },
          transportFrom: { time: "15:00" },
        },
      ];

      const times = grid.getUniqueTimes(participants);
      expect(times.toTimes).toEqual([
        { time: "10:00", count: 2, totalCount: 2 },
        { time: "12:00", count: 1, totalCount: 1 },
      ]);
      expect(times.fromTimes).toEqual([
        { time: "15:00", count: 1, totalCount: 1 },
        { time: "18:00", count: 2, totalCount: 2 },
      ]);
    });

    it("should compute aggregated stats", () => {
      const grid = new GridState();
      const participants = [
        {
          nickname: "User1",
          transportTo: { method: "Водитель", seats: 3, day: "Пятница" },
        },
        {
          nickname: "User2",
          transportTo: { method: "Водитель", seats: 2, day: "Суббота" },
        },
        {
          nickname: "User3",
          transportTo: { method: "Пассажир", day: "Пятница" },
        },
      ];

      let stats = grid.getStats(participants);
      expect(stats.total).toBe(3);
      expect(stats.matched).toBe(3);
      expect(stats.availableSeats).toBe(5);
      expect(stats.hasFilters).toBe(false);

      grid.handleHeaderClick("toDay_Пятница");
      stats = grid.getStats(participants);
      expect(stats.total).toBe(3);
      expect(stats.matched).toBe(2);
      expect(stats.availableSeats).toBe(3);
      expect(stats.hasFilters).toBe(true);
    });

    it("should correctly handle row selection with shift/ctrl keys", () => {
      const grid = new GridState();

      grid.handleRowClick(
        /** @type {any} */ ({ shiftKey: false, ctrlKey: false }),
        2,
      );
      expect(grid.selectedRowIndices.has(2)).toBe(true);
      expect(grid.selectedRowIndices.size).toBe(1);

      grid.handleRowClick(
        /** @type {any} */ ({ shiftKey: false, ctrlKey: true }),
        5,
      );
      expect(grid.selectedRowIndices.has(2)).toBe(true);
      expect(grid.selectedRowIndices.has(5)).toBe(true);
      expect(grid.selectedRowIndices.size).toBe(2);

      grid.handleRowClick(
        /** @type {any} */ ({ shiftKey: true, ctrlKey: false }),
        7,
      );
      expect(grid.selectedRowIndices.has(6)).toBe(true);
      expect(grid.selectedRowIndices.has(7)).toBe(true);

      // Ctrl click on existing to unselect
      grid.handleRowClick(
        /** @type {any} */ ({ shiftKey: false, ctrlKey: true }),
        5,
      );
      expect(grid.selectedRowIndices.has(5)).toBe(false);

      // Normal click on existing row clears selection
      grid.handleRowClick(
        /** @type {any} */ ({ shiftKey: false, ctrlKey: false }),
        7,
      );
      grid.handleRowClick(
        /** @type {any} */ ({ shiftKey: false, ctrlKey: false }),
        7,
      );
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

    it("should clear all filters and search", () => {
      const grid = new GridState();
      grid.handleHeaderClick("to_Водитель");
      grid.setSearchQuery("hello");
      grid.selectedRowIndices = new Set([1, 2]);

      expect(grid.hasAnyFilterOrSearch).toBe(true);
      grid.clearAllFilters();
      expect(grid.hasAnyFilterOrSearch).toBe(false);
      expect(grid.searchQuery).toBe("");
      expect(grid.activeFilters).toEqual({});
      expect(grid.selectedRowIndices.size).toBe(0);
    });

    it("should parse filter keys with parseFilterKey", () => {
      expect(parseFilterKey("to_Водитель")).toEqual(["to", "Водитель"]);
      expect(parseFilterKey("toCity_москва")).toEqual(["toCity", "москва"]);
      expect(parseFilterKey("toSeats_true")).toEqual(["toSeats", "true"]);
      expect(parseFilterKey("toTime_12:00")).toEqual(["toTime", "12:00"]);
      expect(parseFilterKey("single")).toEqual(["single", ""]);
    });
  });

  describe("Helpers", () => {
    it("getDayStatus returns correct object", () => {
      expect(getDayStatus("Пт", "Пт").active).toBe(true);
      expect(getDayStatus("Пт", "Пт").icon).toBe("check");
      expect(getDayStatus("Сб", "Пт").active).toBe(false);
      expect(getDayStatus("Сб", "Пт").icon).toBe("");
      expect(getDayStatus("Пт", "Пятница").active).toBe(true);
      expect(getDayStatus("Пятница", "Пт").active).toBe(true);
    });

    it("getMethodStatus returns correct object", () => {
      expect(getMethodStatus("Водитель", "Водитель").active).toBe(true);
      expect(getMethodStatus("Водитель", "Водитель").icon).toBe("check");
      expect(getMethodStatus("Трансфер", "Маршрутка").active).toBe(true);
      expect(getMethodStatus("Трансфер", "Маршрутка").icon).toBe("check");
      expect(getMethodStatus("Пассажир", "Водитель").active).toBe(false);
      expect(getMethodStatus("Пассажир", "Водитель").icon).toBe("");
    });
  });

  describe("Summary Row Calculations & Dynamic Filtering", () => {
    const sampleParticipants = [
      {
        id: "1",
        nickname: "Shadow",
        firstName: "Иван",
        transportTo: { method: "Водитель", day: "Пятница", city: "Минск", seats: 3 },
        transportFrom: { method: "Пассажир", day: "Воскресенье", city: "Минск" },
      },
      {
        id: "2",
        nickname: "Vader",
        firstName: "Алексей",
        transportTo: { method: "Водитель", day: "Суббота", city: "Гомель", seats: 2 },
        transportFrom: { method: "Водитель", day: "Воскресенье", city: "Гомель", seats: 2 },
      },
      {
        id: "3",
        nickname: "Luna",
        firstName: "Елена",
        transportTo: { method: "Пассажир", day: "Пятница", city: "Минск" },
        transportFrom: { method: "Маршрутка", day: "Воскресенье", city: "Минск" },
      },
      {
        id: "4",
        nickname: "Swift",
        firstName: "Дмитрий",
        transportTo: { method: "Маршрутка", day: "Пятница", city: "Минск" },
        transportFrom: { method: "Свой ход", day: "Суббота", city: "Минск" },
      },
      {
        id: "5",
        nickname: "Nomad",
        firstName: "Сергей",
        transportTo: { method: "Свой ход", day: "Суббота", city: "Брест" },
        transportFrom: { method: "Свой ход", day: "Воскресенье", city: "Брест" },
      },
    ];

    /**
     * Reusable summary calculation mimicking GridSummaryRow.svelte
     */
    function calculateSummary(grid, participants) {
      const matching = !grid.hasAnyFilterOrSearch
        ? participants
        : participants.filter((p) => grid.isRowHighlightedAll(p));

      return {
        count: matching.length,
        toDrivers: matching.filter((p) => p.transportTo?.method === "Водитель").length,
        toPassengers: matching.filter((p) => p.transportTo?.method === "Пассажир").length,
        toBuses: matching.filter(
          (p) => p.transportTo?.method === "Маршрутка" || p.transportTo?.method === "Трансфер",
        ).length,
        toSelf: matching.filter((p) => p.transportTo?.method === "Свой ход").length,
        toFri: matching.filter((p) => p.transportTo?.day === "Пятница" || p.transportTo?.day === "Пт").length,
        toSat: matching.filter((p) => p.transportTo?.day === "Суббота" || p.transportTo?.day === "Сб").length,
        toSun: matching.filter((p) => p.transportTo?.day === "Воскресенье" || p.transportTo?.day === "Вс").length,
        fromDrivers: matching.filter((p) => p.transportFrom?.method === "Водитель").length,
        fromPassengers: matching.filter((p) => p.transportFrom?.method === "Пассажир").length,
        fromBuses: matching.filter(
          (p) => p.transportFrom?.method === "Маршрутка" || p.transportFrom?.method === "Трансфер",
        ).length,
        fromSelf: matching.filter((p) => p.transportFrom?.method === "Свой ход").length,
        fromFri: matching.filter((p) => p.transportFrom?.day === "Пятница" || p.transportFrom?.day === "Пт").length,
        fromSat: matching.filter((p) => p.transportFrom?.day === "Суббота" || p.transportFrom?.day === "Сб").length,
        fromSun: matching.filter((p) => p.transportFrom?.day === "Воскресенье" || p.transportFrom?.day === "Вс").length,
      };
    }

    it("should calculate correct baseline numbers when no filters are active", () => {
      const grid = new GridState();
      const summary = calculateSummary(grid, sampleParticipants);

      expect(summary.count).toBe(5);
      expect(summary.toDrivers).toBe(2);
      expect(summary.toPassengers).toBe(1);
      expect(summary.toBuses).toBe(1);
      expect(summary.toSelf).toBe(1);
      expect(summary.toFri).toBe(3);
      expect(summary.toSat).toBe(2);
      expect(summary.toSun).toBe(0);

      expect(summary.fromDrivers).toBe(1);
      expect(summary.fromPassengers).toBe(1);
      expect(summary.fromBuses).toBe(1);
      expect(summary.fromSelf).toBe(2);
      expect(summary.fromFri).toBe(0);
      expect(summary.fromSat).toBe(1);
      expect(summary.fromSun).toBe(4);
    });

    it("should dynamically recalculate summary numbers when filtering by City (Минск)", () => {
      const grid = new GridState();
      grid.toggleFilter("toCity", "минск");
      const summary = calculateSummary(grid, sampleParticipants);

      // Matches Shadow (1), Luna (3), Swift (4) -> 3 participants from Minsk
      expect(summary.count).toBe(3);
      expect(summary.toDrivers).toBe(1);     // Shadow
      expect(summary.toPassengers).toBe(1);  // Luna
      expect(summary.toBuses).toBe(1);       // Swift
      expect(summary.toSelf).toBe(0);        // None from Minsk
      expect(summary.toFri).toBe(3);
      expect(summary.toSat).toBe(0);

      expect(summary.fromPassengers).toBe(1);
      expect(summary.fromBuses).toBe(1);
      expect(summary.fromSelf).toBe(1);
    });

    it("should dynamically recalculate summary numbers when multi-filtering transport methods (Водитель OR Пассажир)", () => {
      const grid = new GridState();
      grid.toggleFilter("to", "Водитель");
      grid.toggleFilter("to", "Пассажир");
      const summary = calculateSummary(grid, sampleParticipants);

      // Matches Shadow (1), Vader (2), Luna (3) -> 3 participants
      expect(summary.count).toBe(3);
      expect(summary.toDrivers).toBe(2);
      expect(summary.toPassengers).toBe(1);
      expect(summary.toBuses).toBe(0);
      expect(summary.toSelf).toBe(0);
      expect(summary.toFri).toBe(2); // Shadow, Luna
      expect(summary.toSat).toBe(1); // Vader
    });

    it("should dynamically recalculate when combining cross-category filters (Водитель AND Пятница)", () => {
      const grid = new GridState();
      grid.toggleFilter("to", "Водитель");
      grid.toggleFilter("toDay", "Пятница");
      const summary = calculateSummary(grid, sampleParticipants);

      // Matches only Shadow (1)
      expect(summary.count).toBe(1);
      expect(summary.toDrivers).toBe(1);
      expect(summary.toPassengers).toBe(0);
      expect(summary.toFri).toBe(1);
      expect(summary.fromPassengers).toBe(1);
      expect(summary.fromSun).toBe(1);
    });

    it("should recalculate to zero when filter or search has no matches", () => {
      const grid = new GridState();
      grid.searchNick = "NonExistentUser";
      const summary = calculateSummary(grid, sampleParticipants);

      expect(summary.count).toBe(0);
      expect(summary.toDrivers).toBe(0);
      expect(summary.toPassengers).toBe(0);
      expect(summary.toBuses).toBe(0);
      expect(summary.toSelf).toBe(0);
      expect(summary.toFri).toBe(0);
      expect(summary.toSat).toBe(0);
      expect(summary.toSun).toBe(0);
    });

    it("should restore baseline numbers when filters are cleared", () => {
      const grid = new GridState();
      grid.toggleFilter("to", "Водитель");
      grid.searchNick = "Shadow";
      expect(calculateSummary(grid, sampleParticipants).count).toBe(1);

      grid.clearAllFilters();
      expect(calculateSummary(grid, sampleParticipants).count).toBe(5);
      expect(calculateSummary(grid, sampleParticipants).toDrivers).toBe(2);
    });
  });
});
