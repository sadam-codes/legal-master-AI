import { createServer } from 'http';
import app from './app.js';
import sync from './config/sync.js';
import sequelize from './models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Start server only after successful DB connection and sync
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully.");

        await sync(); // sync models
        console.log("✅ Models synced.");

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error starting server:", error);
    }
};

startServer();
