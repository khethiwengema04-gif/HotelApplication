import fs from "fs";
import path from "path";
import { query } from "./database";

export const initDb = async () => {
    const sql = fs.readFileSync(path.join(__dirname, "../databaseTables/schema.sql"), "utf8");
    await query(sql);
    console.log("Database tables ready");
};