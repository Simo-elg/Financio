import { getDB } from "./db";
import { SubSection } from "../models/SubSection"

export const subSectionService = {
    getAllBySection: async (sectionId: number): Promise<SubSection[]> => {
        const db = getDB();
        return db.getAllAsync<SubSection>(
            `SELECT * FROM SubSection WHERE sectionId = ?;`,
            sectionId
        );
    },

    getById: async (id: number): Promise<SubSection> => {
        const db = getDB();
        const rows = await db.getAllAsync<SubSection>(
            `SELECT * FROM SubSection WHERE id = ?;`,
            id
        );
        if (rows.length > 0) {
            return rows[0];
        }
        throw new Error(`Section with id ${id} not found`);
    },

    create: async (sub: Omit<SubSection, 'id'>): Promise<SubSection> => {
        try {
            const db = getDB();
            const res = await db.runAsync(
                `INSERT INTO SubSection (name, sectionId, isCore, monthlyBudget, currentBalance) VALUES (?, ?, ?, ?, ?);`,
                sub.name,
                sub.sectionId,
                sub.isCore,
                sub.monthlyBudget,
                sub.currentBalance
            );
            const id = (res as any).lastID
            console.log("✅ Sous-Section créée :", sub);
            return {id, ...sub};
        } catch (error) {
            console.error("❌ Erreur à l’insertion de la sous-section :", error);
            throw new Error("Failed to create subSection");
        }
        
    },

    updateBalance: async (id: number, delta: number) => {
        const db = getDB();
        await db.runAsync(
        `UPDATE SubSection
            SET currentBalance = currentBalance + ?
        WHERE id = ?;`,
        delta, id
        );
    },
}