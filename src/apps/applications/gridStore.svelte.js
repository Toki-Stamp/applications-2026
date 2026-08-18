import { dict } from "$shared/locales/ru.js";

// Helper to match days (supports both short 'Пт' and full 'Пятница')
/**
 * @param {string | null | undefined} actualDay
 * @param {string | null | undefined} targetDay
 */
export function isDayMatch(actualDay, targetDay) {
  if (!actualDay || !targetDay) return false;
  if (actualDay === targetDay) return true;
  const dayMap = {
    "Пт": "Пятница",
    "Сб": "Суббота",
    "Вс": "Воскресенье",
    "Пятница": "Пятница",
    "Суббота": "Суббота",
    "Воскресенье": "Воскресенье",
  };
  return dayMap[actualDay] === dayMap[targetDay] && !!dayMap[actualDay];
}

// Helper to render checkmark or empty for day
/**
 * @param {string} actualDay
 * @param {string} targetDay
 */
export function getDayStatus(actualDay, targetDay) {
  const active = isDayMatch(actualDay, targetDay);
  return {
    active,
    icon: active ? "check" : "",
  };
}

// Helper to render checkmark or empty for transport method
/**
 * @param {string} actualMethod
 * @param {string} targetMethod
 */
export function getMethodStatus(actualMethod, targetMethod) {
  if (
    actualMethod === targetMethod ||
    (targetMethod === "Маршрутка" && actualMethod === "Трансфер")
  ) {
    return { active: true, icon: "check" };
  }
  return { active: false, icon: "" };
}

/** @type {Array<{key: string, icon: string, id: 'driver' | 'passenger' | 'bus' | 'self'}>} */
export const transportMethods = [
  { key: "Водитель", icon: "directions_car", id: "driver" },
  { key: "Пассажир", icon: "hail", id: "passenger" },
  { key: "Маршрутка", icon: "directions_bus", id: "bus" },
  { key: "Свой ход", icon: "directions_walk", id: "self" },
];

/**
 * Split a filter key into [group, value]
 * E.g., 'to_Водитель' -> ['to', 'Водитель'], 'toCity_москва' -> ['toCity', 'москва']
 * @param {string} key
 * @returns {[string, string]}
 */
export function parseFilterKey(key) {
  const idx = key.indexOf("_");
  if (idx === -1) return [key, ""];
  return [key.slice(0, idx), key.slice(idx + 1)];
}

export class GridState {
  /** @type {Record<string, { value: string, values?: string[], details?: any }>} */
  activeFilters = $state({});
  /** @type {string} */
  searchQuery = $state("");
  /** @type {string} */
  searchNick = $state("");
  /** @type {string} */
  searchName = $state("");
  /** @type {string} */
  searchCity = $state("");
  /** @type {string | null} */
  hoveredFilter = $state(null);
  /** @type {Set<number>} */
  selectedRowIndices = $state(new Set());
  /** @type {number} */
  lastSelectedIndex = $state(-1);

  isNumPinned = $state(true);
  isNicknamePinned = $state(false);
  isNamePinned = $state(false);

  widthNum = $state(0);
  widthNickname = $state(0);
  widthName = $state(0);

  constructor(initialFilters = {}) {
    this.activeFilters = initialFilters;
  }

  get hasActiveFilters() {
    return Object.keys(this.activeFilters).length > 0;
  }

  get hasAnyFilterOrSearch() {
    return (
      this.hasActiveFilters ||
      this.searchQuery.trim().length > 0 ||
      this.searchNick.trim().length > 0 ||
      this.searchName.trim().length > 0 ||
      this.searchCity.trim().length > 0
    );
  }

  get lastPinnedCol() {
    return this.isNamePinned
      ? "name"
      : this.isNicknamePinned
        ? "nickname"
        : this.isNumPinned
          ? "num"
          : null;
  }

  /**
   * @param {string} query
   */
  setSearchQuery(query) {
    this.searchQuery = query;
  }

