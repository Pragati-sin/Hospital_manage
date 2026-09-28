const express = require('express');
const { registerDoctor, getActiveSessions, getMessages } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register-doctor', protect, authorize('Admin', 'Receptionist'), registerDoctor);
router.get('/chat/sessions', protect, authorize('Receptionist', 'Admin'), getActiveSessions);
router.get('/chat/:roomId', protect, getMessages);

module.exports = router;
