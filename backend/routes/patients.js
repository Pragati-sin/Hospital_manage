const express = require('express');
const { getPatients, getMyProfile } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('Admin', 'Receptionist'), getPatients);
router.get('/me', protect, authorize('Patient'), getMyProfile);

module.exports = router;
