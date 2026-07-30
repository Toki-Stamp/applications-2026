import { calculateEstimate } from "./utils/calculator.js";

// Простой генератор ID, безопасный для HTTP-соединений
function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
}

// Упрощенные мок-данные для разработки админки (пока скрипт не обновлен)
const mockParticipants = [
  {
    role: "Заявитель",
    nickname: "Booze",
    firstName: "Юрий",
    food: { type: "Да", fri: 1, sat: 2, sun: 1 },
    alcohol: { type: "Да", fri: 1, sat: 2, sun: 0 },
    accommodation: { type: "Бронь базы", friSat: 1, satSun: 1 }
  },
  {
    role: "Заявитель",
    nickname: "Vegan",
    firstName: "Алексей",
    food: { type: "Нет", fri: 0, sat: 0, sun: 0 },
    alcohol: { type: "Нет", fri: 0, sat: 0, sun: 0 },
    accommodation: { type: "Самостоятельно", friSat: 0, satSun: 0 }
  },
  {
    role: "Заявитель",
    nickname: "PartyAnimal",
    firstName: "Вася",
    food: { type: "Да", fri: 1, sat: 2, sun: 1 },
    alcohol: { type: "Да", fri: 1, sat: 2, sun: 1 },
    accommodation: { type: "Бронь базы", friSat: 1, satSun: 1 }
  }
];

export const adminStore = $state({
  expenses: [
    { id: uuid(), category: 'food', name: 'Мясо и овощи', amount: 15000 },
    { id: uuid(), category: 'alcohol', name: 'Пиво и вино', amount: 10000 },
    { id: uuid(), category: 'org', name: 'Аренда поляны и генератор', amount: 5000 }
  ],
  hiddenOrgPercentage: 100, // 100% размазывается
  riskMargin: 10, // 10% сверху на все
  participants: mockParticipants,
  loading: false,

  get estimate() {
    return calculateEstimate(
      this.participants,
      this.expenses,
      this.hiddenOrgPercentage,
      this.riskMargin
    );
  },

  addExpense(category, name, amount) {
    this.expenses.push({ id: uuid(), category, name, amount });
  },

  removeExpense(id) {
    this.expenses = this.expenses.filter(e => e.id !== id);
  }
});
