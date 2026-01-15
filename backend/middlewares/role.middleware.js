const expressAsyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Roles = require('../enums/role.enum');

const role = (allowed) => {
    return expressAsyncHandler(async (req, res, next) => {
        let token;

        // Authenticate user via JWT token
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                req.user = await User.findById(decoded.userId).select('-password');
                
                if (!req.user) {
                    res.status(401).json({ message: 'User not found' });
                    return;
                }
                
                if (req.user.isBlocked) {
                    res.status(401).json({ message: 'Your account has been blocked' });
                    return;
                }
            } catch (error) {
                res.status(401).json({ message: 'Not authorized, token failed' });
                return;
            }
        } else {
            res.status(401).json({ message: 'Not authorized, no token' });
            return;
        }

        // Check role authorization if allowed roles are specified
        if (allowed && allowed.length > 0) {
            if (!allowed.includes(req.user.role)) {
                return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            }
        }
        
        next();
    });
};

module.exports = role;
