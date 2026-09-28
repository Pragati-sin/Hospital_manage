const MedicalRecord = require('../models/MedicalRecord');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

exports.createRecord = async (req, res, next) => {
    try {
        req.body.doctor = (await Doctor.findOne({ user: req.user.id }))._id;
        
        const record = await MedicalRecord.create(req.body);
        res.status(201).json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

exports.getRecords = async (req, res, next) => {
    try {
        let query = {};
        if (req.user.role === 'Doctor') {
            const doctor = await Doctor.findOne({ user: req.user.id });
            if(doctor) query.doctor = doctor._id;
        } else if (req.user.role === 'Patient') {
            const patient = await Patient.findOne({ user: req.user.id });
            if(patient) query.patient = patient._id;
        }

        const records = await MedicalRecord.find(query)
            .populate({ path: 'patient', populate: { path: 'user', select: 'name' }})
            .populate({ path: 'doctor', populate: { path: 'user', select: 'name' }})
            .populate('appointment');

        res.status(200).json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};
