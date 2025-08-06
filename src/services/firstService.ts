import { getDB } from './db';
import { Client } from '../models/Client';

export const firstService = {

    makeFClient: async (cl: Omit<Client, 'id'>): Promise<Client> => {
        try {
            const db = getDB();
            const result = await db.runAsync(
                'INSERT INTO Client (Name, Email, Password, Period) VALUES (?, ?, ?, ?);',
                cl.Name,
                cl.Email,
                cl.Password,
                cl.Period ?? ""
            );

            const rows = await db.getAllAsync<{ rid: number }>(
                'SELECT last_insert_rowid() AS rid;'
            );
            const id = rows[0].rid;
            console.log("✅ Client créée :", cl);
            console.log('ID du client: ', id);
            return { id, ...cl, Period: cl.Period ?? "" };

        } catch (err) {

            console.error("❌ Erreur à l’insertion du client :", err);
            throw new Error("Failed to create Client");

        }
    },

    getClient: async (id: number): Promise<Client> => {
        const db = getDB();

        // 1) On précise à getAllAsync le type des colonnes qui nous intéressent
        const rows = await db.getAllAsync<{
            id: number;
            Name: string;
            Email: string;
            Password: string;
        }>(
            `SELECT id, Name, Email, Password 
         FROM Client 
        WHERE id = ?;`,
            id
        );

        // 2) Si on n’a pas trouvé de client, on lève une erreur
        if (rows.length === 0) {
            throw new Error(`Client introuvable pour l’id ${id}`);
        }

        // 3) On extrait la première ligne et on renomme Name → name
        const row = rows[0];
        return {
            id: row.id,
            Name: row.Name,      // mapping du champ SQL “Name”
            Email: row.Email,
            Password: row.Password,
        };
    },

    getByCredendialts: async (email: string, pass: string): Promise<Client | null> => {

        const db = getDB();
        const rows = await db.getAllAsync<{ id: number, Name: string, Email: string, Password: string, Period: string }>(
            'SELECT id, Name, Email, Password, Period FROM Client WHERE Email = ? AND Password = ?;',
            email,
            pass
        );

        if (rows.length === 0) {
            return null;
        }

        const row = rows[0];
        return {
            id: row.id,
            Name: row.Name,
            Email: row.Email,
            Password: row.Password,
        };

    },

    makeFPeriod: async (id: number, Period: string) => {
        const db = getDB();
        await db.runAsync(
            'UPDATE Client SET Period = ? WHERE id = ?;',
            Period,
            id
        );
        console.log('Client id; ', id);
    },



}