import { dict } from "../../locales/ru.js";

// Helper to render checkmark or empty circle for day
/**
 * @param {string} actualDay
 * @param {string} targetDay
 */
export function getDayStatus(actualDay, targetDay) {
  return {
    active: actualDay === targetDay,
    icon: actualDay === targetDay ? "check_circle" : "radio_button_unchecked",
  };
}

// Helper to render checkmark or empty circle for transport method
/**
 * @param {string} actualMethod
 * @param {string} targetMethod
 */
export function getMethodStatus(actualMethod, targetMethod) {
  if (
    actualMethod === targetMethod ||
    (targetMethod === "Маршрутка" && actualMethod === "Трансфер")
  ) {
    return { active: true, icon: "check_circle" };
  }
  return { active: false, icon: "radio_button_unchecked" };
}

/** @type {Array<{key: string, icon: string, id: 'driver' | 'passenger' | 'bus' | 'self'}>} */
export const transportMethods = [
  { key: "Водитель", icon: "directions_car", id: "driver" },
  { key: "Пассажир", icon: "hail", id: "passenger" },
  { key: "Маршрутка", icon: "directions_bus", id: "bus" },
  { key: "Свой ход", icon: "directions_walk", id: "self" },
];

export class GridState {
  activeFilters = $state({});
  hoveredFilter = $state(null);
  selectedRowIndices = $state(new Set());
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

  /** @param {string} key */
  handleHeaderClick(key) {
    this.selectedRowIndices = new Set();
    this.lastSelectedIndex = -1;
    const [group, value] = key.split("_");
    if (this.activeFilters[group]?.value === value) {
      const newFilters = { ...this.activeFilters };
      delete newFilters[group];
      this.activeFilters = newFilters;
    } else {
      this.activeFilters = {
        ...this.activeFilters,
        [group]: { value, details: this.getFilterDetails(key) },
      };
    }
  }

  /**
   * @param {string | null} filterKey
   * @returns {{ catText: string, catIcon?: string, hideCatText?: boolean, valText: string, valIcon?: string, hideValText?: boolean, sortOrder?: number } | null}
   */
  getFilterDetails(filterKey) {
    if (!filterKey) return null;
    const [direction, value] = filterKey.split("_");

    if (direction === "toCity")
      return {
        catText: "ТУДА",
        hideCatText: true,
        valText: value.charAt(0).toUpperCase() + value.slice(1),
        sortOrder: 2,
      };
    if (direction === "firstName")
      return {
        catText: "Имя",
        hideCatText: true,
        valText: value.charAt(0).toUpperCase() + value.slice(1),
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
    /** @type {string | undefined} */
    let valIcon = undefined;
    if (typeStr === "Способ") {
      const match = transportMethods.find((tm) => tm.key === value);
      if (match) {
        displayValue = dict.options.transportMethodsTo[match.id];
        valIcon = match.icon;
      }
    } else if (typeStr === "День") {
      /** @type {Record<string, string>} */
      const dayMap = { Пятница: "ПТ", Суббота: "СБ", Воскресенье: "ВС" };
      displayValue = dayMap[value] || value;
    }

    return {
      catText: dirStr,
      hideCatText: true,
      valText: displayValue,
      valIcon: valIcon,
      hideValText: typeStr === "Способ",
      sortOrder,
    };
  }

  /**
   * @param {any} p
   * @param {string | null} filterKey
   */
  isRowHighlighted(p, filterKey) {
    if (!filterKey) return false;
    const [dir, val] = filterKey.split("_");

    if (dir === "toCity")
      return p.transportTo?.city?.trim().toLowerCase() === val;
    if (dir === "firstName") return p.firstName?.trim().toLowerCase() === val;
    if (dir === "toDay") return p.transportTo?.day === val;
    if (dir === "fromDay") return p.transportFrom?.day === val;
    if (dir === "toTime") return p.transportTo?.time === val;
    if (dir === "fromTime") return p.transportFrom?.time === val;
    if (dir === "toSeats")
      return p.transportTo?.method === "Водитель" && !!p.transportTo?.seats;

    const actualMethod =
      dir === "to" ? p.transportTo?.method : p.transportFrom?.method;
    if (val === "Маршрутка" && actualMethod === "Трансфер") return true;
    return actualMethod === val;
  }

  /**
   * @param {any} p
   */
  isRowHighlightedAll(p) {
    if (Object.keys(this.activeFilters).length === 0) return false;
    for (const [group, filter] of Object.entries(this.activeFilters)) {
      if (!this.isRowHighlighted(p, `${group}_${filter.value}`)) return false;
    }
    return true;
  }

  /**
   * @param {any} p
   * @param {boolean} filterMode
   */
  isRowActiveOrHovered(p, filterMode) {
    if (Object.keys(this.activeFilters).length === 0 && !this.hoveredFilter)
      return false;

    if (Object.keys(this.activeFilters).length > 0) {
      for (const [group, filter] of Object.entries(this.activeFilters)) {
        if (!this.isRowHighlighted(p, `${group}_${filter.value}`)) return false;
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
    const [group, value] = filterKey.split("_");
    return this.activeFilters[group]?.value === value;
  }

  /** @param {string} filterKey */
  isFilterHoveredOrActive(filterKey) {
    if (this.hoveredFilter === filterKey) return true;
    return this.isFilterActive(filterKey);
  }
}
