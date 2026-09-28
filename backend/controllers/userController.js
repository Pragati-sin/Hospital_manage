const User = require('../models/User');
const Doctor = require('../models/Doctor');

exports.registerDoctor = async (req, res, next) => {
    try {
        const { name, email, password, phone, profileImage, department, specialization, experience, consultationFee, availableDays, shiftStart, shiftEnd } = req.body;

        // Create User
        const user = await User.create({
            name,
            email,
            password,
            role: 'Doctor',
            phone,
            profileImage
        });

        // Create Doctor Profile
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

exports.getActiveSessions = async (req, res, next) => {
    // For Receptionist to get active chat sessions.
    // In a real app, this might query redis or distinct rooms from Messages today.
    // For now, we'll return a simple distinct list of users who sent messages today.
    try {
        const Message = require('../models/Message');
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const activeRooms = await Message.distinct('room', { timestamp: { $gte: today } });
        
        // Find users for these rooms
        const users = await User.find({ _id: { $in: activeRooms } }).select('name profileImage');
        
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

exports.getMessages = async (req, res, next) => {
    try {
        const Message = require('../models/Message');
        const messages = await Message.find({ room: req.params.roomId }).sort({ timestamp: 1 });
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
}
