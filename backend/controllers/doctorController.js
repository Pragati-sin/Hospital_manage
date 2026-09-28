const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

exports.getDoctors = async (req, res, next) => {
    try {
        let query = {};
        if (req.query.department) {
            query.department = req.query.department;
        }
        
        const doctors = await Doctor.find(query)
            .populate('user', 'name email phone')
            .populate('department', 'name');
            
        res.status(200).json({ success: true, count: doctors.length, data: doctors });
    } catch (error) {
        next(error);
    }
};

exports.createDoctor = async (req, res, next) => {
    try {
        const { name, email, password, phone, department, specialization, experience, consultationFee, availableDays, shiftStart, shiftEnd } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        user = await User.create({
            name, email, password, role: 'Doctor', phone
        });

        const doctor = await Doctor.create({
            user: user._id,
            department,
            specialization,
            experience,
            consultationFee,
            availableDays,
            shiftStart,
            shiftEnd
        });

        res.status(201).json({ success: true, data: doctor });
    } catch (error) {
        next(error);
    }
};

exports.getAvailability = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date } = req.query; // YYYY-MM-DD
        
        if (!date) {
            return res.status(400).json({ success: false, message: 'Please provide a date' });
        }

        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        const queryDate = new Date(date);
        const dayOfWeek = queryDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        if (!doctor.availableDays.includes(dayOfWeek)) {
            return res.status(200).json({ success: true, data: [] });
        }

        const generateTimeSlots = (start, end) => {
            const slots = [];
            let [startHour, startMin] = start.split(':').map(Number);
            let [endHour, endMin] = end.split(':').map(Number);
            
            let current = new Date(queryDate);
            current.setHours(startHour, startMin, 0, 0);
            
            let endTime = new Date(queryDate);
            endTime.setHours(endHour, endMin, 0, 0);

            while (current < endTime) {
                let next = new Date(current.getTime() + 30 * 60000);
                let slotStr = `${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}-${next.getHours().toString().padStart(2, '0')}:${next.getMinutes().toString().padStart(2, '0')}`;
                slots.push(slotStr);
                current = next;
            }
            return slots;
        };

        const allSlots = generateTimeSlots(doctor.shiftStart, doctor.shiftEnd);
        
        // Find booked slots (exclude cancelled)
        const startOfDay = new Date(queryDate.setHours(0,0,0,0));
        const endOfDay = new Date(queryDate.setHours(23,59,59,999));
        
        const bookedAppointments = await Appointment.find({
            doctor: id,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'Cancelled' }
        });

        const bookedSlots = bookedAppointments.map(app => app.timeSlot);
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

        res.status(200).json({ success: true, data: availableSlots });
    } catch (error) {
        next(error);
    }
};
