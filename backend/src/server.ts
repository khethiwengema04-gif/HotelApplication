import express, { Application, Request, Response } from "express"
import dotenv from 'dotenv';
import { testDbconnection } from './config/database';
import { initDb } from './config/dbTableConf';
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api', authRoutes);


const startServer = async () => {
    try {
        await testDbconnection();
        await initDb(); // Initialize the database tables

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        process.exit(1);
    }
};

startServer();