  clearSearch() {
    this.searchQuery = "";
  }

  clearAllFilters() {
    this.activeFilters = {};
    this.searchQuery = "";
    this.searchNick = "";
    this.searchName = "";
    this.searchCity = "";
    this.selectedRowIndices = new Set();
    this.lastSelectedIndex = -1;
  }

  /**
   * @param {MouseEvent} event
   * @param {number} i
   */
  handleRowClick(event, i) {
    if (event.shiftKey && this.lastSelectedIndex !== -1) {
      const newSet = new Set(this.selectedRowIndices);
      const start = Math.min(this.lastSelectedIndex, i);
      const end = Math.max(this.lastSelectedIndex, i);
      for (let j = start; j <= end; j++) {
        newSet.add(j);
      }
      this.selectedRowIndices = newSet;
    } else if (event.ctrlKey || event.metaKey) {
      const newSet = new Set(this.selectedRowIndices);
      if (newSet.has(i)) {
        newSet.delete(i);
      } else {
        newSet.add(i);
      }
      this.selectedRowIndices = newSet;
      this.lastSelectedIndex = i;
    } else {
      if (
        this.selectedRowIndices.has(i) &&
        this.selectedRowIndices.size === 1
      ) {
        this.selectedRowIndices = new Set();
        this.lastSelectedIndex = -1;
      } else {
        this.selectedRowIndices = new Set([i]);
        this.lastSelectedIndex = i;
      }
    }
  }

  /**
   * Toggle a filter from key
   * @param {string} key
   */
  handleHeaderClick(key) {
    this.selectedRowIndices = new Set();
    this.lastSelectedIndex = -1;
    const [group, value] = parseFilterKey(key);

    const existing = this.activeFilters[group];
    if (existing) {
      const values = existing.values || [existing.value];
      if (values.includes(value)) {
        const remaining = values.filter((v) => v !== value);
        if (remaining.length === 0) {
          const newFilters = { ...this.activeFilters };
          delete newFilters[group];
          this.activeFilters = newFilters;
        } else {
          this.activeFilters = {
            ...this.activeFilters,
            [group]: {
              value: remaining[0],
              values: remaining,
              details: this.getFilterDetails(`${group}_${remaining[0]}`),
            },
          };
        }
      } else {
        const newValues = [...values, value];
        this.activeFilters = {
          ...this.activeFilters,
          [group]: {
            value: newValues[0],
            values: newValues,
            details: this.getFilterDetails(`${group}_${value}`),
          },
        };
      }
    } else {
      this.activeFilters = {
        ...this.activeFilters,
        [group]: {
          value,
          values: [value],
          details: this.getFilterDetails(key),
        },
      };
    }
  }

  /**
   * Toggle a specific filter value in a group
   * @param {string} group
   * @param {string} value
   */
  toggleFilter(group, value) {
    this.handleHeaderClick(`${group}_${value}`);
  }

  /**
   * Toggle seats filter (only drivers with free seats > 0)
   */
  toggleSeatsFilter() {
    this.handleHeaderClick("toSeats_true");
  }

  /**
   * Check if a specific value in a group is active
   * @param {string} group
   * @param {string} value
   */
  isGroupValueActive(group, value) {
    const existing = this.activeFilters[group];
    if (!existing) return false;
    const values = existing.values || [existing.value];
    return values.includes(value);
  }

