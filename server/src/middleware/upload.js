const multer = require('multer');
const ApiError = require('../utils/ApiError');

const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new ApiError(400, 'Only image files can be uploaded'));
};

const uploadImage = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 8 * 1024 * 1024 // 8 MB
    }
}).single('image');

module.exports = {
    uploadImage
};