require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { errorHandler, notFoundHandler } = require("./src/middleware/errorHandler");

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

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;