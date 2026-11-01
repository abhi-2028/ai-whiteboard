
const { query } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { emitToBoard } = require("../realtime");
const { deleteUploadByUrl } = require("../utils/fileCleanup");

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// GET /api/whiteboards
const listBoards = asyncHandler(async (req, res) => {
    const { rows } = await query(
        `SELECT
            b.id,
            b.title,
            b.description,
            b.background,
            b.bg_color,
            b.owner_id,
            b.created_at,
            b.updated_at,
            (b.owner_id = $1) AS is_owner,
            COALESCE(cnt.n, 0)::int AS element_count

         FROM whiteboards b

         LEFT JOIN whiteboard_members m
            ON m.whiteboard_id = b.id
            AND m.user_id = $1

         LEFT JOIN (
            SELECT whiteboard_id, COUNT(*) AS n
            FROM elements
            GROUP BY whiteboard_id
         ) cnt ON cnt.whiteboard_id = b.id

         WHERE b.owner_id = $1 OR m.user_id = $1

         ORDER BY b.updated_at DESC`,
        [req.user.id]
    );

    res.json({ boards: rows });
});

// POST /api/whiteboards
const createBoard = asyncHandler(async (req, res) => {
    // 1. Get and validate title
    const title =
        (req.body.title || "").trim() || "Untitled whiteboard";

    // 2. Get description
    const description =
        (req.body.description || "").trim() || null;

    // 3. Validate background
    const background = ["dots", "grid", "plain"].includes(
        req.body.background
    )
        ? req.body.background
        : "dots";

    // 4. Validate background color
    const bg_color = HEX_RE.test(req.body.bg_color || "")
        ? req.body.bg_color
        : "#ffffff";

    // 5. Insert whiteboard into database
    const { rows } = await query(
        `INSERT INTO whiteboards
            (title, description, background, bg_color, owner_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [title, description, background, bg_color, req.user.id]
    );

    // 6. Return created whiteboard
    res.status(201).json({
        board: rows[0]
    });
});

// GET /api/whiteboards/:boardId
const getBoard = asyncHandler(async (req, res) => {

    // Fetch board, elements and members simultaneously
    const [boardRes, elementsRes, membersRes] = await Promise.all([
        
        // 1. Fetch whiteboard details
        query(
            "SELECT * FROM whiteboards WHERE id = $1",
            [req.board.id]
        ),

        // 2. Fetch all elements belonging to the board
        query(
            `SELECT id, type, data, z, created_by, updated_at
             FROM elements
             WHERE whiteboard_id = $1
             ORDER BY z ASC`,
            [req.board.id]
        ),

        // 3. Fetch owner and all board members
        query(
            `SELECT u.id, u.name, u.email, u.avatar_url, 'owner' AS role
             FROM whiteboards b
             JOIN users u ON u.id = b.owner_id
             WHERE b.id = $1

             UNION

             SELECT u.id, u.name, u.email, u.avatar_url, m.role
             FROM whiteboard_members m
             JOIN users u ON u.id = m.user_id
             WHERE m.whiteboard_id = $1`,
            [req.board.id]
        )
    ]);

    // Return complete whiteboard data
    res.json({
        board: {
            ...boardRes.rows[0],
            role: req.board.role
        },
        elements: elementsRes.rows,
        members: membersRes.rows
    });
});

// PATCH /api/whiteboards/:boardId
const updateBoard = asyncHandler(async (req, res) => {
    const fields = [];
    const values = [];
    let i = 1;

    // Update title
    if (req.body.title !== undefined) {
        const title = String(req.body.title).trim();

        if (!title) {
            throw ApiError.badRequest("Title cannot be empty");
        }

        fields.push(`title = $${i++}`);
        values.push(title);
    }

    // Update description
    if (req.body.description !== undefined) {
        fields.push(`description = $${i++}`);
        values.push(
            req.body.description === null
                ? null
                : String(req.body.description).trim()
        );
    }

    // Update background
    if (
        req.body.background !== undefined &&
        ["dots", "grid", "plain"].includes(req.body.background)
    ) {
        fields.push(`background = $${i++}`);
        values.push(req.body.background);
    }

    // Update background color
    if (req.body.bg_color !== undefined) {
        if (!HEX_RE.test(req.body.bg_color)) {
            throw ApiError.badRequest("Invalid background color");
        }

        fields.push(`bg_color = $${i++}`);
        values.push(req.body.bg_color);
    }

    if (fields.length === 0) {
        throw ApiError.badRequest("No valid fields to update");
    }

    // Update timestamp
    fields.push("updated_at = now()");

    // Add board ID as final SQL parameter
    values.push(req.board.id);

    const { rows } = await query(
        `UPDATE whiteboards
         SET ${fields.join(", ")}
         WHERE id = $${i}
         RETURNING *`,
        values
    );

    if (!rows[0]) {
        throw ApiError.notFound("Whiteboard not found");
    }

    // Notify connected collaborators
    emitToBoard(
        req.board.id,
        "board:updated",
        rows[0],
        req.get("x-socket-id")
    );

    res.json({
        board: rows[0]
    });
});

// DELETE /api/whiteboards/:boardId
const deleteBoard = asyncHandler(async (req, res) => {

    // Only the owner can delete a whiteboard
    if (req.board.role !== "owner") {
        throw ApiError.forbidden(
            "Only the owner can delete a whiteboard"
        );
    }
    const imgs = await query(
        `SELECT data FROM elements
         WHERE whiteboard_id = $1 AND type = 'image'`,
        [req.board.id]
    );

    await query(
        "DELETE FROM whiteboards WHERE id = $1",
        [req.board.id]
    );

    imgs.rows.forEach((r) => 
        deleteUploadByUrl(r.data?.src)
    );

    res.json({
        success: true
    });
});


// POST /api/whiteboards/:boardId/members
const addMember = asyncHandler(async (req, res) => {

    // Only the owner can share a whiteboard
    if (req.board.role !== "owner") {
        throw ApiError.forbidden(
            "Only the owner can share this whiteboard"
        );
    }

    // Get and normalize invitee email
    const email = String(req.body.email || "")
        .trim()
        .toLowerCase();

    // Validate role
    const role = ["editor", "viewer"].includes(req.body.role)
        ? req.body.role
        : "editor";

    if (!email) {
        throw ApiError.badRequest("An email is required");
    }

    // Find the user by email
    const userRes = await query(
        `SELECT id, name, email, avatar_url
         FROM users
         WHERE LOWER(email) = $1`,
        [email]
    );

    const invitee = userRes.rows[0];

    if (!invitee) {
        throw ApiError.notFound(
            "No user found with that email"
        );
    }

    // Prevent adding the owner as a member
    if (invitee.id === req.board.owner_id) {
        throw ApiError.badRequest(
            "The owner already has full access"
        );
    }

    // Add member or update their existing role
    await query(
        `INSERT INTO whiteboard_members
            (whiteboard_id, user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (whiteboard_id, user_id)
         DO UPDATE SET role = EXCLUDED.role`,
        [req.board.id, invitee.id, role]
    );

    // Prepare member information
    const member = {
        ...invitee,
        role
    };

    // Notify connected collaborators
    emitToBoard(
        req.board.id,
        "member:added",
        member
    );

    res.status(201).json({
        member
    });
});

// DELETE /api/whiteboards/:boardId/members/:userId
const removeMember = asyncHandler(async (req, res) => {

    // Only the owner can manage members
    if (req.board.role !== "owner") {
        throw ApiError.forbidden(
            "Only the owner can manage members"
        );
    }

    const userId = req.params.userId;

    if (!userId) {
        throw ApiError.badRequest("User ID is required");
    }

    // Prevent removing the board owner
    if (userId === req.board.owner_id) {
        throw ApiError.badRequest(
            "The board owner cannot be removed"
        );
    }

    // Remove member from whiteboard
    const result = await query(
        `DELETE FROM whiteboard_members
         WHERE whiteboard_id = $1 AND user_id = $2`,
        [req.board.id, userId]
    );

    if (result.rowCount === 0) {
        throw ApiError.notFound(
            "Member not found in this whiteboard"
        );
    }

    // Notify connected collaborators
    emitToBoard(
        req.board.id,
        "member:removed",
        { userId }
    );

    res.json({
        success: true
    });
});

module.exports = {
    listBoards,
    createBoard,
    getBoard,
    updateBoard,
    deleteBoard,
    addMember,
    removeMember
};
