
const { Server } = require("socket.io");
const { resolveUserFromToken } = require("../utils/resolveUser");
const { query } = require("../config/db");
const { setIo, boardRoom } = require("../realtime");

// Check whether a user owns or is a member of a whiteboard
const userCanAccessBoard = async (userId, boardId) => {
    const { rows } = await query(
        `SELECT 1
         FROM whiteboards b
         LEFT JOIN whiteboard_members m
            ON m.whiteboard_id = b.id
         WHERE b.id = $1
           AND (b.owner_id = $2 OR m.user_id = $2)
         LIMIT 1`,
        [boardId, userId]
    );

    return rows.length > 0;
};

const initSocket = (httpServer) => {

    // 1. Initialize Socket.IO server
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // 2. Authenticate every socket connection
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const user = await resolveUserFromToken(token);

            if (!user) {
                return next(new Error("Invalid token"));
            }

            socket.user = user;
            socket.data.user = user;

            next();

        } catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });

    // 3. Handle authenticated socket connections
    io.on("connection", (socket) => {

        const user = socket.user;

        console.log(`User connected: ${user.id}`);

        // JOIN WHITEBOARD
        socket.on("wb:join", async (boardId, ack) => {
            try {
                if (!boardId || typeof boardId !== "string") {
                    if (typeof ack === "function") {
                        ack({ ok: false, error: "Invalid whiteboard ID" });
                    }
                    return;
                }

                // Check database permissions
                const hasAccess = await userCanAccessBoard(
                    user.id,
                    boardId
                );

                if (!hasAccess) {
                    if (typeof ack === "function") {
                        ack({
                            ok: false,
                            error: "No access to this whiteboard"
                        });
                    }
                    return;
                }

                const room = boardRoom(boardId);
                const alreadyJoined = socket.rooms.has(room);

                // Join the whiteboard room
                socket.join(room);

                // Notify other collaborators only on a new join
                if (!alreadyJoined) {
                    socket.to(room).emit("presence:join", {
                        user: {
                            id: user.id,
                            name: user.name
                        },
                        boardId
                    });
                }

                // Get all connected sockets in this room
                const sockets = await io.in(room).fetchSockets();

                // Avoid duplicate users (e.g. multiple tabs)
                const seen = new Set([user.id]);
                const viewers = [];

                for (const s of sockets) {
                    const u = s.data.user;

                    if (!u || seen.has(u.id)) continue;

                    seen.add(u.id);

                    viewers.push({
                        id: u.id,
                        name: u.name
                    });
                }

                // Send current presence information to this socket
                socket.emit("presence:sync", {
                    boardId,
                    users: viewers
                });

                if (typeof ack === "function") {
                    ack({ ok: true });
                }

            } catch (error) {
                console.error("Whiteboard join error:", error);

                if (typeof ack === "function") {
                    ack({
                        ok: false,
                        error: "Failed to join whiteboard"
                    });
                }
            }
        });

        // LEAVE WHITEBOARD
        socket.on("wb:leave", (boardId) => {
            if (!boardId || typeof boardId !== "string") return;

            const room = boardRoom(boardId);

            // Leave only if this socket is actually in the room
            if (!socket.rooms.has(room)) return;

            socket.leave(room);

            socket.to(room).emit("presence:leave", {
                user: {
                    id: user.id,
                    name: user.name
                },
                boardId
            });
        });

        // BROADCAST CURSOR POSITION
        socket.on("presence:cursor", (payload) => {
            const { boardId, x, y } = payload || {};

            if (!boardId || typeof boardId !== "string") return;
            if (!Number.isFinite(x) || !Number.isFinite(y)) return;

            const room = boardRoom(boardId);

            // Only joined users can broadcast cursor positions
            if (!socket.rooms.has(room)) return;

            socket.to(room).emit("presence:cursor", {
                user: {
                    id: user.id,
                    name: user.name
                },
                x,
                y
            });
        });

        // BROADCAST LIVE ELEMENT CHANGES
        socket.on("element:live", (boardId, element) => {
            if (!boardId || typeof boardId !== "string") return;
            if (!element || typeof element !== "object") return;

            const room = boardRoom(boardId);

            // Only joined users can broadcast live changes
            if (!socket.rooms.has(room)) return;

            socket.to(room).emit("element:live", {
                element,
                by: user.id
            });
        });

        // HANDLE DISCONNECTION
        socket.on("disconnecting", () => {

            // Notify collaborators in every joined board room
            for (const room of socket.rooms) {

                // Every socket automatically belongs to its own room
                if (room === socket.id) continue;

                socket.to(room).emit("presence:leave", {
                    user: {
                        id: user.id,
                        name: user.name
                    }
                });
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`User disconnected: ${user.id}`, reason);
        });

    });

    // 4. Make Socket.IO instance available to other modules
    setIo(io);

    return io;
};

module.exports = { initSocket };
