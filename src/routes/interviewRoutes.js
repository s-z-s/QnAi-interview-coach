const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
    startSession,
    getSession,
    handleAnswer,
    endSession,
    getHistory,
    deleteSession
} = require('../controllers/interviewController');

// Configure Multer for memory storage (buffer is needed for ElevenLabs)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/session', protect, startSession);
router.get('/session/:id', protect, getSession);
router.post('/answer', protect, upload.single('audio'), handleAnswer);
router.post('/end', protect, endSession);
router.get('/history', protect, getHistory);
router.delete('/session/:id', protect, deleteSession);

module.exports = router;
