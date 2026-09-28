const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        default: 0
    },
    consultationFee: {
        type: Number,
        default: 0
    },
    availableDays: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    shiftStart: {
        type: String
    },
    shiftEnd: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
