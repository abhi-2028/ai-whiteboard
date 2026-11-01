const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const storage = require("../config/storage");
const { UPLOAD_DIR } = require("../config/uploads");

const EXT = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg"
};

const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw ApiError.badRequest("No image file provided");
    }

    const ext = EXT[req.file.mimetype] || "jpg";

    const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;

    let url;

    if (storage.isEnabled()) {
        url = await storage.putObject(
            `whiteboards/${filename}`,
            req.file.buffer,
            req.file.mimetype
        );
    } else {
        fs.writeFileSync(
            path.join(UPLOAD_DIR, filename),
            req.file.buffer
        );

        const base = process.env.PUBLIC_URL ||
            `${req.protocol}://${req.get("host")}`;

        url = `${base}/uploads/${filename}`;
    }

    res.status(201).json({
        url,
        filename,
        size: req.file.size
    });
});

module.exports = { uploadImage };