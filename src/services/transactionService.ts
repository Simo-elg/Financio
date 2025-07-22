import { Transaction } from "../models/Transaction";
import { getDB } from './db';

export const transactionService = {

    getBySection: async (sectionId: number): Promise<Transaction[]> => {
        const db = getDB();
        const rows = await db.getAllAsync<Transaction>(
            'SELECT * FROM Transactions WHERE sectionId = ?;',
            sectionId
        );
        return rows;
    },

    create: async (tx: Omit<Transaction, 'id'>): Promise<void> => {

        console.log("I'm here in transactionService.create");

        try {
            const db = getDB();
            await db.runAsync(
                `INSERT INTO Transactions (
                sectionId, type, amount, date, note
                ) VALUES (?, ?, ?, ?, ?);`,
                tx.sectionId,
                tx.type,
                tx.amount,
                tx.date,
                tx.note ?? null
            );
            console.log("✅ Transaction créée :", tx);
            } catch (error) {
            console.error("❌ Erreur à l’insertion de la transaction :", error);
            }
    },

    deleteAll: async () => {
        const db = getDB();
        await db.runAsync('DELETE FROM Transactions;',);
        console.log("All transactions deleted");
    },
};