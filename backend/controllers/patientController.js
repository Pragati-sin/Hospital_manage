const Patient = require('../models/Patient');

exports.getPatients = async (req, res, next) => {
    try {
        const patients = await Patient.find().populate('user', 'name email phone');
        res.status(200).json({ success: true, count: patients.length, data: patients });
    } catch (error) {
        next(error);
    }
};

exports.getMyProfile = async (req, res, next) => {
    try {
        const patient = await Patient.findOne({ user: req.user.id }).populate('user', 'name email phone');
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }
        res.status(200).json({ success: true, data: patient });
    } catch (error) {
        next(error);
    }
};
