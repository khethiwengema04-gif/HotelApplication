import express, { Application, Request, Response } from "express"
import dotenv from 'dotenv';
// import { query } from './config/db';
import { testDbconnection } from './config/database';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await testDbconnection();

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        process.exit(1);
    }
};

startServer();