  /**
   * @param {string | null} filterKey
   * @returns {{ catText: string, catIcon?: string, hideCatText?: boolean, valText: string, valIcon?: string, hideValText?: boolean, sortOrder?: number } | null}
   */
  getFilterDetails(filterKey) {
    if (!filterKey) return null;
    const [direction, value] = parseFilterKey(filterKey);

    if (direction === "toSeats") {
      return {
        catText: "ТУДА",
        hideCatText: true,
        valText: "С местами",
        valIcon: "airline_seat_recline_normal",
        sortOrder: 5,
      };
    }

    if (direction === "toCity" || direction === "fromCity") {
      const cityName = value.charAt(0).toUpperCase() + value.slice(1);
      return {
        catText: direction.startsWith("to") ? "ТУДА" : "ОБРАТНО",
        hideCatText: true,
        valText: cityName,
        tooltip: `Город: ${cityName}`,
        sortOrder: 2,
      };
    }

    if (direction === "firstName")
      return {
        catText: "Имя",
        hideCatText: true,
        valText: value.charAt(0).toUpperCase() + value.slice(1),
        tooltip: value,
        sortOrder: 99,
      };

    const dirStr = direction.startsWith("to") ? "ТУДА" : "ОБРАТНО";

    let typeStr = "Способ";
    let sortOrder = 1;
    if (direction.includes("Day")) {
      typeStr = "День";
      sortOrder = 3;
    }
    if (direction.includes("Time")) {
      typeStr = "Время";
      sortOrder = 4;
    }

    let displayValue = value;
    let tooltip = value;
    /** @type {string | undefined} */
    let valIcon = undefined;
    if (typeStr === "Способ") {
      const match = transportMethods.find((tm) => tm.key === value);
      if (match) {
        displayValue = dict.options.transportMethodsTo[match.id];
        tooltip = displayValue;
        valIcon = match.icon;
      }
    } else if (typeStr === "День") {
      if (isDayMatch(value, "Пятница")) {
        displayValue = "ПТ";
        tooltip = "Пятница";
      } else if (isDayMatch(value, "Суббота")) {
        displayValue = "СБ";
        tooltip = "Суббота";
      } else if (isDayMatch(value, "Воскресенье")) {
        displayValue = "ВС";
        tooltip = "Воскресенье";
      } else {
        displayValue = value.toUpperCase();
        tooltip = value;
      }
    } else if (typeStr === "Время") {
      valIcon = "schedule";
      tooltip = `Время: ${value}`;
    }

    return {
      catText: dirStr,
      hideCatText: true,
      valText: displayValue,
      tooltip,
      valIcon: valIcon,
      hideValText: typeStr === "Способ",
      sortOrder,
    };
  }

  /**
   * Search match checker across global query and column-specific queries
   * @param {any} p
   */
  isRowMatchingSearch(p) {
    // 1. Global search query
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      const nick = (p.nickname || "").toLowerCase();
      const name = (p.firstName || "").toLowerCase();
      const lastName = (p.lastName || "").toLowerCase();
      const city = (p.transportTo?.city || "").toLowerCase();
      const comment = (p.comment || p.transportComment || "").toLowerCase();
      const matchGlobal =
        nick.includes(q) ||
        name.includes(q) ||
        lastName.includes(q) ||
        city.includes(q) ||
        comment.includes(q);
      if (!matchGlobal) return false;
    }

    // 2. Column Nickname search
    if (this.searchNick && this.searchNick.trim()) {
      const q = this.searchNick.trim().toLowerCase();
      const nick = (p.nickname || "").toLowerCase();
      if (!nick.includes(q)) return false;
    }

    // 3. Column Name search (checks firstName and lastName)
    if (this.searchName && this.searchName.trim()) {
      const q = this.searchName.trim().toLowerCase();
      const name = (p.firstName || "").toLowerCase();
      const lastName = (p.lastName || "").toLowerCase();
      if (!name.includes(q) && !lastName.includes(q)) return false;
    }

    // 4. Column City search (checks transportTo.city)
    if (this.searchCity && this.searchCity.trim()) {
      const q = this.searchCity.trim().toLowerCase();
      const city = (p.transportTo?.city || "").toLowerCase();
      if (!city.includes(q)) return false;
    }

