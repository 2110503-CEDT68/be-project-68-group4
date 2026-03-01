const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const Appointment = require('./models/Appointment');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
mongoose.connect(process.env.MONGO_URI);

const seedTestData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Appointment.deleteMany({});
    console.log('Cleared existing data'.red.inverse);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: '12345678',
      role: 'admin',
      tel: '0812345678'
    });
    console.log('Admin created'.green);

    // Create test user (user8)
    const user8 = await User.create({
      name: 'User Eight',
      email: 'user8@gmail.com',
      password: '12345678',
      role: 'user',
      tel: '0898765432'
    });
    console.log('User8 created'.green);

    // Import hospitals from CSV
    const fs = require('fs');
    const csvData = fs.readFileSync('./hospitals.csv', 'utf8');
    const lines = csvData.split('\n');
    
    const hospitals = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      if (values.length >= 8) {
        hospitals.push({
          name: values[1],
          address: values[2],
          district: values[3],
          province: values[4],
          postalcode: values[5],
          tel: values[6],
          region: values[7]
        });
      }
    }
    
    const createdHospitals = [];
    for (const hospital of hospitals) {
      try {
        const created = await Hospital.create(hospital);
        createdHospitals.push(created);
      } catch (err) {
        if (err.code === 11000) {
          // Skip duplicate
          continue;
        } else {
          throw err;
        }
      }
    }
    console.log(`${createdHospitals.length} hospitals imported`.green);

    // Find "ลาดพร้าว" hospital for appointments
    const ladprao = await Hospital.findOne({ name: 'ลาดพร้าว' });
    
    if (ladprao) {
      // Create 6 appointments for user8 at ลาดพร้าว hospital
      const appointments = [];
      const dates = [
        '2024-01-15T10:00:00.000Z',
        '2024-02-20T11:00:00.000Z',
        '2024-03-25T14:00:00.000Z',
        '2024-04-10T09:00:00.000Z',
        '2024-05-18T15:00:00.000Z',
        '2024-06-22T13:00:00.000Z'
      ];
      
      for (const date of dates) {
        appointments.push({
          apptDate: new Date(date),
          user: user8._id,
          hospital: ladprao._id
        });
      }
      
      await Appointment.insertMany(appointments);
      console.log(`6 appointments created for ลาดพร้าว hospital`.green);
    } else {
      console.log('ลาดพร้าว hospital not found'.yellow);
    }

    // Count statistics
    const bkkCount = await Hospital.countDocuments({ province: 'กรุงเทพมหานคร' });
    const ngCount = await Hospital.countDocuments({ province: { $gt: 'ง' } });
    const totalCount = await Hospital.countDocuments();
    const apptCount = await Appointment.countDocuments();

    console.log('\n=== Database Statistics ==='.cyan.bold);
    console.log(`Total hospitals: ${totalCount}`.cyan);
    console.log(`Bangkok hospitals: ${bkkCount}`.cyan);
    console.log(`Hospitals with province > 'ง': ${ngCount}`.cyan);
    console.log(`Total appointments: ${apptCount}`.cyan);
    console.log(`Appointments at ลาดพร้าว: ${ladprao ? 6 : 0}`.cyan);

    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`.red);
    console.error(err.stack);
    process.exit(1);
  }
};

seedTestData();
