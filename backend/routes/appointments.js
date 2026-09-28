const express = require('express');
const { createAppointment, getAppointments, updateStatus } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .post(protect, authorize('Patient', 'Receptionist'), createAppointment)
    .get(protect, getAppointments);

router.patch('/:id/status', protect, authorize('Doctor', 'Admin', 'Receptionist'), updateStatus);

module.exports = router;
