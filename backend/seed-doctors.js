const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Department = require('./models/Department');

const mockDoctors = [
    {
        name: 'Anya Sharma',
        specialization: 'Cardiology',
        profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2'
    },
    {
        name: 'Kenji Tanaka',
        specialization: 'Neurology',
        profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d'
    },
    {
        name: 'Elena Petrova',
        specialization: 'Pediatrics',
        profileImage: 'https://images.unsplash.com/photo-1594824436998-d876522c7eb1'
    },
    {
        name: 'Marcus Vance',
        specialization: 'General Surgery',
        profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7'
    }
];

const seedDoctors = async () => {
    try {
        console.log('Seeding mock doctors...');

        for (const doc of mockDoctors) {
            // Find or create department
            let department = await Department.findOne({ name: doc.specialization });
            if (!department) {
                department = await Department.create({ name: doc.specialization, description: `Department of ${doc.specialization}` });
                console.log(`Created department: ${department.name}`);
            }

            // Create user
            const email = `${doc.name.replace(/\s+/g, '').toLowerCase()}@hospital.com`;
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    name: doc.name,
                    email: email,
                    password: 'password123', // default password
                    role: 'Doctor',
                    profileImage: doc.profileImage
                });
                console.log(`Created user: ${user.name}`);

                // Create doctor profile
                await Doctor.create({
                    user: user._id,
                    department: department._id,
                    specialization: doc.specialization,
                    experience: Math.floor(Math.random() * 15) + 5,
                    consultationFee: Math.floor(Math.random() * 100) + 50,
                    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    shiftStart: '09:00',
                    shiftEnd: '17:00'
                });
                console.log(`Created doctor profile for: ${doc.name}`);
            } else {
                if(user.profileImage !== doc.profileImage) {
                    console.log(`Updating profile image for ${doc.name}...`);
                    user.profileImage = doc.profileImage;
                    await user.save();
                }
            }
        }

        console.log('Seeding complete!');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

module.exports = seedDoctors;
