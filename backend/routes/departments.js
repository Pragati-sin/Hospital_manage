const express = require('express');
const { getDepartments, createDepartment } = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, getDepartments)
    .post(protect, authorize('Admin'), createDepartment);

module.exports = router;
