const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check for token in cookies
    // Note: cookie-parser is not installed, but if we want to read cookies we need it or parse req.headers.cookie manually. 
    // For simplicity without cookie-parser, let's also allow Bearer token in headers or parse cookie manually.

    if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';');
        const jwtCookie = cookies.find(c => c.trim().startsWith('jwt='));
        if (jwtCookie) {
            token = jwtCookie.split('=')[1];
        }
    }

    // Also check Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password_hash');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
