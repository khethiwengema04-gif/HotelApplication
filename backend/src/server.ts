import express, { Application, Request, Response } from "express"
import dotenv from 'dotenv';
import { testDbconnection } from './config/database';
import { initDb } from './config/dbTableConf';
import authRoutes from "./routes/authRoutes";
import hotelRoutes from './routes/hotelsRoutes'
import cors from "cors";
import favouriteRoutes from "./routes/favouritesRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import roomRoutes from "./routes/roomRoutes"
import reviewRoutes from "./routes/reviewRoutes"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use('/api/users', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use("/api/favourites", favouriteRoutes);
app.use("/api/booking", bookingRoutes);
app.use("api/room", roomRoutes);
app.use("api/review", reviewRoutes);



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
