require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");

const { errorHandler, notFoundHandler } = require("./src/middleware/errorHandler");
const apiRoutes = require("./src/routes");
const { initSocket } = require("./src/socket");

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json({ limit: "5mb" }));

app.get("/", (_req, res) => {
    res.json({ name: "AI Whiteboard Notes API", version: "1.0.0", status: "running" });
});

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);  

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
    console.log(`API + Socket.IO is running on port ${PORT}`);
});

module.exports = app;