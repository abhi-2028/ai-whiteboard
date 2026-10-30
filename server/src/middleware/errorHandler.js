const errorHandler = (err, req, res, next) => {
    const status = err.statusCode || 500;

    if(status === 500) {
        console.error("Internal Server Error:", err);
    }

    if(err.code === '23505') { // Unique violation error code for PostgreSQL
        return res.status(409).json({ message: 'Resource already exists' });
    }

    if(err.name === 'MulterError') { // Handle Multer file upload errors
        const message = err.code === 'LIMIT_FILE_SIZE' ? 'File size is too large (max 8 MB)' : err.message;
        return res.status(400).json({ message });
    }
    
    res.status(status).json({
        error: status >= 500 ? 'Internal Server Error' : err.message,
    });
}

const notFoundHandler = (req, res, next) => {
    res.status(404).json({ message: 'Resource not found' });
}

module.exports = {
    errorHandler,
    notFoundHandler
};