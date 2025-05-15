const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    console.log('=== Auth Middleware Start ===');
    console.log('Request path:', req.path);
    console.log('Request method:', req.method);
    console.log('Request cookies:', req.cookies);
    console.log('Authorization header:', req.headers.authorization);

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return next();
    }

    // Try to get token from various sources
    let token = null;

    // 1. Try cookie
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        console.log('Found token in cookie');
    }
    // 2. Try Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('Found token in Authorization header');
    }

    if (!token) {
        console.log('No token found in any source');
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'No valid authentication token found'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified for user:', decoded.username);
        req.user = decoded;

        // Refresh token in both cookie and header
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 3600000,
            path: '/'
        };

        res.cookie('token', token, cookieOptions);
        res.setHeader('Authorization', `Bearer ${token}`);

        console.log('=== Auth Middleware Success ===');
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return res.status(401).json({ 
            error: 'Invalid token',
            message: 'Your session has expired. Please log in again.'
        });
    }
}

module.exports = auth;