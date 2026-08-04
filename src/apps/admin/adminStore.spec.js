import { describe, it, expect, beforeEach } from "vitest";
import { adminStore } from "./store.svelte.js";

describe("AdminStore Unit Tests", () => {
  beforeEach(() => {
    // Reset expenses to empty/initial state for clean testing
    adminStore.expenses = [];
    adminStore.fetchedParticipants = [];
  });

  it("should add a new expense", () => {
    expect(adminStore.expenses).toHaveLength(0);

    adminStore.addExpense({
      category: "Продукты питания",
      name: "Сок и вода",
      amount: 45.5,
      payer: "Алексей",
      comment: "Покупка в магазине",
    });

    expect(adminStore.expenses).toHaveLength(1);
    const added = adminStore.expenses[0];
    expect(added.category).toBe("Продукты питания");
    expect(added.name).toBe("Сок и вода");
    expect(added.amount).toBe(45.5);
    expect(added.payer).toBe("Алексей");
    expect(added.id).toBeDefined();
    expect(added.date).toBeDefined();
  });

  it("should delete an expense by id", () => {
    adminStore.addExpense({
      category: "Орг. расходы",
      name: "Аренда",
      amount: 100,
      payer: "Иван",
      comment: "",
    });

    const expId = adminStore.expenses[0].id;
    expect(adminStore.expenses).toHaveLength(1);

    adminStore.deleteExpense(expId);
    expect(adminStore.expenses).toHaveLength(0);
  });

  it("should update an existing expense", () => {
    adminStore.addExpense({
      category: "Алкоголь",
      name: "Вино",
      amount: 80,
      payer: "Ольга",
      comment: "",
    });

    const expId = adminStore.expenses[0].id;
    adminStore.updateExpense(expId, { amount: 120, comment: "Докупили 2 бутылки" });

    expect(adminStore.expenses[0].amount).toBe(120);
    expect(adminStore.expenses[0].comment).toBe("Докупили 2 бутылки");
  });

  it("should compute uniquePayers correctly with deduplication", () => {
    adminStore.expenses = [
      { id: "1", payer: "Иван" },
      { id: "2", payer: "анна" },
      { id: "3", payer: "ИВАН" },
    ];

    adminStore.fetchedParticipants = [
      { firstName: "Анна", lastName: "Иванова", nickname: "Anna" },
      { firstName: "Олег", nickname: "oleg" },
    ];

    const payers = adminStore.uniquePayers;
    expect(payers).toContain("Иван");
    expect(payers).toContain("анна");
    expect(payers).toContain("Иванова");
    expect(payers).toContain("Anna");
    expect(payers).toContain("Олег");
    // Case-insensitive deduplication check
    const lowerPayers = payers.map((p) => p.toLowerCase());
    const uniqueLower = new Set(lowerPayers);
    expect(lowerPayers.length).toBe(uniqueLower.size);
  });
});
