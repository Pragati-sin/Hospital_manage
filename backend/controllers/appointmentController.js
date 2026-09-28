const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { sendAppointmentConfirmation } = require('../services/emailService');

exports.createAppointment = async (req, res, next) => {
    try {
        const { doctor, department, date, timeSlot, reasonForVisit } = req.body;
        
        const patient = await Patient.findOne({ user: req.user.id });
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const appointment = await Appointment.create({
            patient: patient._id,
            doctor,
            department,
            date,
            timeSlot,
            reasonForVisit
        });

        res.status(201).json({ success: true, data: appointment });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'This time slot is already booked' });
        }
        next(error);
    }
};

exports.getAppointments = async (req, res, next) => {
    try {
        let query = {};
        
        if (req.user.role === 'Patient') {
            const patient = await Patient.findOne({ user: req.user.id });
            if(patient) query.patient = patient._id;
        } else if (req.user.role === 'Doctor') {
            const Doctor = require('../models/Doctor');
            const doctor = await Doctor.findOne({ user: req.user.id });
            if(doctor) query.doctor = doctor._id;
        }

        if (req.query.date) {
            const qDate = new Date(req.query.date);
            const startOfDay = new Date(qDate.setHours(0,0,0,0));
            const endOfDay = new Date(qDate.setHours(23,59,59,999));
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const appointments = await Appointment.find(query)
            .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' }})
            .populate({ path: 'doctor', populate: { path: 'user', select: 'name' }})
            .populate('department', 'name');

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true })
            .populate({ path: 'patient', populate: { path: 'user', select: 'email' }})
            .populate({ path: 'doctor', populate: { path: 'user', select: 'name' }});

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        if (req.body.status === 'Confirmed' && appointment.patient && appointment.patient.user && appointment.doctor && appointment.doctor.user) {
            await sendAppointmentConfirmation(
                appointment.patient.user.email,
                appointment.doctor.user.name,
                appointment.date,
                appointment.timeSlot
            );
        }

        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        next(error);
    }
};
