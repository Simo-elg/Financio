import * as SQLite from 'expo-sqlite';
import { getDB, initDB } from './db';

export async function resetDBSoft(): Promise<void> {
  const db = getDB();
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM Client;
      DELETE FROM Debitamount;
      DELETE FROM Section;
      DELETE FROM SubSection;
      DELETE FROM Transactions;
    `);
    // reset des autoincrement
    await db.execAsync(`
      DELETE FROM sqlite_sequence
      WHERE name IN ('Client','Debitamount','Section','SubSection','Transactions');
    `);
  });
  console.log('✅ Soft reset DB terminé');
}

export async function resetDBHard(): Promise<void> {
  // Ferme la connexion si possible
  try { await (getDB() as any).closeAsync?.(); } catch {}

  // Supprime le fichier de base
  if ((SQLite as any).deleteDatabaseAsync) {
    await (SQLite as any).deleteDatabaseAsync('doneWithIt.db');
  } else {
    // Fallback : si indisponible, fais un soft reset
    await resetDBSoft();
    return;
  }

  // Recrée le schéma
  await initDB();
  console.log('✅ Hard reset DB terminé (fichier recréé)');
}
