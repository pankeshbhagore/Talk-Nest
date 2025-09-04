import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.route.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);


app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));


app.get("/home", (req, res) => {
    return res.json({ "hello": "world" });
});
app.use("/api/v1/users", userRoutes);


const start = async () => {
    try {
        const connectionDB = process.env.MONGO_URL;
        await mongoose.connect(connectionDB, {
        });
        console.log("MongoDB connected");

        const PORT = process.env.PORT || 8000;
        server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
    }
};

start();



















