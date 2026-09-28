const express = require('express');
const { createRecord, getRecords } = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .post(protect, authorize('Doctor'), createRecord)
    .get(protect, authorize('Doctor', 'Patient'), getRecords);

module.exports = router;
