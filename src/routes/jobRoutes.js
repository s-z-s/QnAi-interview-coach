const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer'); // Need multer here
const upload = multer({ storage: multer.memoryStorage() });

const {
    createJob,
    getJobs,
    getJob,
    deleteJob,
    generateQuestions,
    updateQuestionNotes,
    analyzePracticeAnswer,
    addQuestion
} = require('../controllers/jobController');

router.route('/')
    .get(protect, getJobs)
    .post(protect, createJob);

router.route('/:id')
    .get(protect, getJob)
    .delete(protect, deleteJob);

router.post('/:id/generate-questions', protect, generateQuestions);
router.post('/:id/add-question', protect, addQuestion);
router.put('/:id/questions', protect, updateQuestionNotes);
router.post('/practice', protect, upload.single('audio'), analyzePracticeAnswer);

module.exports = router;
