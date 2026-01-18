const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile
} = require('../controllers/authController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser); // protect? Maybe not strictly needed if cookie based but good practice
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('resume'), updateProfile);

module.exports = router;
