const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(async () => {
    // Optionally seed database
    try {
        const seedDoctors = require('./seed-doctors');
        await seedDoctors();
    } catch (e) {
        console.log('Seeder not run or already seeded');
    }
});

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Route files
const auth = require('./routes/auth');
const departments = require('./routes/departments');
const doctors = require('./routes/doctors');
const patients = require('./routes/patients');
const appointments = require('./routes/appointments');
const medicalRecords = require('./routes/medicalRecords');

const users = require('./routes/users');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/departments', departments);
app.use('/api/doctors', doctors);
app.use('/api/patients', patients);
app.use('/api/appointments', appointments);
app.use('/api/medical-records', medicalRecords);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server Error'
    });
});

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const Message = require('./models/Message');

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_chat', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('send_message', async (data) => {
        const { room, sender, content, role } = data;
        
        try {
            // Save to DB
            const message = await Message.create({ room, sender, content, role });
            
            // Broadcast to room
            io.to(room).emit('receive_message', message);
            
            // If reception, might also broadcast globally to receptionists that there's a new message
            if (role === 'Patient') {
                io.emit('new_active_session', { room, sender, content, role, timestamp: message.timestamp });
            }
            
        } catch (error) {
            console.error('Socket message save error:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, console.log(`Server running on port ${PORT}`));
