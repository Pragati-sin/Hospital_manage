const { io } = require('socket.io-client');

const socket1 = io('http://localhost:5000');
const socket2 = io('http://localhost:5000');

const patientId = '6aba2e654afb7d4fd30f9921'; 
const receptionistId = '6aba2e654afb7d4fd30f9922';

console.log('Testing socket connection...');

socket1.on('connect', () => {
    console.log('[Patient] Connected');
    socket1.emit('join_chat', patientId);
    
    setTimeout(() => {
        console.log('[Patient] Sending message...');
        socket1.emit('send_message', {
            room: patientId,
            sender: patientId,
            content: 'Hello Reception! I need help with my appointment.',
            role: 'Patient'
        });
    }, 1000);
});

socket2.on('connect', () => {
    console.log('[Receptionist] Connected');
    socket2.emit('join_chat', patientId); // Receptionist joins patient's room
});

socket2.on('receive_message', (msg) => {
    console.log(`[Receptionist received] ${msg.role}: ${msg.content}`);
    
    if (msg.role === 'Patient') {
        setTimeout(() => {
            console.log('[Receptionist] Sending reply...');
            socket2.emit('send_message', {
                room: patientId,
                sender: receptionistId,
                content: 'Hello! I can certainly help you with that.',
                role: 'Receptionist'
            });
        }, 1000);
    }
});

socket1.on('receive_message', (msg) => {
    if (msg.role === 'Receptionist') {
        console.log(`[Patient received] ${msg.role}: ${msg.content}`);
        console.log('Bilateral communication successful!');
        process.exit(0);
    }
});
