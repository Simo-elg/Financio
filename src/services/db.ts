// src/services/db.ts

import * as SQLite from 'expo-sqlite';
import { SQLiteDatabase } from 'expo-sqlite';

let db: SQLiteDatabase;

/**
 * Ouvre la base et crée la table Section si elle n'existe pas encore
 */
export async function initDB(): Promise<void> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('doneWithIt.db');
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Debitamount (
      amount REAL NOT NULL);`);

  // Création de la table Section
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Section (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      isCore INTEGER NOT NULL,
      monthlyBudget REAL NOT NULL,
      currentBalance REAL NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sectionId INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        note TEXT);`
    );
}

/**
 * Insère les sections de base si la table Section est vide
 */
export async function seedDefaultSections(): Promise<void> {
  // Vérifier le nombre de lignes
  const rows = await db.getAllAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM Section;'
  );
  const count = rows[0]?.count ?? 0;
  if (count === 0) {
    const defaultSections = [
      { name: 'Abonnements', isCore: 1 },
      { name: 'Food',        isCore: 1 },
      { name: 'Autres',      isCore: 1 }
    ];
    // Insertion des sections de base
    for (const section of defaultSections) {
      await db.runAsync(
        `INSERT INTO Section (name, isCore, monthlyBudget, currentBalance)
         VALUES (?, ?, 0, 0);`,
        section.name,
        section.isCore
      );
    }
  }
}

/**
 * Renvoie l'instance de la base, après initDB()
 */
export function getDB(): SQLiteDatabase {
  if (!db) throw new Error('Database not initialized. Call initDB() first.');
  return db;
}
