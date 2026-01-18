const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        email,
        password_hash: hashedPassword,
    });

    if (user) {
        const token = generateToken(user._id);

        // Set HTTP-only cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Prevent CSRF
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        res.status(201).json({
            _id: user.id,
            email: user.email,
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
        const token = generateToken(user._id);

        // Set HTTP-only cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        res.json({
            _id: user.id,
            email: user.email,
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out' });
};

// ... (I will add imports at top if I can, but replacing the bottom block is easier if I include the functions there)
// Actually, I should check if pdf-parse is installed. The summary said it was.
// I'll add the functions before module.exports.

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user.id,
            email: user.email,
            cvText: user.cvText,
            jobDescription: user.jobDescription
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.jobDescription = req.body.jobDescription || user.jobDescription;
        user.cvText = req.body.cvText || user.cvText;

        // Handle PDF Upload
        if (req.file) {
            try {
                const pdfLibrary = require('pdf-parse');
                console.log("DEBUG: pdfLibrary type:", typeof pdfLibrary);
                console.log("DEBUG: pdfLibrary keys:", Object.keys(pdfLibrary));
                try {
                    console.log("DEBUG: pdfLibrary prototype:", Object.getPrototypeOf(pdfLibrary));
                } catch (e) { }

                // Try to find the function fallback
                let pdfParse = pdfLibrary;
                if (typeof pdfParse !== 'function') {
                    if (pdfLibrary.default && typeof pdfLibrary.default === 'function') {
                        pdfParse = pdfLibrary.default;
                    } else {
                        // If we can't find it, we throw, but the LOGS above are what I need the user to see in terminal
                        throw new Error(`pdf-parse broken. Keys: ${JSON.stringify(Object.keys(pdfLibrary))}`);
                    }
                }

                const data = await pdfParse(req.file.buffer);
                user.cvText = data.text;
            } catch (error) {
                console.error("PDF Parse Error", error);
                return res.status(400).json({
                    message: 'Failed to parse PDF: ' + (error.message || 'Unknown error'),
                    details: error.toString()
                });
            }
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser.id,
            email: updatedUser.email,
            cvText: updatedUser.cvText,
            jobDescription: updatedUser.jobDescription
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile
};
