import { getDB } from './db';
import { Section } from '../models/Section';
import * as SQLite from 'expo-sqlite';

/**
 * Service pour gérer les opérations CRUD sur la table Section
 */
export const sectionService = {
  /**
   * Récupère toutes les sections
   */
  getAll: async (clientId: number): Promise<Section[]> => {
    const db = getDB();
    const rows = await db.getAllAsync<Section>(
      'SELECT * FROM Section WHERE clientId = ?;',
      clientId
    );
    return rows;
  },

  /**
   * Récupère une section par son ID
   */
  getById: async (id: number, clientId: number): Promise<Section> => {
    const db = getDB();
    const rows = await db.getAllAsync<Section>(
      'SELECT * FROM Section WHERE id = ? AND clientId = ?;',
      id,
      clientId
    );
    if (rows.length > 0) {
      return rows[0];
    }
    throw new Error(`Section with id ${id} not found`);
  },

  updateBudget: async (id: number, monthlyBudget: number, clientId: number) => {
    const db = getDB();
    await db.runAsync(
      'UPDATE Section SET monthlyBudget = ? WHERE id = ? AND clientId = ?;',
      monthlyBudget,
      id,
      clientId
    );
  },

  updateBalance: async (id: number, delta: number, clientId: number) => {
    const db = getDB();

    await db.runAsync(
      'UPDATE Debitamount SET newAmount = newAmount + ? WHERE clientId = ?;',
      delta,
      clientId
    );

    await db.runAsync(
      'UPDATE Section SET currentBalance = currentBalance + ? WHERE id = ? AND clientId = ?;',
      delta,
      id,
      clientId
    );
  },

  deleteAll: async () => {
    const db = getDB();
    await db.runAsync('DELETE FROM Section;',);
    console.log("All sections deleted");
  },

  create: async (sec: Omit<Section, 'id'>): Promise<Section> => {
    try {
      const db = getDB();
      const result = await db.runAsync(
        'INSERT INTO Section (clientId, name, isCore, monthlyBudget, currentBalance, paymentD) VALUES (?, ?, ?, ?, ?, ?);',
        sec.clientId,
        sec.name,
        sec.isCore,
        sec.monthlyBudget,
        sec.currentBalance,
        sec.paymentD
      );
      const id = (result as any).lastID;
      console.log("✅ Section créée :", sec);
      return { id, ...sec };
    } catch (error) {
      console.error("❌ Erreur à l’insertion de la section :", error);
      throw new Error("Failed to create section");
    }
  },

  createDebitAmount: async (amount: number, id: number): Promise<void> => {
    const db = getDB();

    await db.runAsync(
      'INSERT INTO Debitamount (amount, clientId, newAmount) VALUES (?, ?, ?);',
      amount,
      id,
      amount
    );
    console.log("Le montant débit net est :", amount);
    console.log("Et le client id est: ", id);
  },

  getDebitAmount: async (clientId: number): Promise<number> => {
    const db = getDB();
    const sql = `
    SELECT amount
    FROM Debitamount
    WHERE clientId = ?
    ORDER BY id DESC
    LIMIT 1;
  `;
    const rows = await db.getAllAsync<{ amount: number }>(sql, [clientId]);
    return rows.length ? rows[0].amount : 0;
  },

  getTotalAmount: async (clientId: number): Promise<number> => {
    const db = getDB();

    const row = await db.getAllAsync<{ total: number }>(
      'SELECT SUM(currentBalance) AS total FROM Section WHERE clientId = ?;',
      clientId
    );

    return row[0]?.total ?? 0;
  },

}