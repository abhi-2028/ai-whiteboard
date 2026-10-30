const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { resolveUserFromToken } = require("../utils/resolveUser");

const requireAuth = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization || "";

    console.log("Authorization header present:", !!header);

    const token = header.startsWith("Bearer ")
        ? header.slice(7).trim()
        : null;

    if (!token) {
        throw ApiError.unauthorized("Missing authentication token");
    }

    try {
        req.user = await resolveUserFromToken(token);
    } catch (err) {
        console.error("AUTHENTICATION ERROR:", err);
        throw err;
    }

    next();
});

module.exports = { requireAuth };
