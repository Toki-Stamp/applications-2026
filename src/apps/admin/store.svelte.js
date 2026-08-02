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

  /** @type {string[]} */
  fetchedParticipantNames = $state([]);
  isLoadingParticipants = $state(false);

  /** @returns {string[]} */
  get uniquePayers() {
    const fromExpenses = this.expenses.map((e) => e.payer).filter(Boolean);
    const fromParticipants = this.fetchedParticipantNames;
    const allNames = [...fromExpenses, ...fromParticipants];
    const unique = [...new Set(allNames)];
    return unique.sort();
  }

  async loadParticipants() {
    if (this.fetchedParticipantNames.length > 0) return; // already loaded
    this.isLoadingParticipants = true;
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      if (data.participants) {
        this.fetchedParticipantNames = data.participants
          .map((/** @type {any} */ p) => p.firstName || p.nickname)
          .filter(Boolean);
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
