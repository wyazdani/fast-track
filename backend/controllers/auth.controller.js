const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { generateToken } = require("../utils");
const Roles = require("../enums/role.enum");

const createUser = expressAsyncHandler(async (req, res) => {
    // Check if user is admin
    if (!req.user || req.user.role !== Roles.ADMIN) {
        res.status(403).json({
            message: 'Only admin can create users'
        });
        return;
    }
    
    if (await User.findOne({ email: req.body.email?.toLowerCase().trim() })) {
        res.status(400).json({
            message: 'Email already exists'
        });
        return;
    }
    
    const user = await User.create(req.body);
    const token = generateToken(user._id, user.role);
    
    res.json({
        message: "User created successfully",
        user: {
            ...user.toJSON(),
            token,
        },
    });
});

const login = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        res.status(400).json({
            message: "Email and password are required",
        });
        return;
    }
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
        res.status(404).json({
            message: "User not found",
        });
        return;
    }
    
    if (user.isBlocked) {
        res.status(401).json({
            message: "Your account has been blocked",
        });
        return;
    }
    
    if (!(await user.isPasswordMatch(password))) {
        res.status(401).json({
            message: "Incorrect password",
        });
        return;
    }
    
    const token = generateToken(user._id, user.role);
    
    res.json({
        message: "Login successful",
        user: {
            ...user.toJSON(),
            token,
        },
    });
});

module.exports = {
    createUser,
    login,
};

