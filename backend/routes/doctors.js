const express = require('express');
const { getDoctors, createDoctor, getAvailability } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, getDoctors)
    .post(protect, authorize('Admin'), createDoctor);

router.get('/:id/availability', protect, getAvailability);

module.exports = router;
