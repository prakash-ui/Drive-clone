const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return next();
    }

    const token = req.cookies.token;
    console.log('Received token:', token); // Debug log

    if (!token) {
        console.log('No token found'); // Debug log
        return res.status(401).json({ error: 'No authentication token found' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully:', decoded); // Debug log
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification failed:', err); // Debug log
        return res.status(401).json({ 
            error: 'Invalid or expired token',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}

module.exports = auth;