    return true;
  }

  /**
   * @param {any} p
   * @param {string | null} filterKey
   */
  isRowHighlighted(p, filterKey) {
    if (!filterKey) return false;
    const [dir, val] = parseFilterKey(filterKey);

    if (dir === "toCity")
      return p.transportTo?.city?.trim().toLowerCase() === val;
    if (dir === "firstName") return p.firstName?.trim().toLowerCase() === val;
    if (dir === "toDay") return isDayMatch(p.transportTo?.day, val);
    if (dir === "fromDay") return isDayMatch(p.transportFrom?.day, val);
    if (dir === "toTime") return p.transportTo?.time === val;
    if (dir === "fromTime") return p.transportFrom?.time === val;
    if (dir === "toSeats")
      return (
        p.transportTo?.method === "Водитель" &&
        Number(p.transportTo?.seats || 0) > 0
      );

    const actualMethod =
      dir === "to" ? p.transportTo?.method : p.transportFrom?.method;
    if (val === "Маршрутка" && actualMethod === "Трансфер") return true;
    return actualMethod === val;
  }

  /**
   * Row matches single filter group (with OR logic inside group if multiple values selected)
   * @param {any} p
   * @param {string} group
   * @param {{ value: string, values?: string[] }} filterObj
   */
  isRowMatchingGroup(p, group, filterObj) {
    const values = filterObj.values || [filterObj.value];
    if (values.length === 0) return true;
    return values.some((v) => this.isRowHighlighted(p, `${group}_${v}`));
  }

  /**
   * Row matches ALL active filter groups AND search query
   * @param {any} p
   */
  isRowHighlightedAll(p) {
    if (
      Object.keys(this.activeFilters).length === 0 &&
      !this.searchQuery.trim() &&
      !this.searchNick.trim() &&
      !this.searchName.trim() &&
      !this.searchCity.trim()
    )
      return false;

    if (!this.isRowMatchingSearch(p)) return false;

    for (const [group, filter] of Object.entries(this.activeFilters)) {
      if (!this.isRowMatchingGroup(p, group, filter)) return false;
    }
    return true;
  }

  /**
   * @param {any} p
   * @param {boolean} filterMode
   */
  isRowActiveOrHovered(p, filterMode) {
    const hasSearch =
      this.searchQuery.trim().length > 0 ||
      this.searchNick.trim().length > 0 ||
      this.searchName.trim().length > 0 ||
      this.searchCity.trim().length > 0;
    const hasFilters = Object.keys(this.activeFilters).length > 0;

    if (!hasFilters && !this.hoveredFilter && !hasSearch) return false;

    if (hasSearch && !this.isRowMatchingSearch(p)) return false;

    if (hasFilters) {
      for (const [group, filter] of Object.entries(this.activeFilters)) {
        if (!this.isRowMatchingGroup(p, group, filter)) return false;
      }
    }

    if (this.hoveredFilter) {
      if (!this.isRowHighlighted(p, this.hoveredFilter)) return false;
    } else if (filterMode) {
      return false;
    }

    return true;
  }

  /** @param {string} filterKey */
  isFilterActive(filterKey) {
    if (!filterKey) return false;
    const [group, value] = parseFilterKey(filterKey);
    const existing = this.activeFilters[group];
    if (!existing) return false;
    const values = existing.values || [existing.value];
    return values.includes(value);
  }

  /** @param {string} filterKey */
  isFilterHoveredOrActive(filterKey) {
    if (this.hoveredFilter === filterKey) return true;
    return this.isFilterActive(filterKey);
  }

  /**
   * Checks if a row matches search and all active filters.
   * @param {any} p
   */
  isRowMatching(p) {
    return this.isRowMatchingExcept(p);
  }

  /**
   * Checks if a row matches search and all active filters except an excluded group.
   * Useful for faceted counts (e.g. available city or time counts given other active filters).
   * @param {any} p
   * @param {string} [excludedGroup]
   */
  isRowMatchingExcept(p, excludedGroup) {
    const hasSearch =
      this.searchQuery.trim().length > 0 ||
      this.searchNick.trim().length > 0 ||
      this.searchName.trim().length > 0 ||
      this.searchCity.trim().length > 0;
    if (hasSearch && !this.isRowMatchingSearch(p)) return false;

    for (const [group, filter] of Object.entries(this.activeFilters)) {
      if (group === excludedGroup) continue;
      if (!this.isRowMatchingGroup(p, group, filter)) return false;
    }
    return true;
  }

  /**
   * Extract unique cities with total and contextual filtered counts from participants array
   * @param {any[]} participants
   */
  getUniqueCities(participants = []) {
    /** @type {Map<string, { city: string, count: number, totalCount: number, key: string }>} */
    const map = new Map();
    for (const p of participants) {
      const city = p.transportTo?.city?.trim();
      if (city) {
        const key = city.toLowerCase();
        const matchesOther = this.isRowMatchingExcept(p, "toCity");
        const existing = map.get(key);
        if (existing) {
          existing.totalCount++;
          if (matchesOther) existing.count++;
        } else {
          const capitalized = city.charAt(0).toUpperCase() + city.slice(1);
          map.set(key, {
            city: capitalized,
            count: matchesOther ? 1 : 0,
            totalCount: 1,
            key,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      // 1. Active/selected cities first
      const aActive = this.isGroupValueActive("toCity", a.key) ? 1 : 0;
      const bActive = this.isGroupValueActive("toCity", b.key) ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;

      // 2. Available cities (count > 0) before disabled cities (count === 0)
      const aAvail = a.count > 0 ? 1 : 0;
      const bAvail = b.count > 0 ? 1 : 0;
      if (aAvail !== bAvail) return bAvail - aAvail;

      // 3. By count descending, then alphabetical
      return b.count - a.count || a.city.localeCompare(b.city, "ru");
    });
  }

  /**
   * Extract unique departure and return times from participants array with contextual counts
   * @param {any[]} participants
   */
  getUniqueTimes(participants = []) {
    /** @type {Map<string, { time: string, count: number, totalCount: number }>} */
    const toMap = new Map();
    /** @type {Map<string, { time: string, count: number, totalCount: number }>} */
    const fromMap = new Map();

    for (const p of participants) {
      const toTime = p.transportTo?.time?.trim();
      if (toTime) {
        const matchesOther = this.isRowMatchingExcept(p, "toTime");
        const existing = toMap.get(toTime);
        if (existing) {
          existing.totalCount++;
          if (matchesOther) existing.count++;
        } else {
          toMap.set(toTime, {
            time: toTime,
            count: matchesOther ? 1 : 0,
            totalCount: 1,
          });
        }
      }
      const fromTime = p.transportFrom?.time?.trim();
      if (fromTime) {
        const matchesOther = this.isRowMatchingExcept(p, "fromTime");
        const existing = fromMap.get(fromTime);
        if (existing) {
          existing.totalCount++;
          if (matchesOther) existing.count++;
        } else {
          fromMap.set(fromTime, {
            time: fromTime,
            count: matchesOther ? 1 : 0,
            totalCount: 1,
          });
        }
      }
    }

    /**
     * @param {{ time: string }} a
     * @param {{ time: string }} b
     */
    const sortTime = (a, b) => a.time.localeCompare(b.time);

    return {
      toTimes: Array.from(toMap.values()).sort(sortTime),
      fromTimes: Array.from(fromMap.values()).sort(sortTime),
    };
  }

  /**
   * Compute aggregated stats
   * @param {any[]} participants
   */
  getStats(participants = []) {
    const total = participants.length;
    let matched = 0;
    let availableSeats = 0;
    const hasAny = this.hasAnyFilterOrSearch;

    for (const p of participants) {
      const isMatch = hasAny ? this.isRowHighlightedAll(p) : true;
      if (isMatch) {
        matched++;
        if (p.transportTo?.method === "Водитель" && p.transportTo?.seats) {
          availableSeats += Number(p.transportTo.seats) || 0;
        }
      }
    }

    return {
      total,
      matched: hasAny ? matched : total,
      availableSeats,
      hasFilters: hasAny,
    };
  }
}
