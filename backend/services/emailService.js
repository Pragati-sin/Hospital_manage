const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

exports.sendAppointmentConfirmation = async (patientEmail, doctorName, date, timeSlot) => {
    try {
        const transporter = createTransporter();
        const formattedDate = new Date(date).toLocaleDateString();
        
        const message = {
            from: `${process.env.SMTP_USER}`,
            to: patientEmail,
            subject: 'Appointment Confirmation',
            html: `
                <h1>Appointment Confirmed</h1>
                <p>Your appointment has been successfully confirmed.</p>
                <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${timeSlot}</p>
                <p>Thank you for choosing our services!</p>
            `
        };

        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Email could not be sent', error);
    }
};
