import { getDB } from './db';
import { Section } from '../models/Section';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

/**
 * Service pour gérer les opérations CRUD sur la table Section
 */
export const sectionService = {
  /**
   * Récupère toutes les sections
   */
  getAll: async (): Promise<Section[]> => {
    const db = getDB();
    const rows = await db.getAllAsync<Section>(
      'SELECT * FROM Section;'
    );
    return rows;
  },

  /**
   * Récupère une section par son ID
   */
  getById: async (id: number): Promise<Section> => {
    const db = getDB();
    const rows = await db.getAllAsync<Section>(
      'SELECT * FROM Section WHERE id = ?;',
      id
    );
    if (rows.length > 0) {
      return rows[0];
    }
    throw new Error(`Section with id ${id} not found`);
  },

  updateBudget: async (id: number, monthlyBudget: number) => {
    const db = getDB();
    await db.runAsync(
        'UPDATE Section SET monthlyBudget = ? WHERE id = ?;',
        monthlyBudget,
        id
    );
  },

  updateBalance: async (id: number, delta: number) => {
    const db = getDB();
    await db.runAsync(
        'UPDATE Section SET currentBalance = currentBalance + ? WHERE id = ?;',
        delta,
        id
    )
  },

  deleteAll: async () => {
    const db = getDB();
    await db.runAsync('DELETE FROM Section;',);
    console.log("All sections deleted");
  },

  create: async (sec: Omit<Section, 'id'>): Promise<Section> => {
    try {
        const db = getDB();
        const result  = await db.runAsync(
            'INSERT INTO Section (name, isCore, monthlyBudget, currentBalance) VALUES (?, ?, ?, ?);',
            sec.name,
            sec.isCore,
            sec.monthlyBudget,
            sec.currentBalance
        ); 
        const id = (result as any).lastID;
        console.log("✅ Section créée :", sec);
        return { id, ...sec};
    } catch (error) {
        console.error("❌ Erreur à l’insertion de la section :", error);
        throw new Error("Failed to create section");
    } 
  },

  createDebitAmount: async ( amount: number ): Promise<void> => {
    const db = getDB();
    await db.runAsync(
        'INSERT INTO Debitamount (amount) VALUES (?);',
        amount
    );
  },

  getDebitAmount: async (): Promise<number> => {
    const db = getDB();
    // getAsync retourne un seul objet { amount: number } ou undefined
    const row = await db.getAllAsync<{ amount: number }>(
        `SELECT amount
        FROM Debitamount
        LIMIT 1;`
    );
    // Si pas de ligne, on renvoie 0 ou null selon ton besoin
    return row ? row[0].amount : 0;
    },

}