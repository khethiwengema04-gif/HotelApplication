import { Pool } from 'pg'
import dotenv from "dotenv"
import type { PoolClient } from 'pg';
import dns from "dns";
import net from "net";

dotenv.config()

dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamilyAttemptTimeout(5000);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 30000,
});

export const query = (text: string, params?: any[]) => pool.query(text, params)

export const testDbconnection = async () => {
    try {
        const client = await pool.connect()
        console.log('Database connection successful');
        client.release()
    } catch (error) {
        console.log('Unable to connect to the database:', error);
        process.getMaxListeners();
    }
}

//this function is for database transactions
export const withTransaction = async <T>(
    callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error("Transaction rollback failed:", rollbackError);
        }

        throw error;
    } finally {
        client.release();
    }
};
