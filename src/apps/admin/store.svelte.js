import { GOOGLE_SCRIPT_URL } from "$shared/constants.js";
import { generateId } from "$shared/utils.js";

class AdminStore {
  /** @type {any[]} */
  expenses = $state([
    // Mock initial data
    {
      id: generateId("exp"),
      category: "Алкоголь",
      name: "Пиво и вино",
      amount: 150.5,
      payer: "Иван",
      comment: "Закупка на вечер",
      date: new Date().toISOString(),
    },
    {
      id: generateId("exp"),
      category: "Продукты",
      name: "Мясо на шашлыки",
      amount: 320.0,
      payer: "Анна",
      comment: "",
      date: new Date().toISOString(),
    },
    {
      id: generateId("exp"),
      category: "Орг. расходы",
      name: "Аренда колонок",
      amount: 50.0,
      payer: "Олег",
      comment: "",
      date: new Date().toISOString(),
    },
  ]);

  /** @type {any[]} */
  fetchedParticipants = $state([]);
  isLoadingParticipants = $state(false);

  /** @returns {string[]} */
  get uniquePayers() {
    /** @type {string[]} */
    const candidates = [];

    // 1. Payers from existing expenses
    for (const e of this.expenses) {
      if (e.payer) candidates.push(e.payer);
    }

    // 2. Names, surnames, and nicknames from fetched participants
    for (const p of this.fetchedParticipants) {
      if (p.firstName) candidates.push(p.firstName);
      if (p.lastName) candidates.push(p.lastName);
      if (p.nickname) candidates.push(p.nickname);
    }

    // Case-insensitive normalization & deduplication
    const map = new Map();
    for (const raw of candidates) {
      if (!raw) continue;
      const trimmed = String(raw).trim();
      if (!trimmed) continue;
      const lowerKey = trimmed.toLowerCase();
      if (!map.has(lowerKey)) {
        map.set(lowerKey, trimmed);
      }
    }

    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, "ru"));
  }

  async loadParticipants() {
    if (this.fetchedParticipants.length > 0) return; // already loaded
    this.isLoadingParticipants = true;
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      if (data.participants) {
        this.fetchedParticipants = data.participants;
      }
    } catch (e) {
      console.error("Error fetching participants for autocomplete:", e);
    } finally {
      this.isLoadingParticipants = false;
    }
  }

  /**
   * @param {Omit<any, "id" | "date">} expenseData
   */
  addExpense(expenseData) {
    this.expenses.push({
      ...expenseData,
      id: generateId("exp"),
      date: new Date().toISOString(),
    });
  }

  /**
   * @param {string} id
   * @param {Partial<any>} expenseData
   */
  updateExpense(id, expenseData) {
    const index = this.expenses.findIndex((e) => e.id === id);
    if (index !== -1) {
      this.expenses[index] = { ...this.expenses[index], ...expenseData };
    }
  }

  /**
   * @param {string} id
   */
  deleteExpense(id) {
    this.expenses = this.expenses.filter((e) => e.id !== id);
  }
}

export const adminStore = new AdminStore();
